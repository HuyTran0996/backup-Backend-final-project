const sharp = require('sharp');
const User = require('./../models/userModel');
const Store = require('../models/storeModel');
const Product = require('../models/productModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const cloudinary = require('../utils/cloudinary');
const multerUpload = require('../utils/multer');
const normalize = require('../utils/normalize');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.uploadStorePhoto = multerUpload.single('image');

exports.getAllStores = catchAsync(async (req, res, next) => {
  let stores;
  let total;
  if (req.query.search) {
    const normalizedSearch = normalize(req.query.search);

    const regex = new RegExp(normalizedSearch, 'i');

    const features = new APIFeatures(
      Store.find({
        normalizedStoreName: { $regex: regex }
      }),
      req.query
    )
      .limitFields()
      .paginate();
    stores = await features.query;
    ///show total result without .limitFields() and .paginate(); to calculate page in Fe
    total = await Store.countDocuments({
      normalizedStoreName: { $regex: regex }
    });
  } else {
    const features = new APIFeatures(
      Store.find({ isDeleted: [false, true] }).setOptions({
        bypassIsDeletedFilter: true
      }),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();
    stores = await features.query;

    ///show total result without .limitFields() and .paginate(); to calculate page in Fe
    const total1 = new APIFeatures(
      Store.countDocuments({ isDeleted: [false, true] }).setOptions({
        bypassIsDeletedFilter: true
      }),
      req.query
    ).filter();
    const total2 = await total1.query;
    total = total2.length;
  }

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    totalStores: stores.length,
    stores,
    total
  });
});

exports.getStore = catchAsync(async (req, res, next) => {
  const store = await Store.findById(req.params.id);

  if (!store) {
    return next(new AppError('No store found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    store
  });
});

exports.createStore = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  const store = await Store.findOne({ ownerEmail: user.email });

  if (store) {
    return next(new AppError('A user can have only 1 store', 404));
  }

  const newStore = await Store.create({
    ...req.body,
    storeOwner: user._id,
    ownerEmail: user.email,
    normalizedStoreName: normalize(req.body.storeName),
    photo: '',
    cloudinaryId: ''
  });

  res.status(201).json({
    status: 'success',
    store: newStore
  });
});

exports.updateStore = catchAsync(async (req, res, next) => {
  // 1) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'storeName', 'address');

  const store = await Store.findById(req.params.id);
  if (!store) {
    return next(new AppError('No store found with that ID', 404));
  }
  if (req.file) {
    // Check if cloudinaryId exists before attempting to delete old image
    if (store.cloudinaryId) {
      // Delete old image from cloudinary
      await cloudinary.uploader.destroy(store.cloudinaryId);
    }

    //upload new image
    const cloudinaryResult = await cloudinary.uploader.upload(req.file.path, {
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
    });
    filteredBody.photo = cloudinaryResult.secure_url;
    filteredBody.cloudinaryId = cloudinaryResult.public_id;
  }

  if (req.body.storeName) {
    filteredBody.normalizedStoreName = normalize(req.body.storeName);
  }

  const storeUpdate = await Store.findByIdAndUpdate(
    req.params.id,
    filteredBody,
    {
      new: true,
      runValidators: true
    }
  );
  const product = await Product.updateMany(
    { storeID: req.params.id },
    { storeName: storeUpdate.storeName }
  );
  if (!product) {
    return;
  }

  res.status(200).json({
    status: 'success',
    store: storeUpdate
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

exports.adminActivateStore = catchAsync(async (req, res, next) => {
  // delete store of user

  const store = await Store.findByIdAndUpdate(req.params.id, {
    isDeleted: false
  }).setOptions({
    bypassIsDeletedFilter: true
  });
  if (!store) {
    return next(new AppError('No store found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    store
  });
});
