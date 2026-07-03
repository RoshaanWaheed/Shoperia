import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();


console.log('Cloudinary config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? 'set' : 'not set',
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'set' : 'not set',
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, 
});




router.post('/', upload.single('image'), async (req, res) => {
  console.log('=== Upload Request ===');
  console.log('File:', req.file);
  
  if (!req.file) {
    console.log('ERROR: No file uploaded');
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    console.log('Starting Cloudinary upload...');
    
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    let dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
    
    console.log('Uploading to Cloudinary...');
    
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'ecommerce/products',
      public_id: `${Date.now()}-${req.file.originalname.split('.')[0]}`,
    });

    console.log('File uploaded successfully:', result.secure_url);
    res.json({
      url: result.secure_url,
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ message: 'Image upload failed: ' + error.message });
  }
});

export default router;
