const mongoose = require('mongoose');

const Product = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true
  },
  imagePublicId: {
    type: String,
    required: true
  },
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
  createdAt: {
    type: Date,
    default: Date.now()
  }
}, {timestamps: true});

//Only return those products that their stock is true
Product.pre('find', function(next) {
  this.find({inStock: true});

  next();
});

Product.post('save', function (doc, next) {
  console.log(doc);
  next();
});

module.exports = mongoose.model("products", Product);

