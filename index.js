import express from "express";
import mongoose from "mongoose";
import userRouter from "./routes/user_route.js";
import productsRouter from "./routes/product_route.js";
import cors from "cors";

await mongoose.connect(process.env.MONGO_URI);

const app = express();

app.use(cors());

const port = process.env.PORT || 5000

app.use(express.json());

app.use(userRouter);
app.use(productsRouter);

app.listen(port, () => {
    console.log("server is active")
});