import { Router} from "express";
import { isAuthenticated, isAuthorized } from "../middlewares/auth.js";
import { productPicturesUpload } from "../middlewares/upload.js";
import { addProduct, deleteProducts, getProducts, updateProducts } from "../controllers/product_controller.js";

// Create products router
const productsRouter = Router();

// Define routes
productsRouter.post(
    '/products/add', 
    isAuthenticated,
    isAuthorized(['superadmin', 'admin']),
    productPicturesUpload.array('pictures', 3), 
    addProduct);

productsRouter.get('/products/get', getProducts);

productsRouter.patch('/products/:id', isAuthenticated, updateProducts);

productsRouter.delete('/products/:id', isAuthenticated, deleteProducts);

// Export router
export default productsRouter;