import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import userRoute from "./routes/user";
import productRoute from "./routes/products";
import cartRoute from "./routes/cart";
import { seedInitialProducts } from "./services/product";

const app = express();
const port = 5000;

dotenv.config();

app.use(express.json());
app.use(cors());

mongoose
  .connect(
    process.env.DATABASE_URL || ""
  )
  .then(() => console.log("📲 MongoDB Atlas Is Connected !"))
  .catch(() => console.log(" ❌❌ Cannot Connect To Connect !"));

app.use("/user", userRoute);

app.use("/product", productRoute);

app.use("/cart", cartRoute);

seedInitialProducts();

app.listen(port, () =>
  console.log(
    `🚀 Server Is Running On PORT : ${port}`,
    `http://localhost:${port}`
  )
);
