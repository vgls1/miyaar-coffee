import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			border: "hsl(var(--border))",
  			input: "hsl(var(--input))",
  			ring: "hsl(var(--ring))",
  			background: "hsl(var(--background))",
  			foreground: "hsl(var(--foreground))",
  			primary: {
  				DEFAULT: "hsl(var(--primary))",
  				foreground: "hsl(var(--primary-foreground))"
  			},
  			secondary: {
  				DEFAULT: "hsl(var(--secondary))",
  				foreground: "hsl(var(--secondary-foreground))"
  			},
  			destructive: {
  				DEFAULT: "hsl(var(--destructive))",
  				foreground: "hsl(var(--destructive-foreground))"
  			},
  			muted: {
  				DEFAULT: "hsl(var(--muted))",
  				foreground: "hsl(var(--muted-foreground))"
  			},
  			accent: {
  				DEFAULT: "hsl(var(--accent))",
  				foreground: "hsl(var(--accent-foreground))"
  			},
  			popover: {
  				DEFAULT: "hsl(var(--popover))",
  				foreground: "hsl(var(--popover-foreground))"
  			},
  			card: {
  				DEFAULT: "hsl(var(--card))",
  				foreground: "hsl(var(--card-foreground))"
  			},
            // Branding Specific Colors
            brand: {
                charcoal: '#1B1B1D',      // Main Background
                warmBlack: '#22201E',     // Secondary/Card Background
                softGold: '#C9A86A',      // Primary Accent (Hero, Buttons)
                antiqueGold: '#B89B5E',   // Secondary Accent (Hover, Borders)
                parchment: '#E6D8C3',     // Muted Text
                offWhite: '#F2F2F0',      // Primary Text
                coffee: '#5A3E2B',        // Earthy Accent
                olive: '#4A4F3A',         // Botanical Accent
            }
  		},
  		borderRadius: {
  			lg: "var(--radius)",
  			md: "calc(var(--radius) - 2px)",
  			sm: "calc(var(--radius) - 4px)"
  		},
        fontFamily: {
            serif: ['var(--font-playfair)', 'serif'],
            sans: ['var(--font-inter)', 'var(--font-amiri)', 'sans-serif'],
        }
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
