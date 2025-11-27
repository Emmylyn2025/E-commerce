require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const router = require('./routes/router');
const cookieParser = require('cookie-parser');
const cors = require('cors');

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
app.use(cors());
app.use('/api/e-commerce', router);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is now running at ${PORT}`)
});