import Fastify from "fastify";
import { default as StaticHandler } from "@fastify/static";
import { request as httpRequest } from "node:https";
import querystring from "node:querystring";
import path from "node:path";
import { fileURLToPath } from "node:url";

const options = ({ ip, headers: { "user-agent": userAgent } }) => ({
  method: "POST",
  hostname: "plausible.io",
  path: "/api/event",
  headers: {
    "Content-Type": "application/json",
    "X-Forwarded-For": ip,
    "User-Agent": userAgent,
  },
});

// @TODO cleanup once https://github.com/fastify/fastify/pull/4766 is integrated
const payload = ({ hostname, url: path }) => ({
    name: "pageview",
    url: new URL(
    (process.env.PLAUSIBLE_PATH_PREFIX || "") + path,
    "http://localhost",
  ),
    domain: process.env.PLAUSIBLE_DOMAIN || hostname.split(":")[0],
});

const server = Fastify({ trustProxy: true });

server
  .register(StaticHandler, {
    root: path.join(path.dirname(fileURLToPath(import.meta.url)), "public"),
  })
  .get("/~health", async (request, reply) => {
    reply.code(204).send();
  })
  .listen({ port: 3000, host: "0.0.0.0" })
  .then((address) => console.log({ address }))
  .catch((error) => {
    console.error("Error starting server", { error });
    process.exit(1);
  });

server.get(
  "/gemischtes-doppel-feuerwehr-treppenlauf-fuer-mix-teams",
  {
    preHandler: (request, reply, done) => {
      if (/^WhatsApp\//.test(request.headers["user-agent"])) {
        return reply
          .code(200)
          .header("Content-Type", "text/html")
          .send(
            `<html>
              <head>
                <title>Gemischtes Doppel: Feuerwehr-Treppenlauf für Mix-Teams</title>
                <meta name="description" content="Interesse? Geplant für 2025! Dann direkt eintragen und mit dabei sein">
              </head>
              <body>WhatsApp preview</body>
            </html>` + "\n",
          );
      }
      return done();
    },
  },
  (request, reply) => {
    httpRequest(options(request)).end(JSON.stringify(payload(request)));

    reply.header("debug-options", JSON.stringify(options(request)));
    reply.header("debug-payload", JSON.stringify(payload(request)));

    reply
      .code(302)
      .header(
        "location",
        "https://airtable.com/appSsh7Uk76fj2WAl/pag83jtwSA3fZ29Ws/form?" +
          querystring.stringify(request.query),
      )
      .send();
  },
);
