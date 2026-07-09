// =============================================================================
// (c) Copyright Sanskar Yadav. All rights reserved.
// Made by the Sanskar Yadav.
// 
// Follow Sanskar or Creater on:-
// GitHub:- https://www.github.com/Sanskar-in
// LinkedIn:- https://www.linkedin.com/in/sanskar-in
// X (Formally known as Twitter):- https://www.x.com/Sanskar_in
// Source will available at the GitHub:- https://www.github.com/Sanskar-in/Sanskar-PDF-Editor
// Need support:- supportramsandesh@gmail.com
// Want to make your own apps, websites, games, or anything else via Sanskar:- sanskaryadavfrom2012to2026@gmail.com
// =============================================================================

<!-- =============================================================================
(c) Copyright Sanskar Yadav. All rights reserved.
Made by the Sanskar Yadav.
Purpose: Documentation file explaining aspects of Sanskar's PDF Editor.
============================================================================= -->

# 07 - Glassmorphism UI Design

The visual identity of Sanskar's PDF Editor is heavily inspired by modern "Glassmorphism" trends.

## The Aesthetic
Glassmorphism relies on the illusion of depth, frosted glass, and multi-layered rendering.
- **Base Background**: We use a very deep, dark slate canvas (`bg-slate-950`).
- **The Glass Panels**: Any card, toolbar, or sidebar is rendered with a custom `.glass-panel` class.

## The CSS Magic
In `index.css`, the `.glass-panel` class is defined as:
```css
.glass-panel {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}
```
- `rgba` provides the semi-transparent base.
- `backdrop-filter: blur(16px)` tells the browser compositing engine to aggressively blur whatever DOM elements are physically rendered *behind* this div, creating the frosted glass effect.
- The 1px highly-transparent white border simulates the physical edge of a glass pane catching the light.

## Framer Motion
To prevent the UI from feeling static, we wrap elements in `<motion.div>` or `<motion.button>`. Hovering over a tool card scales it up by 3% (`whileHover={{ scale: 1.03 }}`), giving the user immediate, tactile feedback.

