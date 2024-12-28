const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail=require("../utils/sendEmail")
const crypto =require('crypto');



const forgotPassword= async (req,res)=>
{
    const {email}=req.body;
    try{
        const user= await User.findOne({email});

        if(!user)
        {
            return res.status(404).json({message:'User not found'});
        }

        const resetToken =crypto.randomBytes(32).toString('hex');
        user.resetToken=resetToken;
        user.resetTokenExpiry=Date.now()+ 15*60*1000;
        await  user.save();

        const resetLink = `http://localhost:5000/api/users/reset-password?token=${resetToken}`;
        await sendEmail({
            to:user.email,
            subject:'Password Reset Request',
            text:`Click the following link to reset password:${resetLink}`
        });

        res.json({message:"Password reset link send to your email"})
    }
    catch (error)
    {
     res.status(500).json({message:"Server error"})
    }
}

const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


// Register User
const registerUser = async (req, res) => {
    const { name, email, password ,role} = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken=crypto.randomBytes(32).toString('hex');



        // Create new user
        const user = new User({ name, email, password: hashedPassword,role:role|| 'user',verificationToken });
        await user.save();

        const verificationLink =`http://localhost:5000/api/users/verify-email?token=${verificationToken}`;

        await sendEmail({
            to:email,
            subject:'verify Your Email',
            text:`Click the following link to verify your email:${verificationLink}`
        })


        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Login User
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        if(!user.isVerified)
        {
            return  res.status(403).json({error:'Email not verified. Please check your email.'});
        }

        const token =jwt.sign({id:user._id,email:user.email},process.env.JWT_SECRET,{
            expiresIn:'1h'
        });


        res.json({token,user:{id:user._id,name:user.name,email:user.email}})
        // Compare password
        // const isMatch = await bcrypt.compare(password, user.password);
        // if (!isMatch) {
        //     return res.status(401).json({ error: 'Invalid credentials' });
        // }
        //
        // // Generate JWT token
        // const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
        //     expiresIn: '1h',
        // });

        const accessToken =jwt.sign(
        {id:user._id,email:user.email},
            process.env.JWT_REFRESH_SECRET,
            {expiresIn:process.env.JWT_REFRESH_EXPIRY}
        )


        res.json({
            accessToken,
            refreshToken,
            user: { id: user._id, name: user.name, email: user.email } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};


const refreshAccessToken =async (req,res)=>
{
    const {refreshToken}=req.body;

    if(!refreshToken){
        return res.status(401).json({error:'Refresh token is required'});
    }

    try{
        const decoded=jwt.verify(refreshToken,process.env.JWT_REFRESH_SECRET);

        const accessToken= jwt.sign(
            {id:decoded.id,email:decoded.email},
            process.env.JWT_SECRET,
            {expiresIn: '15m'}
        );

        res.json({accessToken});
    }

catch (error)
{
    res.status(403).json({error:'Invalid or expired refresh token'});
}
}


const logoutUser = async (req, res) => {
    // You can implement token invalidation logic if needed (e.g., maintain a token blacklist).
    res.json({ message: 'Logged out successfully' });
};


const getUserProfile =async (req,res)=>
{
    try
    {
        const user=await User.findById(req.user.id);

        if(!user)
        {
            return res.status(404).json({message:'User not found'})
        }

        res.json(user);
    }

    catch (error)
    {
        res.status(500).json({message:'Server error'});
    }


}


const updateUserProfile =async (req,res)=>
{
    const {name,email}=req.body;

    try{
        const user=await User.findById(req.user.id);

        if(!user)
        {
            return res.status(404).json({message:'User not found'});
        }

        if(name) user.name=name;
        if(email) user.email=email;

        await  user.save();
        res.json(user);
    }
    catch (error)
    {
        res.status(500).json({message:'Server error'})
    }



}

const verifyEmail =async (req,res)=>
{
    const {token}=req.query;

    try{
        const user = await User.findOne({verificationToken:token});

        if(!user){
            return res.status(400).json({message:'Invalid or expired token'});
        }

        user.isVerified=true;
        user.verificationToken=undefined;
        await  user.save();

    }
    catch (error)
    {
        res.status(500).json({message:'Server error'});
    }


}


module.exports = {refreshAccessToken,logoutUser, verifyEmail,forgotPassword,resetPassword,getUserProfile,updateUserProfile,loginUser, registerUser };
