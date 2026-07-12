import { createAuthoritativeServer } from "../apps/server/src/server.mjs";

const server = createAuthoritativeServer({
  port: Number(process.env.PORT ?? 3000),
});

export default function handler(request, response) {
  server.emit("request", request, response);
}
