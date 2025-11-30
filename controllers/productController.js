const Product = require('../model/productModel');
const qs = require('qs');
const apiFeatures = require('../utils/apiFeatures');
const {uploadToCloudinary} = require('../Cloudinary/cloudinaryHelpers');
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

const addProductToDatabase = async(req, res) => {
  try{

    const {name, description, price, category, brand, inStock} = req.body;
    const fileName = req.file.filename;
    const filePath = path.join(__dirname, '../uploads', fileName);

    //Check if file is present
    if(!req.file) {
      return res.status(400).json({
        status: 'Fail',
        message: "An image needs to be uploaded"
      });
    }

    //Upload to cloudinary
    const {imageUrl, imagePublicId} = await uploadToCloudinary(req.file.path);

    const product = await Product.create({
      imageUrl,
      imagePublicId,
      name,
      description,
      price,
      category,
      brand,
      inStock,
      uploadedBy: req.userInfo.id
    });

    if(!product) {
      return res.status(400).json({
        success: 'Fail',
        message: "You've made some bad request"
      });
    }

    fs.unlink(filePath, (err) => {
      if(err) {
        console.log('Error while deleting image');
      } else {
        console.log('image deleted successfully');
      }
    })

    res.status(201).json({
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

    const features = new apiFeatures(Product.find().populate("uploadedBy", "firstname"), parse)
      .filter()
      .sort()
      .limitFields()
      .paginate();
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

    res.status(200).json({
      length: product.length,
      product
    });

  } catch(error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong please try again later"
    });
  }
}


const getProductFalse = async(req, res) => {
  try{
    const stats = await Product.aggregate([
      { $match: {inStock: false}}
    ]);

    res.status(200).json({
      status: 'Success',
      count: stats.length,
      message: {
        stats
      }
    });

  } catch(error) {
    res.status(500).json({
      status: 'fail',
      message: error.message
    });
  }
}

const updateProduct = async(req, res) => {
  try{

    const productId = req.params.id;

    //const product = await Product.findByIdAndUpdate(productId, req.body, {new: true, runValidators: true});

    const product = await Product.findById(productId);
    
    if(!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }

  
    if(req.file) {
      product.imageUrl = req.file.imageUrl;
      product.imagePublicId = req.file.imagePublicId;
    }
  
    
    product.name = req.body.name || product.name;
    product.price = req.body.price || product.price;
    product.description = req.body.description || product.description;
    product.inStock = req.body.inStock || product.inStock;
    
    await product.save();

    res.status(200).json({
      status: 'success',
      message: 'Product updated successfully'
    });


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
    const imagePublicId = product.imagePublicId;

    if(!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    //Delete product image from cloudinary
    await cloudinary.uploader.destroy(imagePublicId);

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

module.exports = { addProductToDatabase, getProducts, updateProduct, deleteProduct, getProductFalse };