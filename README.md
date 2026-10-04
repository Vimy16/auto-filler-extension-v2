# Auto Fill Assistant v2

A modernized browser extension rebuilt in React, Material UI, and TanStack Query.

## Stack
- React
- Vite
- Material UI
- TanStack Query
- Chrome Extension Manifest V3

## Getting started

1. Install dependencies:
   npm install
2. Start the popup in development mode:
   npm run dev
3. Build the extension bundle:
   npm run build
4. Open Chrome and load the unpacked extension from the generated `dist` folder:
   chrome://extensions/

## Features
- Modern popup UI with Material UI cards and form controls
- Persistent field storage using Chrome storage
- Quick import/export backup flow
- Fill the active webpage with a single click
- Clean React state management with TanStack Query

## Notes

The generated `dist` folder is the one you load into Chrome as an unpacked extension. The popup is powered by the React app, while the content script remains separate and injects values into matching form inputs on the page.
