import Order from '../models/Order.js';
import Product from '../models/Product.js';




const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items');
    }

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};







const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email').lean();
    if (!order) return res.status(404).json({ message: 'Order not found' });

    
    
    if (order.status === 'Delivered') {
      const productIds = order.orderItems.map((item) => item.product);
      const products = await Product.find({ _id: { $in: productIds } }).select('reviews').lean();

      order.reviewedProductIds = products
        .filter((p) =>
          p.reviews.some(
            (r) => r.user.toString() === req.user._id.toString() && r.order?.toString() === order._id.toString()
          )
        )
        .map((p) => p._id.toString());
    } else {
      order.reviewedProductIds = [];
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address
      };
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




const markOrderAsDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      order.status = 'Delivered';

      
      const method = (order.paymentMethod || '').toLowerCase();
      const isCOD = method.includes('cod') || method.includes('cash on delivery') || method.includes('cash');
      if (isCOD && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = Date.now();
      }

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    
    
    
    const cancellableFrom = ['Pending', 'Confirmed'];
    if (status === 'Cancelled' && !cancellableFrom.includes(order.status)) {
      return res.status(400).json({
        message: `Order cannot be cancelled once it is ${order.status}.`,
      });
    }

    const previousStatus = order.status;
    order.status = status;

    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = order.deliveredAt || Date.now();

      
      
      
      const method = (order.paymentMethod || '').toLowerCase();
      const isCOD = method.includes('cod') || method.includes('cash on delivery') || method.includes('cash');
      if (isCOD && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = Date.now();
      }
    } else if (status === 'Cancelled') {
      order.isDelivered = false;
      order.deliveredAt = undefined;

      
      
      if (previousStatus !== 'Cancelled') {
        for (const item of order.orderItems) {
          await Product.findByIdAndUpdate(
            item.product,
            { $inc: { countInStock: item.qty } }
          );
        }
      }
    } else {
      
      order.isDelivered = false;
      order.deliveredAt = undefined;
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};







const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).lean();

    
    
    
    const Product = (await import('../models/Product.js')).default;

    const ordersWithReviewStatus = await Promise.all(
      orders.map(async (order) => {
        if (order.status !== 'Delivered') {
          return { ...order, reviewedProductIds: [] };
        }

        const productIds = order.orderItems.map((item) => item.product);
        const products = await Product.find({ _id: { $in: productIds } }).select('reviews').lean();

        const reviewedProductIds = products
          .filter((p) =>
            p.reviews.some(
              (r) => r.user.toString() === req.user._id.toString() && r.order?.toString() === order._id.toString()
            )
          )
          .map((p) => p._id.toString());

        return { ...order, reviewedProductIds };
      })
    );

    res.json(ordersWithReviewStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const getPendingReviewOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
      status: 'Delivered',
      reviewPopupShown: false,
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




const markReviewPopupShown = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    order.reviewPopupShown = true;
    await order.save();
    res.json({ message: 'Popup marked as shown' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  markOrderAsDelivered,
  updateOrderStatus,
  getMyOrders,
  getAllOrders,
  getPendingReviewOrders,
  markReviewPopupShown,
};