import mongoose from "mongoose";
import { cartModel, ICartItem } from "../models/cart";
import { IOrderItem, orderModel } from "../models/order";
import { IProduct, ProductModel } from "../models/product";
import { ExtendsRequest } from "../types/extendedRequest";

interface ICreateCartForUser {
  userId: string;
}

interface IGetActiveCartForUser {
  userId: string;
  populateProduct?: boolean;
}

interface IAddItemToCart {
  userId: string;
  productId: string;
  quantity: number;
}

interface IUpdateItemToCart {
  userId: string;
  productId: string;
  quantity: number;
}

interface IDeleteItemInCart {
  userId: string;
  productId: string;
}
interface ICheckOut {
  userId: string;
  address: string;
}

const calculateCartItemsTotal = ({ cartItems }: { cartItems: ICartItem[] }) => {
  let total = cartItems.reduce((sum, product) => {
    sum += product.quantity * product.unitPrice;
    return sum;
  }, 0);
  return total;
};

const createCartForUser = async ({ userId }: ICreateCartForUser) => {
  const cart = await cartModel.create({ userId, totalAmount: 0 });
  return cart;
};

export const getActiveCartForUser = async ({
  userId,
  populateProduct,
}: IGetActiveCartForUser) => {
  let cart;
  if (populateProduct) {
    cart = await cartModel
      .findOne({ userId, status: "active" })
      .populate("items.product");
  } else {
    cart = await cartModel.findOne({ userId, status: "active" });
  }

  if (!cart) {
    cart = await createCartForUser({ userId });
  }
  return cart;
};

export const addItemToCart = async ({
  userId,
  productId,
  quantity,
}: IAddItemToCart) => {
  if (!mongoose.isValidObjectId(productId)) {
    return { data: "Product Not Found", statusCode: 400 };
  }

  const cart = await getActiveCartForUser({ userId });

  const existingProduct = cart.items.find(
    (p) => p.product.toString() === productId
  );

  if (existingProduct) {
    existingProduct.quantity += quantity;

    cart.totalAmount += existingProduct.unitPrice * quantity;

    await cart.save();

    return {
      data: await getActiveCartForUser({ userId, populateProduct: true }),
      statusCode: 200,
    };
  }

  const product = await ProductModel.findById(productId);

  if (!product) return { data: "Product Not Found", statusCode: 400 };

  if (product.stock < quantity)
    return { data: "low stock for item ", statusCode: 400 };

  cart.items.push({ product: productId, unitPrice: product.price, quantity });

  cart.totalAmount += product.price * quantity;

  await cart.save();

  return {
    data: await getActiveCartForUser({ userId, populateProduct: true }),
    statusCode: 200,
  };
};

export const updateItemInCart = async ({
  userId,
  productId,
  quantity,
}: IUpdateItemToCart) => {
  if (quantity < 1) {
    return { data: "quantity must be at least 1", statusCode: 400 };
  }

  if (!mongoose.isValidObjectId(productId)) {
    return { data: "item Dose Not Exist In Cart !", statusCode: 400 };
  }

  const cart = await getActiveCartForUser({ userId });

  const existingProduct = cart.items.find(
    (p) => p.product.toString() === productId
  );

  if (!existingProduct) {
    return { data: "item Dose Not Exist In Cart !", statusCode: 400 };
  }

  const product = await ProductModel.findById(productId);

  if (!product) return { data: "Product Not Found", statusCode: 400 };

  if (product.stock < quantity)
    return { data: "low stock for item ", statusCode: 400 };

  const otherCartItems = cart.items.filter(
    (p) => p.product.toString() !== productId
  );

  let total = calculateCartItemsTotal({ cartItems: otherCartItems });

  existingProduct.quantity = quantity;
  total += existingProduct.quantity * existingProduct.unitPrice;

  cart.totalAmount = total;
  await cart.save();

  return {
    data: await getActiveCartForUser({ userId, populateProduct: true }),
    statusCode: 200,
  };
};

export const deleteItemInCart = async ({
  userId,
  productId,
}: IDeleteItemInCart) => {
  let cart = await getActiveCartForUser({ userId });

  const existsInCart = cart.items.find(
    (p) => p.product.toString() === productId
  );

  if (!existsInCart)
    return { data: "item Dose Not Exist In Cart !", statusCode: 400 };

  const otherCartItems: ICartItem[] = cart.items.filter(
    (p) => p.product.toString() !== productId
  );

  let total = calculateCartItemsTotal({ cartItems: otherCartItems });

  cart.totalAmount = total;
  cart.items = otherCartItems;

  await cart.save();

  return {
    data: await getActiveCartForUser({ userId, populateProduct: true }),
    statusCode: 200,
  };
};

export const clearCart = async ({ userId }: { userId: string }) => {
  const cart = await getActiveCartForUser({ userId });

  cart.items = [];
  cart.totalAmount = 0;

  const updatedCart = await cart.save();

  return { data: updatedCart, statusCode: 200 };
};

export const checkout = async ({ userId, address }: ICheckOut) => {
  if (!address) return { data: "please add the address", statusCode: 400 };

  const cart = await getActiveCartForUser({ userId });

  const orderItems: IOrderItem[] = [];

  if (!cart.items || cart.items.length === 0)
    return { data: "items dose not include products", statusCode: 400 };
  for (const item of cart.items) {
    if (!mongoose.isValidObjectId(item.product)) {
      return { data: "Product not found", statusCode: 400 };
    }
    const product = await ProductModel.findById(item.product);
    if (!product) return { data: "Product not found", statusCode: 400 };

    const orderItem: IOrderItem = {
      productTitle: product.title,
      productImage: product.image,
      quantity: item.quantity,
      unitprice: item.unitPrice,
    };

    orderItems.push(orderItem);
  }

  const order = await orderModel.create({
    userId,
    orderItems,
    address,
    total: cart.totalAmount,
  });

  cart.status = "completed";

  await cart.save();

  return { data: order, statusCode: 200 };
};

export const getOrderByUserId = async ({ userId }: { userId: string }) => {
  const order = await orderModel.find({ userId: userId });

  return { data: order, statusCode: 200 };
};
