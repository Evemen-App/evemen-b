import mongoose from "mongoose";
import { UserModel } from "../models/user_model.js";
import { mailTransporter, registerUserMailTemplate } from "../utilities/mail.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// MongoDB connection function
const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error; // Exit if connection fails
  }
};

const seedUser = async () => {
  try {
    // Connect to MongoDB
    await connectToMongoDB();

    // Check if user already exists
    const existingUser = await UserModel.findOne({
      $or: [{ username: process.env.SEED_NAME }, { email: process.env.EMAIL_SEED }],
    });

    if (existingUser) {
      console.log("User already exists!");
      return;
    }

    // Hash the password
    const password = process.env.EMAIL_SEEDPASSWORD
    const hashPassword = bcrypt.hashSync(password, 10);

    // Create new user
    const newUser = await UserModel.create({
      username: process.env.SEED_NAME,
      email: process.env.EMAIL_SEED,
      password: hashPassword,
      role: "admin",
    });

    // Send registration email to user
    await mailTransporter.sendMail({
      from: process.env.EMAIL_USER,
      to: newUser.email,
      subject: "Get Started!",
      html: registerUserMailTemplate.replace("{{username}}", newUser.username),
    });

    console.log("User seeded successfully and email sent:", newUser);
  } catch (error) {
    console.error("Error seeding user or sending email:", error);
  } finally {
    // Close the MongoDB connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log("MongoDB connection closed");
    }
  }
};

// Run the seed function
seedUser();