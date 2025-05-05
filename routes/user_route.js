import { Router } from "express";
import {getAuthenticatedUser, loginUser, logoutUser, updateUser} from "../controllers/user_controller.js";
import { isAuthenticated } from "../middlewares/auth.js";

const userRouter = Router();

userRouter.post('/user/login', loginUser);

userRouter.patch('/user/:id', updateUser);

userRouter.get('/user/me', isAuthenticated, getAuthenticatedUser);

userRouter.post("/user/logout", isAuthenticated, logoutUser);

export default userRouter;