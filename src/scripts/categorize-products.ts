import mongoose from "mongoose";
import { ProductModel } from "../models/product";

const CATEGORY_MAP: Record<string, string> = {
  "airpods": "mobile-accessories",
  "buds": "mobile-accessories",
  "iphone": "mobile-accessories",
  "galaxy s": "mobile-accessories",
  "galaxy tab": "mobile-accessories",
  "pixel": "mobile-accessories",
  "oneplus": "mobile-accessories",
  "ipad": "mobile-accessories",
  "watch": "tech-tools",
  "headphone": "tech-tools",
  "headset": "tech-tools",
  "gopro": "tech-tools",
  "dji": "tech-tools",
  "drone": "tech-tools",
  "mouse": "pc-accessories",
  "keyboard": "pc-accessories",
  "monitor": "pc-accessories",
  "laptop": "pc-accessories",
  "notebook": "pc-accessories",
  "macbook": "pc-accessories",
  "victus": "pc-accessories",
  "nitro": "pc-accessories",
  "katana": "pc-accessories",
  "tuf": "pc-accessories",
  "legion": "pc-accessories",
  "blade": "pc-accessories",
  "xps": "pc-accessories",
};

async function categorizeProducts() {
  await mongoose.connect(process.env.MONGO_URL || "");
  const products = await ProductModel.find();
  for (const product of products) {
    const title = product.title.toLowerCase();
    let category = "other";
    for (const [keyword, cat] of Object.entries(CATEGORY_MAP)) {
      if (title.includes(keyword)) {
        category = cat;
        break;
      }
    }
    if (product.category !== category) {
      await ProductModel.findByIdAndUpdate(product._id, { category });
      console.log(`Updated "${product.title}" -> ${category}`);
    }
  }
  console.log(`Done. ${products.length} products processed.`);
  await mongoose.disconnect();
}

categorizeProducts().catch(console.error);
