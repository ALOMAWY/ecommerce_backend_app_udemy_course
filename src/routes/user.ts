import express from "express";
import { login, register } from "../services/user";
import { registerSchema, loginSchema } from "../validators";
import { AppError } from "../middlewares/errorHandler";

const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = registerSchema.parse(req.body);
    const { statusCode, data } = await register({ firstName, lastName, email, password });
    if (statusCode >= 400) throw new AppError(data as string, statusCode);
    res.status(statusCode).json(data);
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const { statusCode, data } = await login({ email, password });
    if (statusCode >= 400) throw new AppError(data as string, statusCode);
    res.status(statusCode).json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
