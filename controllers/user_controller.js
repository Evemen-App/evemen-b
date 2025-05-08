import { TokenBlacklistModel } from "../models/token_model.js";
import { UserModel } from "../models/user_model.js";
import { mailTransporter, resetPasswordMailTemplate } from "../utilities/mail.js";
import { forgotPasswordValidator, resetPasswordValidator, updateUserValidator } from "../validators/user_validator.js";
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

  // Request a password reset
  export const forgotPassword = async (req, res, next) => {
    // Validate user information
    const { error, value } = forgotPasswordValidator.validate(req.body);
    if (error) {
      return res.status(422).json(error);
    }
  
    // Normalize email
    const email = value.email.toLowerCase().trim();
  
    // Find user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json('User does not exist!');
    }
  
    // Generate a JWT token for password reset
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: parseInt(process.env.RESET_TOKEN_EXPIRY),
    });
  
    // Store the reset token and expiry in the user record
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + process.env.RESET_TOKEN_EXPIRY *1000; 
    await user.save();
    try {
    // Send password reset email
    const resetLink = `${process.env.RESET_LINK_BASE_URL}/reset-password?token=${token}`;
    await mailTransporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: resetPasswordMailTemplate
        .replace('{{username}}', user.username || 'User') 
        .replace('{{resetLink}}', resetLink) 
        .replace('{{token}}', token), 
      text: `Reset your password using this token: ${token}`,
    });
    // Log successful email sending
    console.log('Reset email sent to:', email, 'with token:', token);
    }catch (error) {
    // Log email error and return 500
    console.error('Reset email error:', error);
    return res.status(500).json('Failed to send reset email');
  }
  
    // Return response
    res.status(200).json('Reset email sent successfully!');
  };
  
  // Reset a user's password
  export const resetPassword = async (req, res, next) => {
    // Validate user information
    const { error, value } = resetPasswordValidator.validate(req.body);
    if (error) {
        console.log('Validation error:', error.details);
      return res.status(422).json({ error: error.details });
    }
    // Log incoming token for debugging
    console.log('Received token:', value.token);
    // Check for JWT_SECRET_KEY
    if (!process.env.JWT_SECRET_KEY) {
        return res.status(500).json('Server configuration error: JWT_SECRET_KEY is missing');
      }
    // Verify the JWT token
    let decoded;
    try {
      decoded = jwt.verify(value.token, process.env.JWT_SECRET_KEY);
    } catch (error) {
        console.error('Token verification error:', error.message);
        return res.status(401).json(`Invalid or expired token: ${error.message}`)
    }
  
    // Find user with matching token and valid expiry
    const user = await UserModel.findOne({
      _id: decoded.id,
      resetPasswordToken: value.token,
      resetPasswordExpires: { $gt: Date.now() },
    });
  
    if (!user) {
      return res.status(401).json('Invalid or expired token');
    }
  
    // Hash the new password
    const hashPassword = bcrypt.hashSync(value.newPassword, 10);
  
    // Update user password and clear reset fields
    user.password = hashPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
  
    // Return response
    res.status(200).json('Password reset successfully!');
  };

export const logoutUser = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.auth?.id) {
      return res.status(401).json("No user is authenticated");
    }

    // Get the token from the Authorization header
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(400).json("No token provided");
    }

    // Decode the token to get its expiration
    let expiresAt;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      expiresAt = new Date(decoded.exp * 1000);
    } catch (error) {
      expiresAt = new Date(); // Use current time if token is expired
    }

    // Add token to blacklist
    await TokenBlacklistModel.create({
      token,
      expiresAt,
    });

    // Respond with success message
    res.status(200).json("User logged out successfully");
  } catch (error) {
    next(error);
  }
};