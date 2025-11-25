const jwt = require('jsonwebtoken');

function generateToken(user) {
  //Access token
  const accessToken = jwt.sign({
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role
  }, process.env.accessToken, {expiresIn: "15m"});

  const refreshToken = jwt.sign({
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role
  }, process.env.refreshToken, {expiresIn: "7d"});

  return {accessToken, refreshToken};
}

//Save refreshtoken in cookie
const sendRefreshToken = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    path: "/api/e-commerce/refresh",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

module.exports = {generateToken, sendRefreshToken};