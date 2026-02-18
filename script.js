// splayTree.js

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
  
    // Right rotate
    rotateRight(x) {
      let y = x.left;
      if (!y) return;
      x.left = y.right;
      if (y.right) {
        y.right.parent = x;
      }
      y.parent = x.parent;
      if (!x.parent) {
        this.root = y;
      } else if (x === x.parent.right) {
        x.parent.right = y;
      } else {
        x.parent.left = y;
      }
      y.right = x;
      x.parent = y;
    }
  
    // Left rotate
    rotateLeft(x) {
      let y = x.right;
      if (!y) return;
      x.right = y.left;
      if (y.left) {
        y.left.parent = x;
      }
      y.parent = x.parent;
      if (!x.parent) {
        this.root = y;
      } else if (x === x.parent.left) {
        x.parent.left = y;
      } else {
        x.parent.right = y;
      }
      y.left = x;
      x.parent = y;
    }
  
    // Splay operation
    splay(x) {
      if (!x) return;
      while (x.parent) {
        if (!x.parent.parent) {
          // Zig step
          if (x.parent.left === x) {
            this.rotateRight(x.parent);
          } else {
            this.rotateLeft(x.parent);
          }
        } else if (x.parent.left === x && x.parent.parent.left === x.parent) {
          // Zig-Zig (Left-Left)
          this.rotateRight(x.parent.parent);
          this.rotateRight(x.parent);
        } else if (x.parent.right === x && x.parent.parent.right === x.parent) {
          // Zig-Zig (Right-Right)
          this.rotateLeft(x.parent.parent);
          this.rotateLeft(x.parent);
        } else if (x.parent.left === x && x.parent.parent.right === x.parent) {
          // Zig-Zag (Left-Right)
          this.rotateRight(x.parent);
          this.rotateLeft(x.parent);
        } else if (x.parent.right === x && x.parent.parent.left === x.parent) {
          // Zig-Zag (Right-Left)
          this.rotateLeft(x.parent);
          this.rotateRight(x.parent);
        }
      }
    }
  
    // Search
    search(key) {
      let x = this.root;
      let prev = null;
  
      while (x) {
        prev = x;
        if (key < x.key) {
          x = x.left;
        } else if (key > x.key) {
          x = x.right;
        } else {
          // Key found
          this.splay(x);
          return x;
        }
      }
      // Not found, splay the last accessed node
      if (prev) this.splay(prev);
      return null;
    }
  
    // Insert
    insert(key) {
      if (!this.root) {
        this.root = new Node(key);
        return;
      }
  
      let x = this.root;
      let parent = null;
  
      while (x) {
        parent = x;
        if (key < x.key) {
          x = x.left;
        } else if (key > x.key) {
          x = x.right;
        } else {
          // Key already in the tree, splay it
          this.splay(x);
          return;
        }
      }
  
      let newNode = new Node(key);
      newNode.parent = parent;
      if (key < parent.key) {
        parent.left = newNode;
      } else {
        parent.right = newNode;
      }
      this.splay(newNode);
    }
  
    // Delete
    delete(key) {
      let node = this.search(key);
      if (!node || node.key !== key) {
        // Key not found
        return;
      }
      // node is now splayed to root
      // Split the tree into two subtrees: left and right
      let leftSubtree = node.left;
      let rightSubtree = node.right;
  
      if (leftSubtree) {
        leftSubtree.parent = null;
      }
      if (rightSubtree) {
        rightSubtree.parent = null;
      }
  
      // Clear the root reference
      this.root = null;
  
      // If left subtree exists, find max in leftSubtree, splay it, and attach rightSubtree
      if (leftSubtree) {
        this.root = leftSubtree;
        // Find max in leftSubtree
        let maxNode = leftSubtree;
        while (maxNode.right) {
          maxNode = maxNode.right;
        }
        this.splay(maxNode);
        // Attach right subtree
        maxNode.right = rightSubtree;
        if (rightSubtree) {
          rightSubtree.parent = maxNode;
        }
      } else {
        // Only right subtree
        this.root = rightSubtree;
      }
    }
  
    // Build Cytoscape elements for visualization
    getCytoscapeElements() {
      let elements = [];
      // Perform BFS on the tree to build elements
      if (!this.root) return elements;
  
      let queue = [this.root];
      while (queue.length > 0) {
        let current = queue.shift();
        elements.push({
          data: { id: `n${current.key}`, label: current.key.toString() }
        });
  
        if (current.left) {
          elements.push({
            data: {
              id: `e${current.key}-${current.left.key}`,
              source: `n${current.key}`,
              target: `n${current.left.key}`
            }
          });
          queue.push(current.left);
        }
  
        if (current.right) {
          elements.push({
            data: {
              id: `e${current.key}-${current.right.key}`,
              source: `n${current.key}`,
              target: `n${current.right.key}`
            }
          });
          queue.push(current.right);
        }
      }
      return elements;
    }
  }
  