const User = require('../model/userModel');
const {generateToken, sendRefreshToken} = require('../token/token');
const jwt = require('jsonwebtoken');

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

module.exports = {registerUser, loginUser, refresh, logOut, decodeToken};