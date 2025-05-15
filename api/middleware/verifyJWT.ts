import { Request, Response, NextFunction } from "express";
const { jwt } = require("jsonwebtoken");
import { JwtPayload } from "jsonwebtoken";

// Extend the Request interface to include 'user'
interface AuthenticatedRequest extends Request {
  user?: string | JwtPayload;
}

export const verifyJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Response | void => {
  const authHeader =
    req.headers.authorization || (req.headers.Authorization as string);

  const token = authHeader && authHeader.split(" ")[1]; // Expecting "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
