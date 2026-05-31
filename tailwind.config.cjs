module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#ff2b2b",
          dark: "#0f172a"
        },
        surface: {
          soft: "#f5f6f8"
        }
      },
      boxShadow: {
        soft: "0 18px 45px rgba(15, 23, 42, 0.12)",
        lift: "0 25px 60px rgba(15, 23, 42, 0.18)"
      },
      borderRadius: {
        "4xl": "2rem"
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(120deg, rgba(15,23,42,0.65), rgba(15,23,42,0.25))"
      }
    }
  },
  plugins: []
};
