const sharp = require('sharp');
const Product = require('../models/productModel');
const Store = require('../models/storeModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const cloudinary = require('../utils/cloudinary');
const multerUpload = require('../utils/multer');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.uploadProductPhoto = multerUpload.single('image');

exports.getAllProducts = catchAsync(async (req, res, next) => {
  let products;
  let total;
  if (req.query.search) {
    const normalizedSearch = req.query.search
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    const regex = new RegExp(normalizedSearch, 'i');

    const features = new APIFeatures(
      Product.find({ normalizedProductName: { $regex: regex } }),
      req.query
    )
      .limitFields()
      .paginate();
    products = await features.query;
    ///show total result without .limitFields() and .paginate(); to calculate page in Fe
    total = await Product.countDocuments({
      normalizedProductName: { $regex: regex }
    });
  } else {
    const features = new APIFeatures(Product.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    products = await features.query;
    ///show total result without .limitFields() and .paginate(); to calculate page in Fe
    const total1 = new APIFeatures(
      Product.countDocuments(),
      req.query
    ).filter();
    const total2 = await total1.query;
    total = total2.length;
  }

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: products.length,
    products,
    total
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('No store found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    product
  });
});

exports.createProduct = catchAsync(async (req, res, next) => {
  const store = await Store.findOne({ storeOwner: req.user.id });
  if (!store) {
    return next(
      new AppError('You have no store, create your store first', 404)
    );
  }
  const normalizedProductName = req.body.productName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  // Include the owner's ID when creating the new store
  const newProduct = await Product.create({
    ...req.body,
    storeID: store._id,
    storeName: store.storeName,
    normalizedProductName: normalizedProductName
  });

  res.status(201).json({
    status: 'success',
    product: newProduct
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  // 1) Filtered out unwanted fields names that are not allowed to be updated

  const filteredBody = filterObj(
    req.body,
    'productName',
    'description',
    'price',
    'unit',
    'genre'
  );

  let product = await Product.findById(req.params.id);
  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }
  if (req.file) {
    // Check if cloudinaryId exists before attempting to delete old image
    if (product.cloudinaryId) {
      // Delete old image from cloudinary
      await cloudinary.uploader.destroy(product.cloudinaryId);
    }

    const resizedImageBuffer = await sharp(req.file.path)
      .resize({ width: 800 }) // Adjust width as needed
      .jpeg({ quality: 80 }) // Adjust quality as needed to get close to 150KB
      .toBuffer();
    const cloudinaryResult = await cloudinary.uploader
      .upload_stream(
        {
          resource_type: 'image',
          upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
        },
        (error, result) => {
          if (error) {
            console.error(error);
            // return;
            return next(new AppError('Error re-size product image', 500));
          }
          // Use result.secure_url for the image URL
        }
      )
      .end(resizedImageBuffer);

    // // upload new image
    // const cloudinaryResult = await cloudinary.uploader.upload(
    //   resizedImageBuffer,
    //   {
    //     upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
    //   }
    // );
    filteredBody.photo = cloudinaryResult.secure_url;
    filteredBody.cloudinaryId = cloudinaryResult.public_id;
  }

  if (req.body.productName) {
    filteredBody.normalizedProductName = req.body.productName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  product = await Product.findByIdAndUpdate(req.params.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    product
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, {
    isDeleted: true,
    deletedAt: Date.now()
  });

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
