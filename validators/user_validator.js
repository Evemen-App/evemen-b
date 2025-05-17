import Joi from "joi";

export const registerUserValidator = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().required(),
    confirmPassword: Joi.ref('password')
}).with('password', 'confirmPassword');

export const loginUserValidator = Joi.object({
    username: Joi.string().optional(),
    email: Joi.string().optional(),
    password: Joi.string().required(),
});

export const updateUserValidator = Joi.object({
    role: Joi.string().valid("guest", "admin")
    .required(),
});

export const forgotPasswordValidator = Joi.object({
    email: Joi.string().required(),
  });
  
export const resetPasswordValidator = Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string().required(),
    confirmPassword: Joi.string().required().valid(Joi.ref('newPassword')).messages({
        'any.only': '"confirmPassword" must match newPassword',}),
    });