const Cart = require('../model/cartModel');
const {asyncHandler, appError} = require('../utils/errorHandler');

const addToCart = asyncHandler(async(req, res, next) => {
    const { productId, quantity } = req.body;
    const userId = req.userInfo.id;

    //Check if the cart exist before
    let cart = await Cart.findOne({user: userId});

    //If the cart does not exist before create new cart
    if(!cart) {
      cart = await Cart.create({
        user: userId,
        items: [{product: productId, quantity}]
      });

      return res.status(201).json({
        status: 'Success',
        cart
      });
    }

    /*
    const items = cart.items;
    console.log(items);
    */

    //Check if the item exist in the cart before
    const existingItem = cart.items.find((item) => item.product.toString() === productId);

    if(existingItem) {
      //If it exist in the cart before update the quantity
      existingItem.quantity += quantity;
    } else {
      //If the item is not existing in the cart, create a new item
      cart.items.push({product: productId, quantity});
    }

    await cart.save();

    res.status(200).json({
      status: 'success',
      cart
    });

  })

const removeFromCart = asyncHandler(async(req, res, next) => {
    const { productId } = req.body;
    const userId = req.userInfo.id;

    let cart = await Cart.findOne({user: userId});

    if(!cart) {
      return next(new appError("cart not found", 404));
    }

    cart.items = cart.items.filter((items) => items.product.toString() !== productId);

    await cart.save();

    res.status(200).json({
      status: 'success',
      message: 'Item removed successfully',
      cart
    });

  })

const updateCartQuantity = asyncHandler(async(req, res, next) => {
    const {productId, quantity} = req.body;
    const userId = req.userInfo.id;

    if(!quantity || quantity < 1) {
      return next(new appError("Quantity cannot be less than 1", 400));
    }

    //Check if the cart exists
    let cart = await Cart.findOne({ user: userId });

    if(!cart) {
      return next(new appError('Cart not found', 404));
    }

    const itemArray = cart.items;

    //Find the item in the cart
    const items = itemArray.find((item) => item.product.toString() === productId);

    if(!items) {
      return next(new appError("item not found", 404));
    }

    //Update the cart quantity
    items.quantity += quantity

    await cart.save();

    res.status(200).json({
      status: 'Success',
      message: 'Cart updated successfully'
    });
    
  })

const calculateCartPriceQuantity = asyncHandler(async(req, res, next) => {
    const userId = req.userInfo.id;

    let cart = await Cart.findOne({user: userId}).populate('items.product');

    if(!cart) {
      return next(new appError("Cart not found", 404));
    }

    const items = cart.items;

    let totalPrice = 0;

    items.forEach((item) => {
      totalPrice += item.product.price * item.quantity;
    });

    cart.totalPrice = totalPrice;

    await cart.save();

    res.status(200).json({
      total: totalPrice
    });
  })
module.exports = {addToCart, removeFromCart, updateCartQuantity, calculateCartPriceQuantity};