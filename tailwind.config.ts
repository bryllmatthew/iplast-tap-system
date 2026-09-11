import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#18212f",
        mist: "#eef2f6",
        tap: {
          coral: "#f05a5b",
          cyan: "#12c8d8",
          green: "#22a06b",
          navy: "#263248"
        }
      },
      boxShadow: {
        panel: "0 14px 40px rgba(24, 33, 47, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
