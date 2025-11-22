const express = require('express');

const { addProductToDatabase, getProducts, updateProduct, deleteProduct } = require('../controllers/productController');

const router = express.Router();

router.post('/addproduct', addProductToDatabase);
router.get('/getproduct', getProducts);
router.patch('/updateproduct/:id', updateProduct);
router.delete('/deleteproduct/:id', deleteProduct);

module.exports = router;