import { getCookie, getEvent, setCookie } from "vinxi/http";
import { encodeBase32, encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";

import { database } from "@/lib/database";
import { User, UserSession } from "@/lib/database/types";

type SessionValidationResult =
  | { session: UserSession; user: User }
  | { session: null; user: null };

export const validateSessionToken = async (
  token: string,
): Promise<SessionValidationResult> => {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session = await database
    .selectFrom("userSessions")
    .innerJoin("users", "users.id", "userSessions.userId")
    .select([
      "userSessions.id",
      "userSessions.userId",
      "userSessions.expiresAt",
      "users.googleId",
      "users.name",
      "users.email",
      "users.picture",
    ])
    .where("userSessions.id", "=", sessionId)
    .executeTakeFirst();

  if (!session) {
    return {
      session: null,
      user: null,
    };
  }
  if (Date.now() >= session.expiresAt.getTime()) {
    await database
      .deleteFrom("userSessions")
      .where("userSessions.id", "=", sessionId)
      .execute();
    return {
      session: null,
      user: null,
    };
  }
  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await database
      .updateTable("userSessions")
      .where("userSessions.id", "=", sessionId)
      .set({ expiresAt: session.expiresAt })
      .execute();
  }
  return {
    session: {
      id: session.id,
      userId: session.userId,
      expiresAt: session.expiresAt,
    },
    user: {
      id: session.userId,
      googleId: session.googleId,
      name: session.name,
      email: session.email,
      picture: session.picture,
    },
  };
};

export const generateSessionToken = () => {
  const tokenBytes = new Uint8Array(20);
  crypto.getRandomValues(tokenBytes);
  const token = encodeBase32(tokenBytes).toLowerCase();
  return token;
};

export const createSessionForUser = async ({
  token,
  userId,
}: {
  token: string;
  userId: string;
}) => {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: UserSession = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  };
  await database.insertInto("userSessions").values(session).execute();
  const event = getEvent();
  setCookie(event, "session", token, {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: session.expiresAt,
  });
  return {
    success: true,
  };
};

export const validateCurrentSession = async () => {
  const event = getEvent();
  const sessionId = getCookie(event, "session");
  if (!sessionId) {
    return {
      isLoggedIn: false,
    };
  }

  const { session, user } = await validateSessionToken(sessionId);
  if (!session || !user) {
    setCookie(event, "session", "", {
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
    });
    return {
      isLoggedIn: false,
    };
  }

  return {
    isLoggedIn: true,
    session,
    user,
  };
};
