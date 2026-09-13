const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
app.use(cors());
app.use(express.json());


// 1. Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://pranaykrishna555_db_user:shopsphere@cluster0.1qajilf.mongodb.net/?appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB successfully!'))
  .catch(err => console.error('MongoDB connection error:', err));

// 2. Define Mongoose Schemas & Models
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  imageUrl: String
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: Array,
  subtotal: Number,
  status: { type: String, default: 'COMPLETED' },
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);
const User = mongoose.model('User', userSchema);
const Order = mongoose.model('Order', orderSchema);

// 3. API Routes

// Seed Initial Products with Static Picsum IDs
app.get('/api/seed', async (req, res) => {
  try {
    if (req.query.force === 'true') {
      await Product.deleteMany({});
    }

    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany([
        { 
          name: 'Wireless Headphones', 
          description: 'High quality noise cancelling', 
          price: 99.99, 
          // ID 0 is a static tech/laptop desk image
          imageUrl: 'https://picsum.photos/id/0/600/400' 
        },
        { 
          name: 'Mechanical Keyboard', 
          description: 'Tactile switches with RGB', 
          price: 129.99, 
          // ID 96 is a static workspace image
          imageUrl: 'https://unsplash.com/photos/black-and-orange-computer-keyboard-50uD7HzOLW8' 
        },
        { 
          name: 'Ergonomic Mouse', 
          description: 'Precision mouse for long work hours', 
          price: 49.99, 
          // ID 119 is a static Macbook tech image
          imageUrl: 'https://picsum.photos/id/119/600/400' 
        }
      ]);
      return res.json({ message: 'Database re-seeded with fixed Picsum images!' });
    }
    res.json({ message: 'Database already has products. Use /api/seed?force=true to overwrite.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET All Products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Express route: GET /api/products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    
    // Map _id to id for client compatibility
    const formattedProducts = products.map(p => ({
      id: p._id.toString(),
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category
    }));

    res.json(formattedProducts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products from database', error: error.message });
  }
});
// User Register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const user = new User({ name, email, password });
    await user.save();

    res.status(201).json({
      token: 'fake-jwt-token',
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    res.json({
      token: 'fake-jwt-token',
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Checkout (Create Order)
app.post('/api/orders/checkout', async (req, res) => {
  const userId = req.headers['user-id'] || 'guest';
  const { items, subtotal } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  try {
    const order = new Order({ userId, items, subtotal });
    await order.save();

    res.status(201).json({
      message: 'Order placed successfully!',
      order: { id: order._id, subtotal: order.subtotal, items: order.items }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET Order History
app.get('/api/orders', async (req, res) => {
  const userId = req.headers['user-id'] || 'guest';
  try {
    const userOrders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.json(userOrders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));