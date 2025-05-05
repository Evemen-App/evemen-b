import { UserModel } from "../models/user_model.js";
import { updateUserValidator } from "../validators/user_validator.js";
import { loginUserValidator } from "../validators/user_validator.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const loginUser = async (req, res, next) => {
  // validate user information
  const { error, value } = loginUserValidator.validate(req.body);
  if (error) {
    return res.status(422).json(error);
  }
  // find matching user record in database
  const user = await UserModel.findOne({
    $or: [{ username: value.username }, { email: value.email }],
  });
  if (!user) {
    return res.status(404).json("user does not exist!");
  }
  // compare incoming password with saved password
  const correctPassword = bcrypt.compareSync(value.password, user.password);
  if (!correctPassword) {
    res.status(401).json("invalid credentials");
  }
  // generate access token for user
  const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "24h",
  });

  //  return response
  res.status(200).json({ accessToken,
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
   });
};
export const updateUser = async (req, res, next) => {
  // validate request body
  const { error, value } = updateUserValidator.validate(req.body);
  if (error) {
    return res.status(422).json(error);
  }
  // update user in database
  const result = await UserModel.findByIdAndUpdate(req.params.id, value, {
    new: true,
  });
  // return response
  res.status(200).json("user updated successfully");
};

export const getAuthenticatedUser = async (req, res, next) => {
  try {
    // get user by id using req.auth.id
    const result = await UserModel
        .findById(req.auth.id)
        .select({
      password: false,
    });
    // return response
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    // Optional: Check if user is authenticated
    if (!req.auth?.id) {
      return res.status(401).json("No user is authenticated");
    }

    // Respond with success message
    res.status(200).json("User logged out successfully");
  } catch (error) {
    next(error);
  }
};