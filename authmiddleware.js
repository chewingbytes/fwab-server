import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const JWT_SECRET = process.env.JWT_TOKEN;

export const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    console.log("Token from cookie:", token); 
  
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
  
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error("Token verification error:", err); 
        return res.status(403).json({ message: "Invalid token" });
      }
  
      req.user = decoded; 
      console.log("Decoded user:", decoded); 
      next();
    });
  };
  