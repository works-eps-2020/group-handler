import { Rule, RuleContext } from "./schema";
import { FastifyRequest, FastifyReply } from "fastify";
import { ServerResponse } from "http";
import { fetchUserRoles } from "./query";

export const guard = async (
  req: FastifyRequest,
  res: FastifyReply<ServerResponse>
) => {
  let ruleContext: RuleContext = { ...req.body };
  try {
    ruleContext = await applyRule(ruleContext);
  } catch (err) {
    req.log.error(err);
  }
  res.send({ user: ruleContext.user, context: ruleContext.context });
};

export const applyRule: Rule = async ({ user, context }) => {
  if (!context.clientName) {
    throw new Error("missing property: context.clientName");
  }
  if (!context.idToken) {
    throw new Error("missing property: context.idToken");
  }
  console.log("user", user);
  console.log("context", context);
  if (!user.user_id) {
    throw new Error("missing property: user.user_id");
  }
  const roles = await fetchUserRoles(user.user_id);
  return {
    user,
    context: {
      ...context,
      accessToken: {
        ...context.accessToken,
        "https://hasura.io/jwt/claims": {
          "x-hasura-default-role": "public",
          "x-hasura-allowed-roles": ["public", ...(roles || [])],
          "x-hasura-user-id": user.user_id,
        },
      },
    },
  };
};
