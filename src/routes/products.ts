import express from "express";
import { getAllProducts } from "../services/product";

const router = express.Router();

router.get("/", async (req, res) => {
try {
  const products = await getAllProducts();
  res.status(200).send(products);
} catch (error) {
  console.error("Somthing went wrong !", error);
}
});


export default router;