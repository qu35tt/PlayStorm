/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Adjust this path to match your project structure
  ],
  plugins: [
    require('@vidstack/react/tailwind.cjs')({
      // Optimize output by specifying player selector.
      selector: '.media-player',
      // Change the media variants prefix.
      prefix: 'media',
    }),
  ],
};