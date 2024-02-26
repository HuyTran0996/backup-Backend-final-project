const multer = require('multer');
const path = require('path');
const AppError = require('./appError');

// Multer config
module.exports = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    if (
      fileExtension !== '.jpg' &&
      fileExtension !== '.jpeg' &&
      fileExtension !== '.png'
    ) {
      cb(new AppError('Only use jpg, jpeg or png file', 400), false);
      return;
    }
    cb(null, true);
  }
});
