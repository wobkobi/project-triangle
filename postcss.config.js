// postcss.config.js
// Configuration for PostCSS plugins, including Tailwind CSS and Autoprefixer

/** @type {import('postcss').Config} */
export default {
  plugins: {
    // Tailwind CSS v4.0–v4.1 PostCSS plugin
    "@tailwindcss/postcss": {},
    // Automatically add vendor prefixes for wider browser support
    autoprefixer: {},
  },
};
