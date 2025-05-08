import express from "express";
import mongoose from "mongoose";
import userRouter from "./routes/user_route.js";

await mongoose.connect(process.env.MONGO_URI);

const app = express();

const port = process.env.PORT || 5000

app.use(express.json());

app.use(userRouter);

app.listen(port, () => {
    console.log("server is active")
});