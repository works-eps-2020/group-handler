import fastify from "fastify";
import { RULE_CONTEXT_SCHEMA } from "./schema";
import { guard } from "./guard";

export const main = async () => {
  const app = fastify({ logger: { prettyPrint: true } });

  const securityEnabled =
    process.env.SECURITY_ENABLED === "true" ||
    process.env.NODE_ENV === "production";
  const securityKey = process.env.AZGUARD_SECURITY_KEY;
  const insecureConfiguration = securityEnabled && !securityKey;

  app.addHook("onRequest", async (request, reply) => {
    if (
      securityEnabled &&
      (insecureConfiguration ||
        request.headers.authorization !== `Bearer ${securityKey}`)
    ) {
      reply.code(401).send();
    }
  });

  app.post(
    "/",
    {
      schema: {
        body: RULE_CONTEXT_SCHEMA,
        response: { 200: RULE_CONTEXT_SCHEMA },
      },
    },
    (req, res) => guard(req, res)
  );

  const address = await app.listen(
    Number(process.env.PORT || "3000"),
    process.env.HOST || "localhost"
  );

  return { app, address };
};

main().catch((err) => console.error(err));
