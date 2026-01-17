require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const router = require('./routes/router');
const cookieParser = require('cookie-parser');
const {corsConfigure} = require('./cors-configure/cors');
const {appError} = require('./utils/errorHandler');


const app = express();

//Connect to database
mongoose.connect(process.env.monCONN).then(() => {
  console.log("Database connection successful");
}).catch((error) => {
  console.log("Error while connection to database", error);
});

//Middleware
app.use(express.json());
app.use(cookieParser());
app.use(corsConfigure());


app.use('/api/e-commerce', router);

//Not found error handler
app.use((req, res, next) => {
  next(new appError(`Can't find ${req.originalUrl} on the server`), 404);
});

//Global error handler
app.use((error, req, res, next) => {
  error.status = error.status || 'error';
  error.statusCode = error.StatusCode || 500;
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
  });
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is now running at ${PORT}`)
});