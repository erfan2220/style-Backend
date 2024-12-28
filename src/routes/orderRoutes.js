const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {getAllOrders, createOrder, getUserOrders, getOrderDetails, cancelOrder,updateOrderStatus } = require('../controllers/orderController');
const {isAdmin}=require("../middleware/adminMiddleware")


// Create a new order (Protected route, requires authentication)
router.post('/', protect, createOrder);

// Get all orders for a specific user (Protected route, requires authentication)
router.get('/', protect, getUserOrders);

// Get details of a specific order by ID (Protected route, requires authentication)
router.get('/:id', protect, getOrderDetails);

router.put('/:id/cancel', protect, cancelOrder); // Cancel an order

// Admin Routes
router.get('/admin', protect, isAdmin, getAllOrders); // Get all orders (Admin only)
router.put('/:id/status', protect, isAdmin, updateOrderStatus); // Update order status (Admin only)

// Update order status (Protected route, requires authentication)
router.put('/:id/status', protect, cancelOrder);

module.exports = router;
