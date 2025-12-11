import { Hono } from "hono";
import { sign } from "jsonwebtoken";
import { verify } from "jsonwebtoken";
import { compare, hash } from "bcryptjs";
import { User } from "../db/models/User";

const auth = new Hono();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

auth.post("/register", async (c) => {
  const { email, password, name } = await c.req.json();

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return c.json({ error: "User already exists" }, 400);
  }

  const passwordHash = await hash(password, 10);
  const user = await User.create({ email, passwordHash, name });

  const token = sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

  return c.json({ token, user: { id: user._id, email, name } });
});

auth.post("/login", async (c) => {
  const { email, password } = await c.req.json();

  const user = await User.findOne({ email });
  if (!user) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const validPassword = await compare(password, user.passwordHash);
  if (!validPassword) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const token = sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

  return c.json({
    token,
    user: { id: user._id, email: user.email, name: user.name },
  });
});

auth.get("/me", async (c) => {
  const authHeader = c.req.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/, "");
  if (!token) return c.json({ error: "Unauthorized" }, 401);
  try {
    const payload: any = verify(token, process.env.JWT_SECRET || "dev-secret");
    const user = await User.findById(payload.userId);
    if (!user) return c.json({ error: "Unauthorized" }, 401);
    return c.json({
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (err) {
    return c.json({ error: "Unauthorized" }, 401);
  }
});

export default auth;
