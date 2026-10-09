import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const csp = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; " +
  "connect-src 'self'; form-action 'self'; base-uri 'none'; object-src 'none'";

// The policy is applied to production builds only, because the dev server injects inline scripts.
const cspPlugin = {
  name: "csp",
  apply: "build",
  transformIndexHtml: (h) => h.replace("<!--CSP-->", `<meta http-equiv="Content-Security-Policy" content="${csp}">`)
};

export default defineConfig({ plugins: [react(), cspPlugin], base: "./" });
