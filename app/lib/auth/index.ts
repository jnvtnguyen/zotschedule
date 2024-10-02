import { Lucia, TimeSpan } from "lucia";
import { NodePostgresAdapter } from "@lucia-auth/adapter-postgresql";
import { createServerFn } from "@tanstack/start";
import { getCookie, getEvent, setCookie, setResponseStatus } from "vinxi/http";

import { pool } from "@/lib/database";
import { User } from "@/lib/database/types";

const adapter = new NodePostgresAdapter(pool, {
  session: "user_sessions",
  user: "users",
});

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  sessionExpiresIn: new TimeSpan(2, "w"),
  getUserAttributes: (attributes) => {
    return {
      name: attributes.name,
      email: attributes.email,
    };
  },
});

export type AuthUser = Omit<User, "password" | "createdAt" | "updatedAt">;

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: AuthUser;
  }
}

export const createSessionForUser = createServerFn(
  "POST",
  async (user: AuthUser) => {
    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    const event = getEvent();
    setCookie(
      event,
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
    return {
      success: true,
    };
  },
);

export const validateSession = createServerFn("GET", async () => {
  const event = getEvent();
  const sessionId = getCookie(event, lucia.sessionCookieName);
  if (!sessionId) {
    setResponseStatus(event, 401);
    return {
      success: false,
    };
  }

  const { session, user } = await lucia.validateSession(sessionId);
  if (!session || !user) {
    const blankSessionCookie = lucia.createBlankSessionCookie();
    setCookie(
      event,
      blankSessionCookie.name,
      blankSessionCookie.value,
      blankSessionCookie.attributes,
    );
    setResponseStatus(event, 401);
    return {
      success: false,
    };
  }

  if (session && session.fresh) {
    const sessionCookie = lucia.createSessionCookie(session.id);
    setCookie(
      event,
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
  }

  return {
    success: true,
    user,
  };
});

export const logoutSession = createServerFn("POST", async () => {
  const event = getEvent();
  const sessionId = getCookie(event, lucia.sessionCookieName);
  if (!sessionId) {
    setResponseStatus(event, 401);
    return {
      success: false,
    };
  }

  await lucia.invalidateSession(sessionId);
  const blankSessionCookie = lucia.createBlankSessionCookie();
  setCookie(
    event,
    blankSessionCookie.name,
    blankSessionCookie.value,
    blankSessionCookie.attributes,
  );
  return {
    success: true,
  };
});
