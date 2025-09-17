# Happy Birthday — 3D Solar System Greeting

A React + Vite experience that renders an interactive 3D solar system as a birthday greeting. Click the Sun or any planet to smoothly focus the camera and follow it, with a galaxy background, bloom, and optional ambient music.

## Features

- Interactive Sun and planets with textures and realistic orbiting
- Smooth focus transitions and follow camera after selection
- Galaxy background, starfield feel, and bloom post‑processing
- Shooting star overlay animations
- Optional ambient audio (`public/textures/ambient.mp3`)
- Opening page with overlay message (React Router)

## Tech Stack

- React 19 + Vite 7
- three.js via `@react-three/fiber` and `@react-three/drei`
- Post‑processing via `@react-three/postprocessing` / `postprocessing`
- React Router 7
- Tailwind CSS 4
- Testing: Vitest + Testing Library (JSDOM)
- Tooling: ESLint 9, Prettier, Husky + lint-staged

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

## Scripts

- `npm run dev`: Start Vite dev server
- `npm run build`: Production build
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint
- `npm run format`: Prettier write
- `npm run test`: Run tests (Vitest)
- `npm run test:watch`: Run tests in watch mode

## Project Structure

- `src/pages/OpeningPage.jsx`: Landing page, renders scene and greeting overlay
- `src/components/Scene.jsx`: Canvas, camera controls, effects pipeline
- `src/components/SolarSystem.jsx`: Sun, planets, orbits, focus logic
- `src/components/PlanetGroup.jsx`: Groups planet meshes and their orbits
- `src/components/Sun.jsx`: Sun mesh and effects
- `src/components/Ring.jsx`: Saturn ring mesh
- `src/components/SpaceBackground.jsx`: Galaxy background/environment
- `src/components/ShootingStar*.jsx`: Shooting star visuals and overlay
- `src/components/OrbitGizmos.jsx`: Orbit helpers/gizmos for debugging
- `src/config/planets.config.js`: Sizes, orbit radii/speeds, textures
- `src/config/constants.js`: Misc scene constants
- `src/hooks/useFocusCamera.js`: Focus/track camera behavior
- `src/hooks/useAutoTour.js`: Automatic camera tour between bodies
- `src/test/`: Smoke/a11y tests and setup
- `public/textures/`: Planet textures, rings, galaxy background, ambient audio

## Configuration & Customization

- Greeting text: `src/pages/OpeningPage.jsx`
- Camera defaults/effects: `src/components/Scene.jsx`
- Planets, orbits, sizes: `src/config/planets.config.js`
- Ambient audio/backgrounds: `public/textures/`
- Camera behavior: `src/hooks/useFocusCamera.js`, `src/hooks/useAutoTour.js`

## Testing

- Run all tests:
  ```bash
  npm test
  ```
- Watch mode:
  ```bash
  npm run test:watch
  ```
  Tests include smoke tests for the scene and basic a11y checks.

## License

This project is for personal/learning/demo purposes.
