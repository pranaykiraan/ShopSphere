const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Database Connection
mongoose.connect('mongodb://127.0.0.1:27017/shopsphere')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// Schema
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  imageUrl: String
});
const Product = mongoose.model('Product', productSchema);

// Routes
app.get('/api/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.post('/api/products', async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.status(201).json(product);
});

// Seed Route
app.get('/api/seed', async (req, res) => {
  await Product.deleteMany({});
  const sample = await Product.create({
    name: "Wireless Noise-Canceling Headphones",
    description: "Premium sound quality with active noise cancellation.",
    price: 199.99,
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"
  });
  res.json({ message: "Seeded successfully!", product: sample });
});

app.listen(5000, () => console.log('Server running on http://localhost:5000'));