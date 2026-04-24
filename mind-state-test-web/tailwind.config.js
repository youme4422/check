/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#f6f8f8",
        ink: "#334155",
        brand: {
          50: "#ecfeff",
          100: "#cffafe",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
        },
        accent: {
          100: "#dbeafe",
          500: "#60a5fa",
        },
      },
      fontFamily: {
        sans: ["Pretendard Variable", "SUIT", "Noto Sans KR", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 30px -14px rgba(15, 23, 42, 0.28)",
      },
    },
  },
  plugins: [],
};

