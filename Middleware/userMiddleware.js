const jwt = require('jsonwebtoken');


const authController = (req, res, next) => {
  const headers = req.headers['authorization'];
  const token = headers && headers.split(" ")[1];

  try{
    const decoded = jwt.verify(
      token, 
      process.env.accessToken
    );

    req.userInfo = decoded;

    next();
  } catch(error) {
    res.status(500).json({
      status: 'Fail',
      message: error.message
    });
  }
}

const adminController = (req, res, next) => {
  try{

    if(req.userInfo.role !== 'admin') {
      res.status(401).json({
        status: "Unauthorized",
        message: "You are not authorized to make this move"
      });
    }

    next();
  } catch(error) {
    res.status(500).json({
      status: 'Fail',
      message: error.message
    });
  }
}

module.exports = {authController, adminController}