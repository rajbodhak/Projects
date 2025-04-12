import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {},
    },
    plugins: [
        tailwindcssAnimate
    ],
};

export default config;