import { createAPIFileRoute } from "@tanstack/start/api";
import { generateCodeVerifier, generateState } from "arctic";
import { getEvent, setCookie } from "vinxi/http";

import { google } from "@/lib/auth/oauth/google";

export const Route = createAPIFileRoute("/api/auth/google")({
  GET: async () => {
    const event = getEvent();

    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const url = google.createAuthorizationURL(state, codeVerifier, [
      "openid",
      "profile",
      "email",
    ]);

    setCookie(event, "google_oauth_state", state, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 10, // 10 minutes
      sameSite: "lax",
    });

    setCookie(event, "google_code_verifier", codeVerifier, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 10, // 10 minutes
      sameSite: "lax",
    });

    return new Response(null, {
      status: 302,
      headers: {
        Location: url.toString(),
      },
    });
  },
});
