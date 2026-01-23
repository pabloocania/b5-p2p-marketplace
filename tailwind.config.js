/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Donatto", "Inter", "Poppins", "system-ui", "sans-serif"],
        display: ["Donatto", "Inter", "system-ui", "sans-serif"],
        primary: ["Donatto", "system-ui", "sans-serif"],
        secondary: ["Montserrat", "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        xxs: "0.625rem", // Add a new font size
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        // Branding Colors - Accessibility Optimized
        primary: "#8b5fdc", // Púrpura vibrante - Color principal
        secondary: "#efb810", // Amarillo mostaza - Color secundario
        terciary: "#fcce4c", // Amarillo claro - Color terciario
        accent: "#9e8cbe", // Púrpura grisáceo - Acentos
        dark: "#3e2262", // Púrpura oscuro - Textos importantes
        lightYellow: "#f5e6a3", // Amarillo muy suave - Para fondos claros

        // Background Colors
        backgroundMain: "#faf9ff", // Fondo principal muy suave (púrpura muy claro)
        backgroundSecondary: "#f5f3ff", // Fondo secundario

        // Semantic Colors
        success: "#10b981", // Verde para éxito
        warning: "#f59e0b", // Naranja para advertencias
        error: "#ef4444", // Rojo para errores
        info: "#3b82f6", // Azul para información

        // Neutral Colors for Accessibility
        muted: {
          DEFAULT: "#f1f5f9",
          foreground: "#64748b",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        border: "#e2e8f0",
        input: "#f8fafc",
        ring: "#8b5fdc",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
