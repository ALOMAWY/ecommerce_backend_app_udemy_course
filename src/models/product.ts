import mongoose, { Schema, Document } from "mongoose";

const CATEGORIES = ["mobile-accessories", "pc-accessories", "tech-tools", "other"] as const;
export type ProductCategory = (typeof CATEGORIES)[number];

export interface IProduct extends Document {
  title: string;
  image: string;
  images: string[];
  description: string;
  category: ProductCategory;
  price: number;
  stock: number;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true },
    image: { type: String, default: "" },
    images: { type: [String], default: [] },
    description: { type: String, default: "" },
    category: { type: String, enum: CATEGORIES, default: "other" },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export const ProductModel = mongoose.model<IProduct>("Product", ProductSchema);
