const express = require('express');

const { addProductToDatabase, getProducts, updateProduct, deleteProduct, getProductFalse } = require('../controllers/productController');

const {registerUser, loginUser, refresh, logOut, decodeToken, forgetPassword, resetPassword} = require('../controllers/userController');

const {authController, adminController} = require('../Middleware/userMiddleware');

const multerMiddleware = require('../multer/multer');

const router = express.Router();

//User ability routes
router.post('/registerUser', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refresh);
router.post('/logout', logOut);
router.post('/forget', forgetPassword);
router.patch('/resetpassword/:token', resetPassword)

//For the frontend developer
router.get('/decode', authController, decodeToken);

//Admin ability routes
router.post('/addproduct', authController, adminController, multerMiddleware.single('image'), addProductToDatabase);
router.get('/getproduct',authController, getProducts);
router.get('/false', authController, adminController, getProductFalse);
router.patch('/updateproduct/:id', authController, adminController, updateProduct);
router.delete('/deleteproduct/:id', authController, adminController, deleteProduct);

module.exports = router;