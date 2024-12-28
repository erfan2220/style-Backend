// import express from "express";
const express=require('express')
// import {registerUser,loginUser} from "../controllers/userController";
const {logoutUser,refreshAccessToken,verifyEmail,forgotPassword, resetPassword, getUserProfile,updateUserProfile,registerUser,loginUser}=require("../controllers/userController")
const router=express.Router();
const protect=require("../middleware/authMiddleware")
const {verify} = require("jsonwebtoken");

router.post('/register',registerUser);
router.post('/login',loginUser);

router.route('/profile')
    .get(protect, getUserProfile)  // GET to fetch user profile
    .put(protect, updateUserProfile);

router.post('/forgot-password',forgotPassword);
router.post('/rest-password',resetPassword);

router.post('/refresh-token',refreshAccessToken);
router.post('/logout',logoutUser);


router.get('/verify-email',verifyEmail)

// router.get("/profile",protect,getUserProfile)
// router.get("/profile",protect,updateUserProfile)


module.exports=router;