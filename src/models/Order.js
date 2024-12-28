const mongoose = require('mongoose');

// Define Product schema
const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        stock: {
            type: Number,
            required: true,
            default: 0,
        },
        imageUrl: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Define Order schema
const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User', // This references the User model
        },
        products: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: 'Product', // This references the Product model
                },
                quantity: {
                    type: Number,
                    required: true,
                    default: 1,
                },
            },
        ],
        totalPrice: {
            type: Number,
            required: true,
        },
        shippingAddress: {
            type: String,
            required: true,
        },
        paymentStatus: {
            type: String,
            default: 'Pending', // You can track the status of the payment
            enum: ['Pending', 'Completed', 'Failed'],
        },
        orderStatus: {
            type: String,
            default: 'Processing', // Track the order status
            enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
        },
        dateCreated: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Use existing models or define new ones
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

module.exports = { Order, Product };
