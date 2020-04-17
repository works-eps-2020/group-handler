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
  if (!user.user_id) {
    throw new Error("missing property: user.user_id");
  }
  const roles = await fetchUserRoles(user.user_id);
  return {
    user,
    context: {
      ...context,
      idToken: {
        ...context.idToken,
        "https://hasura.io/jwt/claims": {
          "x-hasura-default-role": "user",
          "x-hasura-allowed-roles": ["user", ...(roles || [])],
          "x-hasura-user-id": user.user_id,
        },
      },
    },
  };
};
