import { userModel } from "../models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface IRegister {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface ILogin {
  email: string;
  password: string;
}

export const register = async ({
  firstName,
  lastName,
  email,
  password,
}: IRegister) => {
  const user = await userModel.findOne({ email: email });

  if (user) return { data: "User Already Exists", statusCode: 400 };

  const hashedPasseword = await bcrypt.hash(password, 10);

  const newUser = new userModel({
    firstName,
    lastName,
    email,
    password: hashedPasseword,
  });

  await newUser.save();

  return { data: generateJWT({ firstName, lastName, email }), statusCode: 200 };
};

export const login = async ({ email, password }: ILogin) => {
  const user = await userModel.findOne({ email });

  if (!user) return { data: "Incorrect email or password", statusCode: 400 };

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (passwordMatch)
    return {
      data: generateJWT({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      }),
      statusCode: 200,
    };

  return { data: "Incorrect email or password", statusCode: 400 };
};

const generateJWT = (data: any) => {
  return jwt.sign(data, process.env.JWT_SECRET || "", {
    expiresIn: "24h",
  });
};

// "snQmsKy3DIiOhwMem5Zr1MtXzV3oDwFM"
