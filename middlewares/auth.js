import { expressjwt } from "express-jwt";
import { UserModel } from "../models/user_model.js";
import { TokenBlacklistModel } from "../models/token_model.js";

export const isAuthenticated = async (req, res, next) => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json("No token provided");
      }
      const token = authHeader.split(" ")[1];
  
      // Check if token is blacklisted
      const blacklisted = await TokenBlacklistModel.findOne({ token });
      if (blacklisted) {
        return res.status(401).json("Token is invalid");
      }
  
      // Proceed with express-jwt verification
      expressjwt({
        secret: process.env.JWT_SECRET_KEY,
        algorithms: ["HS256"],
      })(req, res, (err) => {
        if (err) {
          return res.status(401).json("Invalid or expired token");
        }
        next();
      });
    } catch (error) {
      res.status(500).json("Server error during authentication");
    }
  };

export const isAuthorized = (roles) => {
    return async (req, res, next) => {
        // find user by id
        const user = await UserModel.findById(req.auth.id);
        // check if roles includes user role
        if (roles?.includes(user.role)) {
            next();
        } else {
            res.status(403).json('you are not authorized!')
        }
    }
};
