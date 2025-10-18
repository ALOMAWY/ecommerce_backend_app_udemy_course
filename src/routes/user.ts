import express from "express";
import { login, register } from "../services/user";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const { statusCode, data } = await register({
      firstName,
      lastName,
      email,
      password,
    });

    res.status(statusCode).json(data);
  } catch (error) {
    console.error("Somthing went wrong !", error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const { statusCode, data } = await login({
      email,
      password,
    });

    res.status(statusCode).json(data);
  } catch (error) {
    console.error("Somthing went wrong !", error);
  }
});

export default router;
