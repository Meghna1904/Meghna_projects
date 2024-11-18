module.exports = {
  darkMode: 'class',  // Enable dark mode using a class (e.g., "dark" on the <html> or <body> tag)
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',  // Scans all files inside /pages for Tailwind classes
    './components/**/*.{js,ts,jsx,tsx}',  // Scans all files inside /components for Tailwind classes
  ],
  theme: {
    extend: {},  // You can extend the theme here if needed (e.g., adding custom colors, spacing, etc.)
  },
  plugins: [
    require('@tailwindcss/forms'),  // Enables styling for form elements using Tailwind
  ],
}
