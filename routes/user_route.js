import { Router } from "express";
import {forgotPassword, getAuthenticatedUser, loginUser, logoutUser, resetPassword, updateUser} from "../controllers/user_controller.js";
import { isAuthenticated } from "../middlewares/auth.js";

const userRouter = Router();

userRouter.post('/user/login', loginUser);

userRouter.patch('/user/:id', updateUser);

userRouter.get('/user/me', isAuthenticated, getAuthenticatedUser);

// Route for requesting a password reset
userRouter.post('/forgot-password', forgotPassword);

// Route for resetting the password with a token
userRouter.post('/reset-password', resetPassword);

userRouter.post("/user/logout", isAuthenticated, logoutUser);

export default userRouter;