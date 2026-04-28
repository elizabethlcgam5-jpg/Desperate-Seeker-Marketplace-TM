import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { setCurrentUserId } from "../lib/session";

const router: IRouter = Router();

function makeHandle(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")
      .slice(0, 20) +
    "_" +
    Math.floor(Math.random() * 9000 + 1000)
  );
}

router.post("/auth/register", async (req, res) => {
  const { email, password, name } = req.body as {
    email?: string;
    password?: string;
    name?: string;
  };

  if (!email || !password || !name) {
    res.status(400).json({ error: "Email, password, and name are required." });
    return;
  }

  const emailClean = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean)) {
    res.status(400).json({ error: "Please enter a valid email address." });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters." });
    return;
  }
  if (name.trim().length < 2) {
    res.status(400).json({ error: "Please enter your full name." });
    return;
  }

  const [existing] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, emailClean))
    .limit(1);

  if (existing) {
    res.status(409).json({ error: "An account with that email already exists. Try logging in." });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const id = randomUUID();
  const handle = makeHandle(name.trim());

  const [user] = await db
    .insert(usersTable)
    .values({
      id,
      name: name.trim(),
      handle,
      email: emailClean,
      passwordHash,
      avatarUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=0B3954&textColor=D4AF37`,
      bio: "",
      location: "",
      subscriptionTier: "free",
    })
    .returning();

  setCurrentUserId(res, user.id);
  res.status(201).json({
    id: user.id,
    name: user.name,
    email: user.email,
    handle: user.handle,
    avatarUrl: user.avatarUrl,
    subscriptionTier: user.subscriptionTier,
  });
});

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required." });
    return;
  }

  const emailClean = email.trim().toLowerCase();

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, emailClean))
    .limit(1);

  if (!user || !user.passwordHash) {
    res.status(401).json({ error: "No account found with that email. Please register first." });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Incorrect password. Please try again." });
    return;
  }

  setCurrentUserId(res, user.id);
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    handle: user.handle,
    avatarUrl: user.avatarUrl,
    subscriptionTier: user.subscriptionTier,
  });
});

router.post("/auth/logout", (_req, res) => {
  res.clearCookie("ds_user_id", { path: "/" });
  res.json({ ok: true });
});

export default router;
