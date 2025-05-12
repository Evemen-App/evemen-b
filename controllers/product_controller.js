import { ProductModel } from "../models/product_model.js";
import { addProductValidator, updateProductValidator } from "../validators/product_validator.js";


export const addProduct = async (req, res, next) => {
  try {
    console.log(req.auth);
    // Validate product information
    const { error, value } = addProductValidator.validate({
      ...req.body,
      pictures: req.files?.map((file) => {
        return file.filename;
      }),
    });
    if (error) {
      return res.status(422).json(error);
    }

    // Save product information in database
    const result = await ProductModel.create({
      ...value,
      userID: req.auth.id,
    });
    // Return response
    res.status(201).json(result);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).Json(error.message);
    }
    next(error);
  }
};

export const getProducts = async (req, res) => {
  try {
    const { filter = "{}", sort = "{}" } = req.query;
    // Fetch products from database
    const result = await ProductModel.find(JSON.parse(filter)).sort(
      JSON.parse(sort)
    );
    // Return response
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const updateProducts = async (req, res, next) => {
    try {
        // validate request body
        const { error, value } = updateProductValidator.validate({
            ...req.body,
            pictures:req.files?.map((file) => {
                return file.filename;
            }),
        });
        if (error) {
            return res.status(422).json(error);
        }
        // Update product information in database
        const result = await ProductModel.findByIdAndUpdate(req.params.id,value,{
            new: true,
            runValidators: true,
        });
        // Check if product exists 
        if (!result) {
            return res.status(404).json({message: "Product not found"});
        }
        // Return updated product
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const deleteProducts = async (req, res, next) => {
    try {
      const { id } = req.params;
      await ProductModel.findByIdAndDelete(id).exec();
      if (!deleteProducts) {
        return res.status(404).json({
          message: "Product not found!",
        });
      }
      res.json({ message: "Product deleted successfully!" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };