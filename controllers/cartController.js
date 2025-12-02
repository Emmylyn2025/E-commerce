const Cart = require('../model/cartModel');

const addToCart = async(req, res) => {
  try{

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

  } catch(err) {
    res.status(404).json({
      message: err.message
    })
  }
}

const removeFromCart = async(req, res) => {
  try{

    const { productId } = req.body;
    const userId = req.userInfo.id;

    let cart = await Cart.findOne({user: userId});

    if(!cart) {
      return res.status(404).json({
        message: "cart not found"
      });
    }

    cart.items = cart.items.filter((items) => items.product.toString() !== productId);

    await cart.save();

    res.status(200).json({
      status: 'success',
      message: 'Item removed successfully',
      cart
    });

  } catch(err) {
    res.status(404).json({
      message: err.message
    })
  }
}

const updateCartQuantity = async(req, res) => {
  try{
    
    const {productId, quantity} = req.body;
    const userId = req.userInfo.id;

    if(!quantity || quantity < 1) {
      return res.status(400).json({
        message: "Quantity cannot be less than 1"
      });
    }

    //Check if the cart exists
    let cart = await Cart.findOne({ user: userId });

    if(!cart) {
      return res.status(404).json({
        status: 'Fail',
        message: 'Cart not found'
      });
    }

    const itemArray = cart.items;

    //Find the item in the cart
    const items = itemArray.find((item) => item.product.toString() === productId);

    if(!items) {
      return res.status(404).json({
        message: "Cart not found"
      });
    }

    //Update the cart quantity
    items.quantity += quantity

    await cart.save();

    res.status(200).json({
      status: 'Success',
      message: 'Cart updated successfully'
    });
    
  } catch(err) {
    res.status(404).json({
      message: err.message
    });
  }
}

const calculateCartPriceQuantity = async(req, res) => {
  try{

    const userId = req.userInfo.id;

    let cart = await Cart.findOne({user: userId}).populate('items.product');

    if(!cart) {
      return res.status(404).json({
        message: "Cart not found"
      });
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

  } catch(err) {
    res.status(404).json({
      message: err.message
    });
  }
}
module.exports = {addToCart, removeFromCart, updateCartQuantity, calculateCartPriceQuantity};