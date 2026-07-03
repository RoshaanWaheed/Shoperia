import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  name:    { type: String, required: true },
  rating:  { type: Number, required: true },
  comment: { type: String, required: true },
}, { timestamps: true })

const productSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },

  
  name:        { type: String,  required: true },
  brand:       { type: String,  required: true },
  description: { type: String,  required: true },

  
  category:    { type: String,  required: true },   
  subcategory: { type: String,  default: '' },       

  
  sku:         { type: String,  default: '' },
  fabric:      { type: String,  default: '' },       

  
  image:       { type: String,  required: true },    
  images:      [{ type: String }],                   

  
  price:       { type: Number,  required: true, default: 0 },
  salePrice:   { type: Number,  default: null },     

  
  sizes:       [{ type: String }],                   
  colors:      [{ type: String }],                   
  inseam:      [{ type: String }],                   

  
  countInStock: { type: Number, required: true, default: 0 },
  rating:       { type: Number, required: true, default: 0 },
  numReviews:   { type: Number, required: true, default: 0 },
  reviews:      [reviewSchema],

  
  isFeatured:   { type: Boolean, default: false },   
   featuredAt:   { type: Date, default: null },        

  
  showStockToCustomers: { type: Boolean, default: true }, 

}, { timestamps: true })

const Product = mongoose.model('Product', productSchema)
export default Product