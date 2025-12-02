/**
 * Tailwind CSS Configuration File
 * @type {import('tailwindcss').Config}
 *
 * This config enables Tailwind to scan all HTML, JS, and CSS files
 * used in your BidHub project, ensuring unused styles are removed
 * and custom colors are available globally.
 */

module.exports = {
  content: [
    "./index.html",

    // All page HTML files
    "./pages/**/*.html",

    // All JS scripts inside /src
    "./src/**/*.js",

    // Utility JS files
    "./utils/**/*.js",

    // All CSS files
    "./styles/**/*.css"
  ],

  theme: {
    extend: {
      colors: {
        cream: "#F5ECE7",
        header: "#C47A63",
        "header-dark": "#A65A4F",
      },
    },
  },

  plugins: [],
};
