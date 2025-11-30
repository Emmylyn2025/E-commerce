const mongoose = require('mongoose');

const Product = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product name is required"],
    trim: true,
    maxlength: [200, "Name cannot be more than 200 characters"]
  },
  description: {
    type: String,
    required: [true, "Product description is required"],
    trim: true
  },
  price: {
    type: Number,
    required: [true, "Price of the product is required"],
    min: [0, "Price of the product cannot be negative"]
  },
  category: {
    type: String,
    required: true,
    enum: ["Electronics", "Clothing"]
  },
  brand: {
    type: String,
    default: "No brand",
    trim: true
  },
  inStock: {
    type: Boolean,
    required: true,
    default: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  imagePublicId: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
}, {timestamps: true});

//The name of the admin that uploaded the product
// Product.pre('save', function() {
//   this.uploadedBy = 'admin';
// });

//This makes the inStock: false product not to appear in response
Product.pre('find', function() {
  this.find({inStock: true});
});

module.exports = mongoose.model("products", Product);

