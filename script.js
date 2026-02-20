class Node {
  constructor(key) {
    this.key = key;
    this.left = null;
    this.right = null;
    this.parent = null;
  }
}

class SplayTree {
  constructor() {
    this.root = null;
  }

  rotateRight(x) {
    let y = x.left;
    if (!y) return;
    x.left = y.right;
    if (y.right) y.right.parent = x;
    y.parent = x.parent;
    if (!x.parent) this.root = y;
    else if (x === x.parent.right) x.parent.right = y;
    else x.parent.left = y;
    y.right = x;
    x.parent = y;
  }

  rotateLeft(x) {
    let y = x.right;
    if (!y) return;
    x.right = y.left;
    if (y.left) y.left.parent = x;
    y.parent = x.parent;
    if (!x.parent) this.root = y;
    else if (x === x.parent.left) x.parent.left = y;
    else x.parent.right = y;
    y.left = x;
    x.parent = y;
  }

  splay(x) {
    if (!x) return;
    while (x.parent) {
      if (!x.parent.parent) {
        if (x.parent.left === x) this.rotateRight(x.parent);
        else this.rotateLeft(x.parent);
      } else if (x.parent.left === x && x.parent.parent.left === x.parent) {
        this.rotateRight(x.parent.parent);
        this.rotateRight(x.parent);
      } else if (x.parent.right === x && x.parent.parent.right === x.parent) {
        this.rotateLeft(x.parent.parent);
        this.rotateLeft(x.parent);
      } else if (x.parent.left === x && x.parent.parent.right === x.parent) {
        this.rotateRight(x.parent);
        this.rotateLeft(x.parent);
      } else if (x.parent.right === x && x.parent.parent.left === x.parent) {
        this.rotateLeft(x.parent);
        this.rotateRight(x.parent);
      }
    }
  }

  search(key) {
    let x = this.root;
    let prev = null;
    while (x) {
      prev = x;
      if (key < x.key) x = x.left;
      else if (key > x.key) x = x.right;
      else { this.splay(x); return x; }
    }
    if (prev) this.splay(prev);
    return null;
  }

  insert(key) {
    if (!this.root) { this.root = new Node(key); return true; }
    let x = this.root, parent = null;
    while (x) {
      parent = x;
      if (key < x.key) x = x.left;
      else if (key > x.key) x = x.right;
      else { this.splay(x); return false; }
    }
    let nn = new Node(key);
    nn.parent = parent;
    if (key < parent.key) parent.left = nn;
    else parent.right = nn;
    this.splay(nn);
    return true;
  }

  delete(key) {
    let node = this.search(key);
    if (!node || node.key !== key) return false;
    let left = node.left, right = node.right;
    if (left) left.parent = null;
    if (right) right.parent = null;
    this.root = null;
    if (left) {
      this.root = left;
      let m = left;
      while (m.right) m = m.right;
      this.splay(m);
      m.right = right;
      if (right) right.parent = m;
    } else {
      this.root = right;
    }
    return true;
  }
}

/* ── TreeRenderer — draws a SplayTree on a <canvas> using rough.js ── */

class TreeRenderer {
  constructor(canvas, opts = {}) {
    this.canvas   = canvas;
    this.nodeFill = opts.nodeFill  || '#aa6f73';
    this.edgeClr  = opts.edgeColor || '#66545e';
    this.textClr  = opts.textColor || '#fff';
    this.hlColor  = opts.highlightColor || '#f6e0b5';
    this.paperBg  = opts.paperBg   || '#faf6ee';
    this.pad      = opts.padding   || 50;
    this.rough    = opts.roughness || 1.5;
    this.radius   = opts.nodeRadius || 22;
    this.paper    = opts.showPaper !== false;
    this._hl      = null;
  }

  render(root) {
    const dpr = window.devicePixelRatio || 1;
    const { width: w, height: h } = this.canvas.getBoundingClientRect();
    if (w < 1 || h < 1) return;

    this.canvas.width  = w * dpr;
    this.canvas.height = h * dpr;
    const ctx = this.canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = this.paperBg;
    ctx.fillRect(0, 0, w, h);
    if (this.paper) this._drawPaper(ctx, w, h);
    if (!root) return;

    const rc   = rough.canvas(this.canvas);
    const raw  = this._inorder(root);
    const pts  = this._fit(raw, w, h);
    this._drawEdges(rc, pts);
    this._drawNodes(rc, ctx, pts);
  }

  highlight(key)   { this._hl = key; }
  clearHighlight() { this._hl = null; }

  _inorder(root) {
    const m = {};
    let i = 0;
    (function walk(n, d) {
      if (!n) return;
      walk(n.left, d + 1);
      m[n.key] = { ix: i++, depth: d, node: n };
      walk(n.right, d + 1);
    })(root, 0);
    return m;
  }

  _fit(raw, w, h) {
    const ents = Object.entries(raw);
    if (!ents.length) return {};
    if (ents.length === 1) {
      const [k, p] = ents[0];
      return { [k]: { x: w / 2, y: h * 0.35, node: p.node } };
    }

    let ixMin = Infinity, ixMax = -Infinity, dMin = Infinity, dMax = -Infinity;
    for (const [, p] of ents) {
      ixMin = Math.min(ixMin, p.ix);  ixMax = Math.max(ixMax, p.ix);
      dMin  = Math.min(dMin, p.depth); dMax  = Math.max(dMax, p.depth);
    }

    const spanX = ixMax - ixMin || 1;
    const spanY = (dMax - dMin) * 1.4 || 1;
    const avail = { w: w - 2 * this.pad, h: h - 2 * this.pad };
    const sc = Math.min(avail.w / spanX, avail.h / spanY);
    const tw = spanX * sc, th = spanY * sc;
    const ox = (w - tw) / 2, oy = (h - th) / 2;

    const out = {};
    for (const [k, p] of ents) {
      out[k] = {
        x: ox + (p.ix - ixMin) * sc,
        y: oy + (p.depth - dMin) * 1.4 * sc,
        node: p.node,
      };
    }
    return out;
  }

  _drawPaper(ctx, w, h) {
    ctx.save();
    ctx.strokeStyle = 'rgba(102,84,94,0.07)';
    ctx.lineWidth = 1;
    for (let y = 28; y < h; y += 28) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(170,111,115,0.12)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(36, 0); ctx.lineTo(36, h); ctx.stroke();
    ctx.restore();
  }

  _drawEdges(rc, pts) {
    const opts = { stroke: this.edgeClr, strokeWidth: 2, roughness: this.rough };
    for (const [, s] of Object.entries(pts)) {
      const n = s.node;
      if (n.left  && pts[n.left.key])  rc.line(s.x, s.y, pts[n.left.key].x,  pts[n.left.key].y,  opts);
      if (n.right && pts[n.right.key]) rc.line(s.x, s.y, pts[n.right.key].x, pts[n.right.key].y, opts);
    }
  }

  _drawNodes(rc, ctx, pts) {
    const r  = this.radius;
    const fs = Math.max(11, Math.round(r * 0.8));
    for (const [k, s] of Object.entries(pts)) {
      const isHl = this._hl !== null && +k === this._hl;
      rc.circle(s.x, s.y, r * 2, {
        fill: isHl ? this.hlColor : this.nodeFill,
        fillStyle: 'solid',
        stroke: this.edgeClr,
        strokeWidth: 2,
        roughness: this.rough * 0.7,
      });
      ctx.save();
      ctx.font = `bold ${fs}px "Patrick Hand",cursive`;
      ctx.fillStyle = this.textClr;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(k), s.x, s.y + 1);
      ctx.restore();
    }
  }
}
