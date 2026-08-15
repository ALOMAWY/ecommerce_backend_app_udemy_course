import express from "express";
import NodeCache from "node-cache";
import { ProductModel } from "../models/product";
import { productQuerySchema } from "../validators";
import { AppError } from "../middlewares/errorHandler";
import validateAdminJWT from "../middlewares/adminJwt";

const router = express.Router();
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

router.get("/", async (req, res, next) => {
  try {
    const query = productQuerySchema.parse(req.query);
    const cacheKey = `products:${JSON.stringify(query)}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    const filter: Record<string, unknown> = {};
    if (query.category) filter.category = query.category;
    if (query.minPrice || query.maxPrice) {
      filter.price = {};
      if (query.minPrice) (filter.price as Record<string, number>).$gte = query.minPrice;
      if (query.maxPrice) (filter.price as Record<string, number>).$lte = query.maxPrice;
    }
    if (query.inStock !== undefined) {
      if (query.inStock) filter.stock = { $gt: 0 };
      else filter.stock = 0;
    }

    const sortDir = query.sort?.startsWith("-") ? -1 : 1;
    const sortField = query.sort?.replace(/^-/, "") || "createdAt";
    const skip = (query.page - 1) * query.limit;

    const [products, total] = await Promise.all([
      ProductModel.find(filter)
        .sort({ [sortField]: sortDir })
        .skip(skip)
        .limit(query.limit)
        .lean(),
      ProductModel.countDocuments(filter),
    ]);

    const result = {
      data: products,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
        hasNextPage: query.page * query.limit < total,
        hasPrevPage: query.page > 1,
      },
    };

    cache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/all", async (_req, res, next) => {
  try {
    const cached = cache.get("products:all");
    if (cached) {
      res.json(cached);
      return;
    }
    const products = await ProductModel.find().lean();
    cache.set("products:all", products);
    res.json(products);
  } catch (err) {
    next(err);
  }
});

router.post("/", validateAdminJWT, async (req, res, next) => {
  try {
    const { title, image, images, description, category, price, stock } = req.body;
    if (!title || price === undefined || stock === undefined) {
      throw new AppError("Title, price, and stock are required", 400);
    }
    const product = await ProductModel.create({
      title,
      image: image || (Array.isArray(images) && images.length > 0 ? images[0] : ""),
      images: images || [],
      description: description || "",
      category: category || "other",
      price,
      stock,
    });
    cache.flushAll();
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", validateAdminJWT, async (req, res, next) => {
  try {
    const { title, image, images, description, category, price, stock } = req.body;
    const update: Record<string, unknown> = {};
    if (title !== undefined) update.title = title;
    if (image !== undefined) update.image = image;
    if (images !== undefined) update.images = images;
    if (description !== undefined) update.description = description;
    if (category !== undefined) update.category = category;
    if (price !== undefined) update.price = price;
    if (stock !== undefined) update.stock = stock;

    const product = await ProductModel.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );
    if (!product) throw new AppError("Product not found", 404);
    cache.flushAll();
    res.json(product);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", validateAdminJWT, async (req, res, next) => {
  try {
    const product = await ProductModel.findByIdAndDelete(req.params.id);
    if (!product) throw new AppError("Product not found", 404);
    cache.flushAll();
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    next(err);
  }
});

export default router;
