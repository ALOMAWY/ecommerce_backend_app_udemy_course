import express from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../middlewares/errorHandler";

const router = express.Router();

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new AppError("Email and password are required", 400);
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (email !== adminEmail || password !== adminPassword) {
      throw new AppError("Invalid admin credentials", 401);
    }

    const token = jwt.sign(
      { email, isAdmin: true },
      process.env.JWT_SECRET || "",
      { expiresIn: "1h" }
    );

    res.json({ token, email, isAdmin: true });
  } catch (err) {
    next(err);
  }
});

export default router;
