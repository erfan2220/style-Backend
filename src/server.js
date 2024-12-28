
const express=require('express')
const cors=require('cors')
const dotenv=require("dotenv")
const connectDB=require("./config/db")
const productRoutes=require("./routes/productRoutes")
const userRoutes=require("./routes/userRoutes")

const orderRoutes=require("./routes/orderRoutes")


dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

// Default Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
