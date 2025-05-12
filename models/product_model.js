import { Schema, model, Types } from "mongoose";

const productSchema = new Schema({
    name: {type: String, required: true, unique: [true, 'Product name must be unique'] },
    price: {type: Number, required: true},
    description: {type: String, required: true},
    pictures: [{type: String, required: true}],
    userID: { type: Types.ObjectId, required: true, ref: 'User'}
},{
    timestamps: true
});

export const ProductModel = model('Product', productSchema)