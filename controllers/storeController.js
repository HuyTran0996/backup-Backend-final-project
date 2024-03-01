const User = require('./../models/userModel');
const Store = require('../models/storeModel');
const Product = require('../models/productModel');
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

exports.uploadStorePhoto = multerUpload.single('image');

exports.getAllStores = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Store.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const stores = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    totalStores: stores.length,
    stores
  });
});

exports.getStore = catchAsync(async (req, res, next) => {
  const store = await Store.findById(req.params.id);

  if (!store) {
    return next(new AppError('No store found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      store
    }
  });
});

exports.createStore = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  // Include the owner's ID when creating the new store
  const newStore = await Store.create({
    ...req.body,
    storeOwner: user._id,
    ownerEmail: user.email
  });

  res.status(201).json({
    status: 'success',
    data: {
      store: newStore
    }
  });
});

exports.updateStore = catchAsync(async (req, res, next) => {
  // 1) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'storeName', 'address');

  const store = await Store.findById(req.params.id);
  if (!store) {
    return next(new AppError('No  store found with that ID', 404));
  }
  if (req.file) {
    // Check if cloudinaryId exists before attempting to delete old image
    if (store.cloudinaryId) {
      // Delete old image from cloudinary
      await cloudinary.uploader.destroy(req.user.cloudinaryId);
    }
    //upload new image
    const cloudinaryResult = await cloudinary.uploader.upload(req.file.path, {
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
    });
    filteredBody.photo = cloudinaryResult.secure_url;
    filteredBody.cloudinaryId = cloudinaryResult.public_id;
    await Store.findByIdAndUpdate(req.params.id, filteredBody, {
      new: true,
      runValidators: true
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      store
    }
  });
});

exports.deleteStore = catchAsync(async (req, res, next) => {
  const product = await Product.updateMany(
    { storeID: req.params.id },
    { isDeleted: true, deletedAt: Date.now() }
  );
  if (!product) {
    // return next(new AppError('No store found with that ID', 404));
    const store = await Store.findByIdAndUpdate(req.params.id, {
      isDeleted: true,
      deletedAt: Date.now()
    });
    if (!store) {
      return next(new AppError('No store found with that ID', 404));
    }
  }
  const store = await Store.findByIdAndUpdate(req.params.id, {
    isDeleted: true,
    deletedAt: Date.now()
  });

  if (!store) {
    return next(new AppError('No store found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
