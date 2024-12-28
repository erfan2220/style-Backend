const express = require('express');
const router=express.Router();
const protect=require("../middleware/authMiddleware");

const {isAdmin}=require("../middleware/adminMiddleware");

const {createProduct,getProducts,getProductById,updateProduct,deleteProduct}=require("../controllers/productController");


router.get('/', getProducts);
router.get('/:id', getProductById);


router.post('/',protect,isAdmin, createProduct);
router.put('/:id',protect,isAdmin, updateProduct);
router.delete('/:id',protect,isAdmin, deleteProduct);

module.exports = router; 
