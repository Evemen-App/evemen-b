import { Schema, model } from "mongoose";
import normalize from "normalize-mongoose";

const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {type: String, default: 'guest', enum: ['guest', 'admin']},
    resetPasswordToken: { type: String }, 
    resetPasswordExpires: { type: Date },
},{
    timestamps: true 
});

userSchema.plugin(normalize);

export const UserModel = model("User", userSchema);