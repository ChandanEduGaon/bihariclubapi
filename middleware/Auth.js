import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const secret = process.env.JWT_SECRET;

export const verifyUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token not provided" });
  }

  // Verify JWT token
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      
      return res.status(200).json({ msg: "Failed to authenticate token", status: 'expired' });
    }
    req.userId = decoded.userId;
    next();
  });
};
