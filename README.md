# Image Compressor Website

Compress images in your browser — same UI design as PDF Splitter (dark theme, cards, dropzone). No uploads; all processing happens locally.

## Setup (npm)

```bash
npm install
```

## Run locally

```bash
npm run dev
```

Opens at `http://localhost:5173` (Vite dev server).

## Build for deploy

```bash
npm run build
```

Output is in `dist/`. Deploy that folder to GitHub Pages, Netlify, or any static host.

## Preview production build

```bash
npm run preview
```

## Features

- **Drag & drop** — drop an image or click to choose
- **Settings** — quality, max width, max height
- **Preview** — original vs compressed, file sizes, reduction %
- **Download** — save compressed image
- **Privacy** — everything runs in the browser; no uploads

## Tech

- **Vite** — dev server + build
- **browser-image-compression** — client-side compression
- Same design as PDF Splitter: dark gradient, logo, card, dropzone, panels, status

## Privacy

All processing happens locally. Your images are never uploaded.
