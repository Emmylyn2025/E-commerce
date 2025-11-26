const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },

  filename: (req, res, file) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if(file.mimetype.startsWith('image')){
    cb(null, true)
  } else {
    cb(new Error("Not an image, Only upload image"));
  }
}

module.exports = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 //5mb maximum
  }
});