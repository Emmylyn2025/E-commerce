const express = require('express');

const { addProductToDatabase, getProducts, updateProduct, deleteProduct, getProductsStats } = require('../controllers/productController');

const {registerUser, loginUser, refresh, logOut, decodeToken} = require('../controllers/userController');

const {authController, adminController} = require('../Middleware/userMiddleware');

const multerMiddleware = require('../multer/multer');

const router = express.Router();

//User ability routes
router.post('/registerUser', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refresh);
router.post('/logout', logOut);

//For the frontend developer
router.get('/decode', authController, decodeToken);

//Admin ability routes
router.post('/addproduct', authController, adminController, multerMiddleware.single('image'), addProductToDatabase);
router.get('/getproduct', authController, adminController, getProducts);
router.get('/stats', authController, adminController, getProductsStats);
router.patch('/updateproduct/:id', authController, adminController, updateProduct);
router.delete('/deleteproduct/:id', authController, adminController, deleteProduct);

module.exports = router;