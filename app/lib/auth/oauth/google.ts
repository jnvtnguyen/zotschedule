import { Google } from "arctic";

export const google = new Google(
  process.env.GOOGLE_OAUTH_CLIENT_ID ?? "",
  process.env.GOOGLE_OAUTH_CLIENT_SECRET ?? "",
  `${process.env.ROOT_URL}/api/auth/google/callback`,
);
