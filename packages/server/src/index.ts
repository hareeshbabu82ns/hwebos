import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { connectDB } from "./db/connection";
import auth from "./routes/auth";
import { setupPTYWebSocket } from "./pty/websocket";

const app = new Hono();

app.use("/*", cors());

app.route("/auth", auth);

if (process.env.NODE_ENV === "production") {
  app.use("/*", serveStatic({ root: "../client/dist" }));
  app.get("*", serveStatic({ path: "../client/dist/index.html" }));
} else {
  app.get("/", (c) => {
    return c.text("hmac OS Server");
  });
}

const port = 3000;
console.log(`Server is running on port ${port}`);
console.log(
  "Raptor mini (Preview) Enabled:",
  process.env.ENABLE_RAPTOR_MINI === "true"
);

app.get("/feature-flags", (c) => {
  return c.json({
    raptorMiniPreview: process.env.ENABLE_RAPTOR_MINI === "true",
  });
});

connectDB().then(() => {
  const server = serve({
    fetch: app.fetch,
    port,
  });
  setupPTYWebSocket(server);
});
