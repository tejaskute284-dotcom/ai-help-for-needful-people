/** @type {import('tailwindcss').Config} */

// Inline implementation of flattenColorPalette since it's not available in v4 directly or requires extra steps
function flattenColorPalette(colors) {
    return Object.assign(
        {},
        ...Object.entries(colors !== null && colors !== void 0 ? colors : {}).flatMap(([color, values]) =>
            typeof values === "object"
                ? Object.entries(flattenColorPalette(values)).map(([number, hex]) => ({
                    [color + (number === "DEFAULT" ? "" : "-" + number)]: hex,
                }))
                : [{ [`${color}`]: values }]
        )
    );
}

module.exports = {
    content: [
        "./src/**/*.{ts,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            animation: {
                aurora: "aurora 60s linear infinite",
            },
            keyframes: {
                aurora: {
                    from: {
                        backgroundPosition: "50% 50%, 50% 50%",
                    },
                    to: {
                        backgroundPosition: "350% 50%, 350% 50%",
                    },
                },
            },
        },
    },
    plugins: [addVariablesForColors],
};

function addVariablesForColors({ addBase, theme }) {
    let allColors = flattenColorPalette(theme("colors"));
    let newVars = Object.fromEntries(
        Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
    );

    addBase({
        ":root": newVars,
    });
}
