import Joi from "joi";

export const addProductValidator = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().required(),
    description: Joi.string().required(),
    pictures: Joi.array().items(Joi.string().required())
});

export const updateProductValidator = Joi.object({
    name: Joi.string(),
    price: Joi.number(),
    description: Joi.string(),
    pictures:Joi.array().items(Joi.string())
});