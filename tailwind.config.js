/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#080C14",
        surface: {
          DEFAULT: "#0E1420",
          high: "#141B28",
        },
        ink: {
          DEFAULT: "#F0F4FF",
          sub: "#7A8599",
        },
        teal: {
          DEFAULT: "#1AE0A8",
          dim: "#00B88A",
        },
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      fontSize: {
        "heading-xxl": ["28px", "36px"],
        "heading-xl": ["22px", "30px"],
        "heading-lg": ["18px", "26px"],
        "body-md": ["15px", "22px"],
        "body-base": ["13px", "19px"],
        "caption-sm": ["11px", "16px"],
        "label-xs": ["9px", "13px"],
      },
    },
  },
  plugins: [],
};
