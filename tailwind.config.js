/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	presets: [require("nativewind/preset")],
	theme: {
		extend: {
			colors: {
				bg: {
					screen: "#0f0f1a",
					modal: "#0d0d1a",
					surface: "#1a1a2e",
					active: "#1a1a40",
					preferment: "#0d1f0d",
					error: "#2a0d0d",
				},
				border: {
					DEFAULT: "#2a2a4a",
					locked: "#222",
				},
				content: {
					primary: "#e0e0e0",
					secondary: "#aaa",
					muted: "#888",
					disabled: "#666",
					faint: "#555",
					ghost: "#444",
				},
				accent: {
					blue: "#7c9fff",
					green: "#7cffb2",
					red: "#ff7c7c",
				},
			},
			fontSize: {
				xxs: ["11px", {}],
				label: ["13px", {}],
				sm: ["15px", {}],
				md: ["17px", {}],
				title: ["22px", {}],
				lg: ["26px", {}],
			},
			spacing: {
				0.75: "3px",
				2.25: "9px",
				4.5: "18px",
			},
			letterSpacing: {
				label: "0.5px",
			},
			borderRadius: {
				badge: "5px",
				chip: "12px",
			},
		},
	},
	plugins: [],
};
