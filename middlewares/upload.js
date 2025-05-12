import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  export const productPicturesUpload = multer({
    storage: new CloudinaryStorage({
        cloudinary,
        params: {
            folder: 'evemens-uploads',
            // format: async (req, file) => 'png', // supports promises as well
            public_id: (req, file) => file.originalname,
        }
    })    
});