import { UserModel } from "../models/user_model.js";
import { mailTransporter, registerUserMailTemplate } from "../utilities/mail.js";
import { registerUserValidator, updateUserValidator } from "../validators/user_validator.js";
import { loginUserValidator } from "../validators/user_validator.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res, next) => {
    // validate user information
    const { error, value } = registerUserValidator.validate(req.body);
    if (error) {
      return res.status(422).json(error);
    }
    // check if user does not exist already
    const user = await UserModel.findOne({
      $or: [{ username: value.username }, { email: value.email }],
    });
    if (user) {
      return res.status(409).json("user already exists!");
    }
    // hash plaintext password
    const hashPassword = bcrypt.hashSync(value.password, 10);
  
    // creater user record in database
    const result = await UserModel.create({
      ...value,
      password: hashPassword,
    });
    // send registration email to user
    await mailTransporter.sendMail({
      from: 'keskot87@gmail.com',
      to: value.email,
      subject: 'checking out nodemailer',
      html: registerUserMailTemplate.replace('{{username}}', value.username),
    })
    // (optionally) generate access token for user
    // return response
    res.status(201).json("user registered successfully!");
  };
  
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
    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "24h",
    });
  
    //  return response
    res.status(200).json({ accessToken,
      role: user.role,
      email: user.email,
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
  