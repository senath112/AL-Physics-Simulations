# Senath Sethmika A/L Physics Simulations

An advanced, interactive suite of physics simulations tailored for the Sri Lankan G.C.E. Advanced Level physics curriculum. Designed with high-fidelity visual renderers, modern glassmorphic aesthetics, and real-time physical solvers.

---

## 🚀 Key Simulation Modules

### 1. Mechanics & Dynamics Suite
- **Newton's Laws Simulator**: Multi-body connected strings and pulleys system. Drag and drop bodies when paused to set custom coordinate states. The simulation automatically stops and transitions to a resting state or logs graphs when limits are hit.
- **Friction on an Inclined Plane**: Visualizes kinetic and static friction coefficients ($\mu_s$, $\mu_k$) acting on an inclined wedge. Includes real-time vector resolution diagrams.
- **Projectile Motion**: Real-time trajectory plotting using gravity constants ($g = 10 \text{ m/s}^2$).

### 2. Geometrical Optics Explainer Suite
- **Reflection Mode**: Demonstrates the mirror reflection law ($\theta_i = \theta_r$) with sloped mirror backing indicators and a clean single-medium view.
- **Refraction & Snell's Law**: Real-time refraction tracking ($n_1 \sin\theta_1 = n_2 \sin\theta_2$) with presets for **Air (1.00)**, **Water (1.33)**, and **Glass (1.50)**. Includes a toggle to hide or show the faint reflection ray.
- **Total Internal Reflection (TIR)**: Computes and marks critical angle limits ($\theta_c$). Auto-switches between refraction and reflection states dynamically.
- **Optical Fibre Guide**: Multi-bounce ray tracing inside step-index core/cladding layers. Demonstrates guided modes and leakage when core index is set less than cladding index ($n_{\text{core}} \le n_{\text{cladding}}$).

---

## 🛠️ Advanced Features & UI Features

- **Retina High-DPI Canvas Rendering**: Auto-scales backing canvases relative to `window.devicePixelRatio` for crystal-clear ray tracing and label presentation.
- **Explain Mode**: Overlay panels rendering KaTeX LaTeX equations mapped to real-time physical variables.
- **Snell's Law Graphing**: Real-time Plotly.js charts mapping grazing incidence vs. refraction angles.
- **Lab Notebook & PDF Logging**: Write observations and download detailed PDF lab logs containing parameters and logged snapshots.
- **Interactive Cursor Dragging**: Pause simulations to grab and adjust laser handles or masses.

---

## 💻 Tech Stack

- **Framework**: React 18, TypeScript, Vite
- **Styling**: TailwindCSS, Vanilla CSS, Lucide Icons
- **Math Rendering**: KaTeX
- **Graphing Engine**: Plotly.js
- **PDF Export**: jsPDF

---

## ⚡ Running Locally

To launch the project in your local development environment:

1. Clone or navigate to the repository directory:
   ```bash
   cd /Users/senathsethmika/Desktop/Physics/Simulations
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build production bundle:
   ```bash
   npm run build
   ```

---
*© 2026 Senath Sethmika. All Rights Reserved. Developed for Advanced Level Physics education.*
