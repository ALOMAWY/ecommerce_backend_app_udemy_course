import express from "express";

import {
  addItemToCart,
  checkout,
  clearCart,
  deleteItemInCart,
  getActiveCartForUser,
  getOrderByUserId,
  updateItemInCart,
} from "../services/cart";

import validateJWT from "../middlewares/jwt";

import { Request, Response } from "express";

import { ExtendsRequest } from "../types/extendedRequest";

const router = express.Router();

router.get("/", validateJWT, async (req: ExtendsRequest, res: Response) => {
  try {
    const userId = req.user?._id as string;

    const cart = await getActiveCartForUser({ userId, populateProduct: true });

    res.status(200).send(cart);
  } catch (error) {
    console.error("Somthing went wrong !", error);
  }
});

router.post("/items", validateJWT, async (req: ExtendsRequest, res) => {
  try {
    const userId = req.user?._id as string;

    const { productId, quantity } = req.body;

    const response = await addItemToCart({ userId, productId, quantity });

    res.status(response.statusCode).send(response.data);
  } catch (error) {
    console.error("Somthing went wrong !", error);
  }
});

router.put("/items", validateJWT, async (req: ExtendsRequest, res) => {
  try {
    const userId = req.user?._id as string;

    const { productId, quantity } = req.body;

    const response = await updateItemInCart({ userId, productId, quantity });

    res.status(response.statusCode).send(response.data);
  } catch (error) {
    console.error("Somthing went wrong !", error);
  }
});

router.delete("/items/:id", validateJWT, async (req: ExtendsRequest, res) => {
  try {
    const userId = req.user?._id as string;

    const productId = req.params.id;

    const response = await deleteItemInCart({ userId, productId });

    res.status(response.statusCode).send(response.data);
  } catch (error) {
    console.error("Somthing went wrong !", error);
  }
});

router.delete("/", validateJWT, async (req: ExtendsRequest, res) => {
  try {
    const userId = req.user?.id;

    const response = await clearCart({ userId });

    res.status(response.statusCode).send(response.data);
  } catch (error) {
    console.error("Somthing went wrong !", error);
  }
});

router.post("/checkout", validateJWT, async (req: ExtendsRequest, res) => {
  try {
    const userId = req.user?.id;
    const { address } = req.body;
    const response = await checkout({ userId, address });
    res.status(response?.statusCode).send(response.data);
  } catch (error) {
    console.error("Somthing went wrong !", error);
  }
});

router.get("/orders", validateJWT, async (req: ExtendsRequest, res) => {
  try {
    const userId = req.user?.id;

    const response = await getOrderByUserId({ userId });

    res.status(response?.statusCode).send(response.data);
  } catch (error) {
    console.error("Somthing went wrong");
  }
});

export default router;
