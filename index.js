import express from "express";
import mongoose from "mongoose";
import userRouter from "./routes/user_route.js";

await mongoose.connect(process.env.MONGO_URI);

const app = express();

app.use(express.json());

app.use(userRouter);

app.listen(3030, () => {
    console.log("server is active")
})