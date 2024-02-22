const Product = require('../models/productModel');
const Store = require('../models/storeModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllProducts = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Product.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const products = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products
    }
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('No store found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      product
    }
  });
});

exports.createProduct = catchAsync(async (req, res, next) => {
  const store = await Store.findOne({ storeOwner: req.user.id });
  if (!store) {
    return next(
      new AppError('You have no store, create your store first', 404)
    );
  }

  // Include the owner's ID when creating the new store
  const newProduct = await Product.create({
    ...req.body,
    storeID: store._id,
    storeName: store.storeName
  });

  res.status(201).json({
    status: 'success',
    data: {
      product: newProduct
    }
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  // 1) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(
    req.body,
    'price',
    'description',
    'productName'
  );
  const product = await Product.findByIdAndUpdate(req.params.id, filteredBody, {
    new: true,
    runValidators: true
  });

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }
  console.log(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      product
    }
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
