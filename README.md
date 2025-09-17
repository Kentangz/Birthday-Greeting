# Happy Birthday — 3D Solar System Greeting

A React + Vite web experience that renders an interactive 3D solar system as a birthday greeting. Click on the Sun or any planet to smoothly focus the camera and follow it, while a starry background and subtle bloom complete the scene.

## Features

- Interactive Sun and planets with textures and axial tilt
- Smooth focus animation and chase camera after selection
- Cinematic starfield, galaxy background environment, and bloom
- Decorative "shooting star" orbital trails
- React Router with a single opening page and overlay message

## Tech Stack

- React 19, Vite 7
- three.js via @react-three/fiber and @react-three/drei
- Post-processing via @react-three/postprocessing
- React Router (react-router-dom)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run in development mode:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```
4. Preview the production build:
   ```bash
   npm run preview
   ```

## Project Structure

- `src/pages/OpeningPage.jsx`: Main page, renders the 3D scene and overlay text
- `src/components/Scene.jsx`: Sets up the Canvas, camera controls, effects
- `src/components/SolarSystem.jsx`: Sun + planets, orbits, camera focus logic
- `src/components/Planet.jsx`: Planet mesh, rotation, optional ring
- `src/components/SpaceBackground.jsx`: Galaxy background and environment map
- `public/textures/`: Planet textures, Saturn ring, galaxy background

## Customization

- Update the greeting text in `src/pages/OpeningPage.jsx`
- Adjust camera defaults and effects in `src/components/Scene.jsx`
- Tweak orbit radii/speeds and sizes in `src/components/SolarSystem.jsx`

## License

This project is for personal/learning/demo purposes.
