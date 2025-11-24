const Product = require('../model/productModel');
const qs = require('qs');
const apiFeatures = require('../utils/apiFeatures');

const addProductToDatabase = async(req, res) => {
  try{

    const {name, description, price, category, brand} = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      category,
      brand
    });

    if(!product) {
      return res.status(400).json({
        message: "You've made some bad request"
      });
    }

    res.status(200).json({
      message: "product created successfully",
      product
    });


  } catch(error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong please try gaian later"
    });
  }
}

const getProducts = async(req, res) => {
  try{
    //Make express understand
    const parse = qs.parse(req.query);

    const features = new apiFeatures(Product.find(), parse).filter().sort().limitFields().paginate();
    let product = await features.query;
    
    // let queryObj = {...parse};

    // const exclude = ['fields', 'sort', 'page', 'limit'];

    // exclude.forEach(el => delete queryObj[el]);

    //Filter by fields
    
    // if(req.query.fields) {
    //   const fields = req.query.fields.split(",").join(" ");
    //   query = query.select(fields);
    // } else {
    //   query = query.select("-__v");
    // }
    
    //Sort the fields
    
    // if(req.query.sort) {
    //   const sort = req.query.sort.split(",").join(" ");
    //   query = query.sort(sort);
    // } else {
    //   query = query.sort("-createdAt");
    // }
      

    //Sort and paginate
   
    // const page = Number(req.query.page) || 1;
    // const limit = Number(req.query.limit) || 3;

    // const skip = (page - 1) * limit;

    // query = query.skip(skip).limit(limit);
   
    // if(req.query.page) {
    //   const count = await Product.countDocuments();
    //   if(skip >= count) {
    //     throw new Error("Page not found");
    //   }
    // }
    

    //let product = await query;

    res.status(200).json(product);

  } catch(error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong please try again later"
    });
  }
}

const updateProduct = async(req, res) => {
  try{

    const productId = req.params.id;

    const product = await Product.findByIdAndUpdate(productId, req.body, {new: true, runValidators: true});

    if(!product) {
      return res.status(400).json({
        message: "Product cannot be updatated"
      });
    }

    res.status(200).json(product);

  } catch(error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong please try again later"
    });
  }
}

const deleteProduct = async(req, res) => {
  try{

    const productId = req.params.id;

    const product = await Product.findByIdAndDelete(productId);

    if(!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.status(200).json({
      message: "Product deleted successfully"
    });

  } catch(error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong please try again later"
    });
  }
}

module.exports = { addProductToDatabase, getProducts, updateProduct, deleteProduct };