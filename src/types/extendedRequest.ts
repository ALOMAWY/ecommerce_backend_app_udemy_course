import { Request } from "express";
import { IUser } from "../models/user";

export interface ExtendsRequest extends Request {
  user?: IUser | null;
}
