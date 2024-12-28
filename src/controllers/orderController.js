const { Order, Product } = require('../models/Order');
// const User=require("../models/User")

const findOrder = async (orderId, userId, isAdmin = false) => {
    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');
    if (!isAdmin && order.user.toString() !== userId) throw new Error('Unauthorized');
    return order;
};

const createOrder=async (req,res) =>
{

    const {products,shippingAddress,totalPrice}=req.body;

    try {

        for(const items of products)
        {
            const product=await Product.findById(item.product);

            if(!product)
            {
                return res.status(400).json({message:`Product with id ${item.product} not found`});
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for product: ${product.name}` });
            }
            product.stock -= item.quantity;
            await product.save();
        }

        const order=new Order({
            user:req.user.id,
            products,
            shippingAddress,
            totalPrice
        });


        await order.save();
        res.status(201).json(order);
    }
    catch (error)
    {
        res.status(500).json({message:'Error creating order'})
    }
}


const getUserOrders =async (req,res)=>
{
    try
    {
        const orders=await Order.find({user:req.user.id});
        res.json(orders)
    }

    catch (error)
    {
        console.error(error);
        res.status(500).json({message:'error fetching orders'})
    }
}



const getOrderDetails=async (req,res)=>
{
    try
    {
        const order =await findOrder(req.params.id,req.user.id);

       res.json(order);

    }

    catch (error)
    {
        res.status(500).json({message:'Error fetching order details'})
    }
}


const updateOrderStatus =async (req,res)=>
{

    const {status}=req.body;

    try{
        const order = await findOrder(req.params.id, req.user.id, true);
        order.orderStatus = status;
        await order.save()
        res.json(order)
    }
    catch (error)
    {
        res.status(400).json({ message: error.message });
    }
}

const cancelOrder = async (req,res)=>
{
    try{
        const order = await findOrder(req.params.id, req.user.id);


        for(const item of order.products)
        {
            const product = await Product.findById(item.product);

            if (product) {
                product.stock += item.quantity;
                await product.save();
            }
        }
        order.orderStatus = 'Cancelled';
        await order.save();
        res.json(order);;
    }
    catch (error)
    {
        res.status(400).json({message:"Error canceling order"});
    }

}

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('user', 'name email').sort({ dateCreated: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error });
    }
};



module.exports={getAllOrders,createOrder,cancelOrder,getUserOrders,getOrderDetails,updateOrderStatus};

