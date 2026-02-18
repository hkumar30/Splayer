# Splayer

An interactive web application for learning and practicing Splay Trees - a self-adjusting binary search tree.

Try it here: https://splayer-game.netlify.app/

This project visualizes tree rotations in real time and challenges users to match a reference tree across multiple levels while tracking performance on a live leaderboard.

## Overview

This application combines:

- A full implementation of a Splay Tree (insert, search, delete, and splay operations)
- Real-time tree visualization using Cytoscape.js
- A leaderboard with real-time updates (created via Firestore)

## Why I Built This

I struggled with Splay Trees. The different rotation cases felt easy to confuse when reading them statically on paper.

So I built Splayer to practice my skills and test my understanding of the data structure.

What started as a visualizer turned into a game with scoring and a leaderboard system. The backend is powered by Firebase and Firestore.

Building this helped me understand the data structure far better than passive study ever did.

## Objective

The goal is simple:

Understand how splaying dynamically restructures a tree and how rotations change its shape.

Each level provides a predefined sequence of insertions that builds a reference tree.

You interact with your own tree using:

- Insert  
- Search  
- Delete  

Every operation triggers a splay, moving the accessed node to the root through rotations.

Your objective is to match the structure of the reference tree exactly.

When both trees are structurally identical:

- The level is completed  
- Points are awarded  
- Your score is submitted to the leaderboard  

## Stack Used

- HTML5  
- CSS3  
- Vanilla JavaScript  
- Cytoscape.js  
- Firebase  
- Firestore  

## Data Structure Implementation

The project includes a complete Splay Tree implementation:

- `Node` class (key, left, right, parent)
- `rotateLeft`
- `rotateRight`
- `splay`
  - Zig
  - Zig-Zig
  - Zig-Zag
- `insert`
- `search`
- `delete`

Splaying moves recently accessed elements closer to the root.

Over a sequence of operations, this results in **O(log n)** amortized time complexity.

## Contributions

Contributions are welcome.

If you would like to improve the UI, add new levels, optimize the tree implementation, or enhance the leaderboard system, feel free to open an issue or submit a pull request.