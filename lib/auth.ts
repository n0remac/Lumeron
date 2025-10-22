// lib/auth.ts
import { cookies } from "next/headers";

const ADMIN_COOKIE = "admin";

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get(ADMIN_COOKIE);
  return adminCookie?.value === "1";
}

export async function setAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}

export function verifyPassword(password: string): boolean {
  return password === process.env.ADMIN_PASSWORD;
}
