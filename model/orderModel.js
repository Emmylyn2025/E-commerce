const mongoose = require('mongoose');

const itemSchema = new mongoose({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "products",
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  items: [itemSchema],
  shippingAddress: {
    fullName: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ["card", "Bank transfer", "Cash on Delivery"],
      required: true
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0
    },
    isPaid: {
      type: Boolean,
      default: false
    },
    paidAt: {
      type: Date
    },
    status: {
      type: String,
      enum: ["Pending", "Delivered", "Cancelled"],
      default: "Pending"
    }
  }
}, {timestamps: true});

module.exports = mongoose.model('order', orderSchema);