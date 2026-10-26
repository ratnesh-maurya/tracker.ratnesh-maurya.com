import type { Config } from "tailwindcss";

const token = (name: string) => `hsl(var(--${name}) / <alpha-value>)`;

// Warm single-tint neutral (DESIGN.md "ink"). Replaces Tailwind's cool greys so
// every existing gray-* / slate-* class lands on the Ledger palette. 500 is
// tuned to 4.5:1 on the light background.
const ink = {
    50: "#FBFAF7",
    100: "#F6F3EC",
    200: "#E7E3DA",
    300: "#D9D4C8",
    400: "#B3AEA3",
    500: "#77736A",
    600: "#6B675E",
    700: "#4A463E",
    800: "#2F2B25",
    900: "#17150F",
    950: "#0E0D0B",
};

// Brand ramp, marigold into kumkum. Stands in for the old indigo/violet/purple/
// blue/pink accents so leftovers stay on-brand.
const saffron = {
    50: "#FFF5EB",
    100: "#FFE8D1",
    200: "#FFD0A3",
    300: "#FFA866",
    400: "#F55A8A",
    500: "#E8336D",
    600: "#B83A3E",
    700: "#C21E56",
    800: "#9A1745",
    900: "#6E1032",
    950: "#420A1E",
};

const config: Config = {
    darkMode: ["selector", '[data-theme="dark"]'],
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                gray: ink,
                slate: ink,
                zinc: ink,
                neutral: ink,
                stone: ink,
                ink,
                indigo: saffron,
                violet: saffron,
                purple: saffron,
                blue: saffron,
                pink: saffron,
                fuchsia: saffron,
                background: token("background"),
                foreground: token("foreground"),
                card: {
                    DEFAULT: token("card"),
                    foreground: token("card-foreground"),
                },
                popover: {
                    DEFAULT: token("popover"),
                    foreground: token("popover-foreground"),
                },
                primary: {
                    DEFAULT: token("primary"),
                    foreground: token("primary-foreground"),
                },
                secondary: {
                    DEFAULT: token("secondary"),
                    foreground: token("secondary-foreground"),
                },
                muted: {
                    DEFAULT: token("muted"),
                    foreground: token("muted-foreground"),
                },
                accent: {
                    DEFAULT: token("accent"),
                    foreground: token("accent-foreground"),
                },
                destructive: {
                    DEFAULT: token("destructive"),
                    foreground: token("destructive-foreground"),
                },
                border: token("border"),
                input: token("input"),
                ring: token("ring"),
                body: token("body"),
                "line-2": token("line-2"),
                rule: token("rule"),
                coral: token("coral"),
                kicker: token("kicker"),
                num: token("num"),
                hover: token("hover"),
                marigold: token("marigold"),
                kumkum: token("kumkum"),
                peacock: token("peacock"),
                ok: token("ok"),
                chart: {
                    "1": token("chart-1"),
                    "2": token("chart-2"),
                    "3": token("chart-3"),
                    "4": token("chart-4"),
                    "5": token("chart-5"),
                },
            },
            fontFamily: {
                display: ["var(--font-instrument)", "Georgia", "Times New Roman", "serif"],
                sans: ["var(--font-geist)", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
                mono: ["var(--font-jetbrains)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
            },
            borderRadius: {
                // Ledger radii; controls are pills. Tailwind's defaults stay as they are.
                card: "26px",
                inner: "18px",
                tile: "12px",
                pill: "999px",
            },
            boxShadow: {
                card: "var(--shadow)",
                float: "0 10px 30px rgba(30,20,40,.16)",
                pop: "0 18px 48px rgba(30,20,40,.2)",
            },
            backgroundImage: {
                saffron: "var(--saffron)",
            },
            maxWidth: {
                lede: "60ch",
            },
        },
    },
    plugins: [],
};
export default config;
