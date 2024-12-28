// import mongoose from 'mongoose'
const mongoose = require("mongoose")


const userSchema= new mongoose.Schema(
    {
        name: {type: String, required: true},
        email: {type: String, required: true, unique: true},
        password: {type: String, required: true},
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        resetToken: { type: String },
        resetTokenExpiry: { type: Date },
        isVerified: { type: Boolean, default: false },
        verificationToken: { type: String }
    }
);


const User = mongoose.model('User', userSchema);

// export default User;
module.exports=User