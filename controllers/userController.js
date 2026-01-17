const User = require('../model/userModel');
const {generateToken, sendRefreshToken} = require('../token/token');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const {sendEmail} = require('../email/sendEmail');
const {asyncHandler, appError} = require('../utils/errorHandler');

const registerUser = asyncHandler(async(req, res, next) => {
    const {firstname, lastname, email, password, address, phone} = req.body;

    if(!firstname) {
      return next(new appError("The first name is required", 400));
    }

    if(!lastname) {
      return next(new appError("The lastname is required", 400));
    }

    if(!email) {
      return next(new appError("The email is required", 400));
    }

    if(!password) {
      return next(new appError("The password is required", 400));
    }

    if(!address) {
      return next(new appError("The address is required", 400));
    }

    if(!phone) {
      return next(new appError("The phone number is required", 400));
    }

    //Validation with regular expression
    //firstname
    const nameRegex = /^[a-zA-Z]{6,}$/;

    if(!nameRegex.test(firstname)){
      return next(new appError('First name must be minimum of six characters and no number included', 400));
    }

    if(!nameRegex.test(lastname)){
      return next(new appError('last name must be minimum of six characters and no number included', 400));
    }

    //Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)) {
      return next(new appError("Invalid email format"));
    }

    //Password
    const passwordRegex = /^[a-zA-z]{6,}[0-9]{4,}$/;

    if(!passwordRegex.test(password)) {
      return next(new appError("Password requires atleast six characters at the beginning and four numbers at the ending", 400));
    }

    //Number
    const numberRegex = /^(070|080|090|091|081)\d{8}$/;
    if(!numberRegex.test(phone)) {
      return next(new appError("Invalid Phone number format", 400));
    }

    //Check if the user exists in the databse before
    const user = await User.findOne({$or: [{firstname}, {lastname}, {email}]});

    if(user) {
      return next(new appError('The firstname, lastname or email may have been used try with another credentials', 400));
    }

    //Create the user or register the user
    const newUser = await User.create({
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim(),
      address,
      phone
    });

    res.status(201).json({
      status: 'Success',
      message: 'User is registered',
      data: newUser
    });
})

const loginUser = async(req, res) => {
  try{

    const {firstname, password} = req.body;

    //Check if it is correct
    const user = await User.findOne({firstname}).select('+password');

    if(!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect Username, Please try again.'
      });
    }

    //Compare passwords
    const checkPass = await user.correctPassword(password, user.password);

    if(!checkPass) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect Password, Please try again.'
      });
    }

    const {accessToken, refreshToken} = generateToken(user);

    sendRefreshToken(res, refreshToken);

    res.status(200).json({
      status: "success",
      message: "Login successful",
      token: accessToken
    });

  } catch(error) {
    res.status(500).json({
      status: 'Fail',
      message: error.message
    });
  }
}

const refresh = async(req, res) => {
  try{
    const token = req.cookies.refreshToken;

    if(!token) {
      res.status(401).json("No refresh token");
    }

    jwt.verify(token, process.env.refreshToken, (err, decoded) => {
      if(err) {
        return res.status(403).json({
          message: "invalid refresh token"
        });
      } 

      //Generate new tokens
       const {accessToken, refreshToken} = generateToken(decoded);

       sendRefreshToken(res, refreshToken);

       res.status(200).json({accessToken});
    });

  } catch(error) {
     res.status(500).json({
      status: 'Fail',
      message: error.message
    });
  }
}

const logOut = async(req, res) => {
  try{

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      path: "/api/e-commerce/refresh"
    });

    res.json("Logged out successfuly");

  } catch(error) {
    res.status(500).json({
      status: 'Fail',
      message: error.message
    })
  }
}

const decodeToken = async(req, res) => {
  try{

    const data = req.userInfo;

    res.status(200).json(data);

  } catch(error) {
    res.status(500).json({
      status: 'Fail',
      message: error.message
    });
  }
}

const forgetPassword = async(req, res) => {
  try{

    const {email} = req.body;

    const user = await User.findOne({email});

    if(!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    //Reset token 
    const resetToken = user.createResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    //The reset password url that the user will click
    const resetUrl = `${req.protocol}://${req.get('host')}/api/e-commerce/resetpassword/${resetToken}`;

    //Message that will be sent to the user email
    const message = `
      <p>
      You forgot your password. 
      Click the link below to reset your password
      </p>

      ${resetUrl}
      `;

      await sendEmail({
        email: user.email,
        subject: "Reset password Link",
        html: message
      });

      res.status(200).json({
        message: "Reset password link sent to your email"
      });


  } catch(error) {
    res.status(500).json({
      status: 'Fail',
      message: error.message
    });
  }
}

const resetPassword = async(req, res) => {
  try{

    //Get hashed token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    //Check if the user of that token exist in DB
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetTokenExpires: {$gt: Date.now()}
    });

    if(!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Token is invalid or expired'
      });
    }

    //Update Password
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save();

    res.status(200).json({
      status: 'Success',
      message: 'Password reset successfully'
    });

  } catch(err) {
    console.log(err);
    res.status(500).json({
      status: 'fail',
      message: err.messsage
    });
  }
}
module.exports = {registerUser, loginUser, refresh, logOut, decodeToken, forgetPassword, resetPassword};