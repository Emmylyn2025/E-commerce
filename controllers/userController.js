const User = require('../model/userModel');
const {generateToken, sendRefreshToken} = require('../token/token');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const {sendEmail} = require('../email/sendEmail');

const registerUser = async(req, res) => {
  
  try{

    const {firstname, lastname, email, password, address, phone} = req.body;

    //Check if the user exists in the databse before
    const user = await User.findOne({$or: [{firstname}, {lastname}, {email}]});

    if(user) {
      return res.status(400).json({
        status: 'Fail',
        message: 'This is a registered user'
      });
    }

    //Create the user or register the user
    const newUser = await User.create({
      firstname,
      lastname,
      email,
      password,
      address,
      phone
    });

    res.status(201).json({
      status: 'Success',
      message: 'User is registered',
      data: newUser
    });

  } catch(error) {
    res.status(500).json({
      status: 'fail',
      message: error.message
    });
  }
}

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