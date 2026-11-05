export default { darkMode: "class", content: ["./src/**/*.{ts,tsx}"], theme: { extend: {
  // ink / surface / edge follow the light-or-dark theme (see the variables in globals.css). navy never changes: it is the colour of the sidebar, tab bar and other always-dark panels.
  colors: { ink: "rgb(var(--ink) / <alpha-value>)", surface: "rgb(var(--surface) / <alpha-value>)", edge: "rgb(var(--edge) / <alpha-value>)", navy: "#0E1B2B", mist: "#F2F5F8", line: "rgba(100,130,145,.25)", brand: "#0F766E", brandDark: "#0B5A54", turmeric: "#F0A202", danger: "#C2410C" },
  fontFamily: { sans: ["var(--font-sans)", "system-ui", "sans-serif"] },
  keyframes: { rise: { from: { opacity: "0", transform: "translateY(6px)" }, to: { opacity: "1", transform: "none" } } },
  animation: { rise: "rise .25s ease-out both" } } } };
