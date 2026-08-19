import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import type { IncomingMessage, ServerResponse } from "node:http";

function onProxyError(_err: Error, _req: IncomingMessage, res: ServerResponse) {
  if (!res.headersSent) {
    res.writeHead(503, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: false,
        error: {
          code: "API_UNAVAILABLE",
          message:
            "The SOLA API is not running. Stop and run npm run dev again, and make sure MongoDB is started.",
          details: []
        }
      })
    );
  }
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4000",
        changeOrigin: true,
        configure(proxy) {
          proxy.on("error", onProxyError);
        }
      },
      "/health": {
        target: "http://127.0.0.1:4000",
        changeOrigin: true,
        configure(proxy) {
          proxy.on("error", onProxyError);
        }
      }
    }
  }
});
