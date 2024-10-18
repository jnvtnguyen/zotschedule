import { createAPIFileRoute } from "@tanstack/start/api";
import { getCookie, getEvent } from "vinxi/http";
import { decodeIdToken, OAuth2Tokens } from "arctic";
import { ObjectParser } from "@pilcrowjs/object-parser";

import { google } from "@/lib/auth/oauth/google";
import { database } from "@/lib/database";
import { createSessionForUser, generateSessionToken } from "@/lib/auth";

export const Route = createAPIFileRoute("/api/auth/google/callback")({
  GET: async ({ request }) => {
    const event = getEvent();
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const storedState = getCookie(event, "google_oauth_state") ?? null;
    const codeVerifier = getCookie(event, "google_code_verifier") ?? null;
    if (
      code === null ||
      state === null ||
      storedState === null ||
      codeVerifier === null
    ) {
      return new Response("Please restart the process.", {
        status: 400,
      });
    }
    if (state !== storedState) {
      return new Response("Please restart the process.", {
        status: 400,
      });
    }

    let tokens: OAuth2Tokens;
    try {
      tokens = await google.validateAuthorizationCode(code, codeVerifier);
    } catch {
      return new Response("Please restart the process.", {
        status: 400,
      });
    }

    const claims = decodeIdToken(tokens.idToken());
    const claimsParser = new ObjectParser(claims);

    const googleId = claimsParser.getString("sub");
    const name = claimsParser.getString("name");
    const picture = claimsParser.getString("picture");
    const email = claimsParser.getString("email");

    const existingUser = await database
      .selectFrom("users")
      .select(["id"])
      .where("googleId", "=", googleId)
      .executeTakeFirst();

    if (existingUser) {
      const sessionToken = await generateSessionToken();
      await createSessionForUser({
        token: sessionToken,
        userId: existingUser.id,
      });
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/",
        },
      });
    }

    const user = await database
      .insertInto("users")
      .values({
        googleId,
        name,
        email,
        picture,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    const sessionToken = await generateSessionToken();
    await createSessionForUser({
      token: sessionToken,
      userId: user.id,
    });

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
      },
    });
  },
});
