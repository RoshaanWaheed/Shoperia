import Product from '../models/Product.js';

const getProducts = async (req, res) => {
  try {
    const pageSize = 10;
    const page     = Number(req.query.pageNumber) || 1;
    const keyword  = req.query.keyword || '';

    let filter = {};

    if (keyword) {
      const kw = keyword.toLowerCase();

      
      
      const MEN   = { $regex: '^men',   $options: 'i' };
      const WOMEN = { $regex: '^women', $options: 'i' };
      const KIDS  = { $regex: '^kids',  $options: 'i' };

      const subcategoryMap = {
        'men-tshirts':     { category: MEN,   subcategory: { $regex: 't-shirt',                              $options: 'i' } },
        'men-shirts':      { category: MEN,   subcategory: { $regex: 'shirt',                                $options: 'i' } },
        'men-pants':       { category: MEN,   subcategory: { $regex: 'pant',                                 $options: 'i' } },
        'men-jackets':      { category: MEN,   subcategory: { $regex: 'jacket',                               $options: 'i' } },
        'men-suits':       { category: MEN,   subcategory: { $regex: 'suit',                                 $options: 'i' } },
        'men-footwear':    { category: MEN,   subcategory: { $regex: 'footwear|shoe|sneaker|boot|formal',    $options: 'i' } },
        'men-sneakers':    { category: MEN,   subcategory: { $regex: 'sneaker',                              $options: 'i' } },
        'men-formal':      { category: MEN,   subcategory: { $regex: 'formal',                               $options: 'i' } },
        'men-boots':       { category: MEN,   subcategory: { $regex: 'boot',                                 $options: 'i' } },
        'men-accessories': { category: MEN,   subcategory: { $regex: 'access|bag|belt|watch|sunglass',       $options: 'i' } },
        'men-bags':        { category: MEN,   subcategory: { $regex: 'bag|belt',                             $options: 'i' } },
        'men-belts':       { category: MEN,   subcategory: { $regex: 'belt',                                 $options: 'i' } },
        'men-watches':     { category: MEN,   subcategory: { $regex: 'watch',                                $options: 'i' } },
        'men-sunglasses':  { category: MEN,   subcategory: { $regex: 'sunglass',                             $options: 'i' } },

        'women-dresses':    { category: WOMEN, subcategory: { $regex: 'dress',                               $options: 'i' } },
        'women-tops':       { category: WOMEN, subcategory: { $regex: 'top',                                 $options: 'i' } },
        'women-jeans':      { category: WOMEN, subcategory: { $regex: 'jean|pant',                           $options: 'i' } },
        'women-jackets':    { category: WOMEN, subcategory: { $regex: 'jacket',                              $options: 'i' } },
        'women-skirts':     { category: WOMEN, subcategory: { $regex: 'skirt',                               $options: 'i' } },
        'women-footwear':   { category: WOMEN, subcategory: { $regex: 'footwear|heel|boot|sneaker|flat',     $options: 'i' } },
        'women-heels':      { category: WOMEN, subcategory: { $regex: 'heel',                                $options: 'i' } },
        'women-sneakers':   { category: WOMEN, subcategory: { $regex: 'sneaker',                             $options: 'i' } },
        'women-boots':      { category: WOMEN, subcategory: { $regex: 'boot',                                $options: 'i' } },
        'women-accessories':{ category: WOMEN, subcategory: { $regex: 'access|bag|purse|jewel|sunglass',     $options: 'i' } },
        'women-bags':       { category: WOMEN, subcategory: { $regex: 'bag|purse',                           $options: 'i' } },
        'women-jewelry':    { category: WOMEN, subcategory: { $regex: 'jewel',                               $options: 'i' } },
        'women-sunglasses': { category: WOMEN, subcategory: { $regex: 'sunglass',                            $options: 'i' } },

        'boys':             { category: KIDS,  subcategory: { $regex: 'boy',    $options: 'i' } },
        'girls':            { category: KIDS,  subcategory: { $regex: 'girl',   $options: 'i' } },

        'sale': { $or: [{ category: { $regex: 'sale', $options: 'i' } }, { salePrice: { $exists: true, $gt: 0 } }] },
        'new':  { category: { $regex: 'new', $options: 'i' } },

        
        'accessories': {
          $or: [
            { category: MEN,   subcategory: { $regex: 'access|bag|belt|watch|sunglass',   $options: 'i' } },
            { category: WOMEN, subcategory: { $regex: 'access|bag|purse|jewel|sunglass',   $options: 'i' } },
          ],
        },
      };

      if (subcategoryMap[kw]) {
        filter = subcategoryMap[kw];
      } else if (['men', 'women', 'kids'].includes(kw)) {
        filter = { category: { $regex: `^${kw}$`, $options: 'i' } };
      } else {
        filter = {
          $or: [
            { name:        { $regex: kw, $options: 'i' } },
            { brand:       { $regex: kw, $options: 'i' } },
            { category:    { $regex: kw, $options: 'i' } },
            { subcategory: { $regex: kw, $options: 'i' } },
          ],
        };
      }
    }

    const count = await Product.countDocuments(filter);

    
    const actualPageSize = !keyword ? 1000 : pageSize;

    const products = await Product.find(filter)
      .limit(actualPageSize)
      .skip(actualPageSize * (page - 1));

    res.json({ products, page, pages: Math.ceil(count / actualPageSize) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFeaturedProducts = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 12;
    const products = await Product.find({ isFeatured: true })
      .sort({ featuredAt: -1 })
      .limit(limit);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const product = new Product({
      name:         'New Product',
      price:        0,
      user:         req.user._id,
      image:        'https://placehold.co/400x300?text=New+Product',
      images:       [],
      brand:        'Brand',
      category:     'Men',
      subcategory:  '',
      sku:          '',
      fabric:       '',
      countInStock: 0,
      numReviews:   0,
      rating:       0,
      description:  'Product description',
      sizes:        [],
      colors:       [],
      inseam:       [],
      salePrice:    null,
      isFeatured:   false,
      showStockToCustomers: true,
    });
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const {
      name, price, salePrice, description,
      image, images, brand, category, subcategory,
      sku, fabric, countInStock, sizes, colors, inseam, isFeatured,
      showStockToCustomers,
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (name         !== undefined) product.name         = name;
    if (price        !== undefined) product.price        = Number(price);
    if (salePrice    !== undefined) product.salePrice    = salePrice ? Number(salePrice) : null;
    if (description  !== undefined) product.description  = description;
    if (image        !== undefined) product.image        = image;
    if (images       !== undefined) product.images       = images;
    if (brand        !== undefined) product.brand        = brand;
    if (category     !== undefined) product.category     = category;
    if (subcategory  !== undefined) product.subcategory  = subcategory;
    if (sku          !== undefined) product.sku          = sku;
    if (fabric       !== undefined) product.fabric       = fabric;
    if (countInStock !== undefined) product.countInStock = Number(countInStock);
    if (sizes        !== undefined) product.sizes        = sizes;
    if (colors       !== undefined) product.colors       = colors;

    
    
    
    
    if (inseam !== undefined) {
      product.inseam = Array.isArray(inseam) ? inseam : [];
    }

    if (isFeatured !== undefined) {
      const newValue = Boolean(isFeatured);
      
      
      if (newValue) {
        product.featuredAt = new Date();
      } else {
        product.featuredAt = null;
      }
      product.isFeatured = newValue;
    }
    if (showStockToCustomers !== undefined) product.showStockToCustomers = Boolean(showStockToCustomers);

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProductReview = async (req, res) => {
  try {
    const { rating, comment, orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'orderId is required to leave a review' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    
    
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString() && r.order?.toString() === orderId
    );
    if (alreadyReviewed) return res.status(400).json({ message: 'This order has already been reviewed' });

    product.reviews.push({
      name:   req.user.name,
      rating: Number(rating),
      comment,
      user:   req.user._id,
      order:  orderId,
    });

    product.numReviews = product.reviews.length;
    product.rating     = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const getAllReviews = async (req, res) => {
  try {
    const products = await Product.find({ 'reviews.0': { $exists: true } })
      .select('name image reviews')
      .lean();

    const allReviews = [];
    products.forEach((product) => {
      product.reviews.forEach((review) => {
        allReviews.push({
          _id: review._id,
          productId: product._id,
          productName: product.name,
          productImage: product.image,
          user: review.user,
          name: review.name,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
        });
      });
    });

    
    allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(allReviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getProducts,
  getFeaturedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getAllReviews,
};