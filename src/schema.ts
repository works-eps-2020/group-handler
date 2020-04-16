export type Rule = (context: RuleContext) => RuleContext | Promise<RuleContext>;

export type RuleContext = {
  // see https://auth0.com/docs/rules/references/user-object
  user: { email?: string; user_id?: string; [key: string]: any };
  // see https://auth0.com/docs/rules/references/context-object
  context: {
    accessToken?: { [key: string]: any };
    idToken?: { [key: string]: any };
    clientName?: string;
    clientID?: string;
  };
};

export const RULE_CONTEXT_SCHEMA = {
  type: "object",
  properties: {
    user: {
      type: "object",
      properties: { email: { type: "string" } },
      additionalProperties: true,
    },
    context: {
      type: "object",
      properties: {
        accessToken: {
          type: "object",
          additionalProperties: true,
        },
        idToken: {
          type: "object",
          additionalProperties: true,
        },
        clientName: { type: "string" },
        clientID: { type: "string" },
      },
      additionalProperties: false,
    },
  },
  required: ["user", "context"],
  additionalProperties: false,
};
