/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                espn: {
                    black: '#000000',
                    dark: '#121212',
                    card: '#1e1e1e',
                    red: '#cc0000',
                    lightres: '#eeeeee',
                    text: '#ffffff',
                    gray: '#888888',
                }
            }
        },
    },
    plugins: [],
}
