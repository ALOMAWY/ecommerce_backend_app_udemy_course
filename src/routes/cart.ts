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
import { ExtendsRequest } from "../types/extendedRequest";
import { addItemSchema, updateItemSchema, checkoutSchema } from "../validators";
import { AppError } from "../middlewares/errorHandler";

const router = express.Router();

router.get("/", validateJWT, async (req: ExtendsRequest, res, next) => {
  try {
    const userId = String(req.user?._id || "");
    const cart = await getActiveCartForUser({ userId, populateProduct: true });
    res.status(200).send(cart);
  } catch (err) {
    next(err);
  }
});

router.post("/items", validateJWT, async (req: ExtendsRequest, res, next) => {
  try {
    const userId = String(req.user?._id || "");
    const { productId, quantity } = addItemSchema.parse(req.body);
    const response = await addItemToCart({ userId, productId, quantity });
    if (response.statusCode >= 400) throw new AppError(response.data as string, response.statusCode);
    res.status(response.statusCode).send(response.data);
  } catch (err) {
    next(err);
  }
});

router.put("/items", validateJWT, async (req: ExtendsRequest, res, next) => {
  try {
    const userId = String(req.user?._id || "");
    const { productId, quantity } = updateItemSchema.parse(req.body);
    const response = await updateItemInCart({ userId, productId, quantity });
    if (response.statusCode >= 400) throw new AppError(response.data as string, response.statusCode);
    res.status(response.statusCode).send(response.data);
  } catch (err) {
    next(err);
  }
});

router.delete("/items/:id", validateJWT, async (req: ExtendsRequest, res, next) => {
  try {
    const userId = String(req.user?._id || "");
    const productId = String(req.params.id);
    const response = await deleteItemInCart({ userId, productId });
    if (response.statusCode >= 400) throw new AppError(response.data as string, response.statusCode);
    res.status(response.statusCode).send(response.data);
  } catch (err) {
    next(err);
  }
});

router.delete("/", validateJWT, async (req: ExtendsRequest, res, next) => {
  try {
    const userId = String(req.user?._id || "");
    const response = await clearCart({ userId });
    res.status(response.statusCode).send(response.data);
  } catch (err) {
    next(err);
  }
});

router.post("/checkout", validateJWT, async (req: ExtendsRequest, res, next) => {
  try {
    const userId = String(req.user?._id || "");
    const { address } = checkoutSchema.parse(req.body);
    const response = await checkout({ userId, address });
    if (response?.statusCode && response.statusCode >= 400)
      throw new AppError(response.data as string, response.statusCode);
    res.status(response?.statusCode).send(response.data);
  } catch (err) {
    next(err);
  }
});

router.get("/orders", validateJWT, async (req: ExtendsRequest, res, next) => {
  try {
    const userId = String(req.user?._id || "");
    const response = await getOrderByUserId({ userId });
    res.status(response?.statusCode).send(response.data);
  } catch (err) {
    next(err);
  }
});

export default router;
