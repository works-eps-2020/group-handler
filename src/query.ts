import fetch from "node-fetch";

const HASURA_URL = process.env.HASURA_URL;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;

if (!HASURA_URL) {
  throw new Error("Error: HASURA_URL env variable not set");
}
if (!HASURA_ADMIN_SECRET) {
  throw new Error("Error: HASURA_ADMIN_SECRET env variable not set");
}

const QUERY_USER_ROLES = `query ($auth0_id: String) {
    user_role(where: {user: {auth0_id: {_eq: $auth0_id}}}) {
      role {
        name
      }
      user {
        id
      }
    }
  }`;

const fetcher = async (
  url: string,
  query: string,
  variables: { [key: string]: any }
) => {
  const response = await fetch(url, {
    headers: {
      "x-hasura-admin-secret": `${HASURA_ADMIN_SECRET}`,
    },
    method: "POST",
    body: JSON.stringify({
      query,
      variables,
    }),
  });
  if (!response.ok) {
    throw new Error(
      `Error while fetching hasura: ${response.status} => ${response.statusText}`
    );
  }
  return response.json();
};

export const fetchUserRoles = async (userId: string) => {
  try {
    const result = await fetcher(HASURA_URL, QUERY_USER_ROLES, {
      auth0_id: userId,
    });
    if (result.errors) {
      throw new Error(
        result.errors.map((e: { message: string }) => e.message).join(",")
      );
    }
    return result.data.user_role;
  } catch (err) {
    console.error(err);
  }
};
