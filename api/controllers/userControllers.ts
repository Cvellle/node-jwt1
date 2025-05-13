import { Request, Response } from "express";
import User from "../models/User";
const bodyParser = require("body-parser");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

export const signinUser = async (req: any, res: any) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "email and password are required." });

    const foundUser: any = await User.findOne({ username: username }).exec();

    if (!foundUser) return res.sendStatus(401); //Unauthorized
    // evaluate password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const match = await bcrypt.compare(password, hashedPassword);
    if (match) {
      const roles = Object.values(foundUser.roles).filter(Boolean);
      // create JWTs
      const accessToken = jwt.sign(
        {
          UserInfo: {
            email: foundUser.email,
            roles: roles,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "10s" }
      );
      const refreshToken = jwt.sign(
        { email: foundUser.email },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" }
      );
      // Saving refreshToken with current user
      foundUser.refreshToken = refreshToken;

      // original
      // const result = await foundUser.save();
      await foundUser.save();
      res.status(201).json(foundUser);
      // Creates Secure Cookie with refresh token
      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 24 * 60 * 60 * 1000,
      });

      // Send authorization roles and access token to user
      res.json({ roles, accessToken });
    } else {
      res.sendStatus(401);
    }
  } catch (err) {
    console.log('Something went wrong', err);
  }
};

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const newUser = new User({ email, password });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error: error });
  }
};
