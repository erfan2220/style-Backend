// import jwt from 'jsonwebtoken';
const jwt = require("jsonwebtoken")
const User=require("../models/User")

const protect =async (req,res,next)=>
{
    const authHeader =req.headers.authorization;


    if(!authHeader || !authHeader.startsWith(`Bearer `)){
        return res.status(401).json({error:'Not authorized, no token or invalid format'});
    }

    // const token=req.headers.authorization?.split(' ')[1];

    const token = authHeader.split(' ')[1]

    // if(!token)
    // {
    //     return res.status(401).json({error:'Not authorized, no token'});
    // }

    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        const user= await  User.findById(decoded.id).select('-password');

        if(!user){
            return res.status(404).json({error:'User not found'});
        }

        req.user = user; // Attach user info to request
        next();
    }
    catch (error)
    {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired, please log in again' });
        }

        console.error('Error in protect middleware:', error); // Log unexpected errors
        res.status(401).json({ error: 'Token is not valid' });
    }

};


// export default protect;
module.exports=protect;