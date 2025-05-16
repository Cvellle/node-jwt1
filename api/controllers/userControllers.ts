import { Request, Response } from "express";
import User from "../models/User";
import fs from "fs";
import path from "path";
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

interface AuthRequest extends Request {
  user?: any;
  file?: any;
}

interface AuthResponse extends Response {
  user?: any;
  file?: any;
}


export const signinUser = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "email and password are required." });

    const foundUser: any = await User.findOne({ email: email }).exec();

    if (!foundUser) return res.sendStatus(401); //Unauthorized
    // evaluate password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(foundUser.password, salt);
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
      // Creates Secure Cookie with refresh token
      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        secure: true,
        // fixed
        sameSite: "None" as unknown as boolean | "strict" | "lax" | "none",
        maxAge: 24 * 60 * 60 * 1000,
      });

      // Send authorization roles and access token to user
      res.json({ roles, accessToken, refreshToken });
      // res.status(201).json(foundUser);
    } else {
      res.sendStatus(401);
    }
  } catch (err) {
    console.log("Something went wrong", err);
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

export const getCurrentUser = async (req: AuthRequest, res: AuthResponse) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err: any) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const handleRefreshToken = async (req: AuthRequest, res: AuthResponse) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(401);
  const refreshToken = cookies.jwt;

  const foundUser = await User.findOne({ refreshToken }).exec();
  if (!foundUser) return res.sendStatus(403); //Forbidden
  // evaluate jwt
  // fix types any
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err: any, decoded: any) => {
    if (err || foundUser.username !== decoded.username)
      return res.sendStatus(403);
    const roles = Object.values(foundUser.roles);
    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: decoded.username,
          roles: roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "10s" }
    );
    res.json({ roles, accessToken, refreshToken });
  });
};

export const handleLogout = async (req: AuthRequest, res: Response) => {
  // On client, also delete the accessToken

  const cookies = req.cookies;
  if (!cookies?.jwt) return res?.sendStatus(204); //No content
  const refreshToken = cookies.jwt;

  // Is refreshToken in db?
  const foundUser = await User.findOne({ refreshToken }).exec();
  if (!foundUser) {
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None" as unknown as boolean | "strict" | "lax" | "none", secure: true });
    return res?.sendStatus(204);
  }

  // Delete refreshToken in db
  foundUser.refreshToken = "";
  const result = await foundUser.save();
  console.log(result);

  res?.clearCookie("jwt", { httpOnly: true, sameSite: "None" as unknown as boolean | "strict" | "lax" | "none", secure: true });
  res?.sendStatus(204);
};

export const uploadProfile = async (req: AuthRequest, res: Response) => {
  const file = req.file;
  const user = req.user;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // Delete old profile image (if any)
  if (user.profileImage?.path) {
    try {
      fs.unlinkSync(path.resolve(user.profileImage.path));
    } catch (err) {
      console.warn("Old file not found:", err);
    }
  }

  // Update user document
  user.profileImage = {
    filename: file.filename,
    path: file.path,
    size: file.size,
    mimetype: file.mimetype,
    uploadDate: new Date(),
  };

  await user.save();

  res.status(200).json({
    message: "Profile image uploaded",
    profileImage: user.profileImage,
  });
};
