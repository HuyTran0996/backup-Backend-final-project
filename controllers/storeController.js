const sharp = require('sharp');
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
  const stores = await features.query;

  ///show total result without .limitFields() and .paginate(); to calculate page in Fe
  const total1 = new APIFeatures(
    Store.countDocuments({ isDeleted: [false, true] }).setOptions({
      bypassIsDeletedFilter: true
    }),
    req.query
  ).filter();
  const total2 = await total1.query;
  const total = total2.length;

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
  const store = await Store.findOne({ ownerEmail: user._id });

  if (store) {
    return next(new AppError('A user can have only 1 store', 404));
  }

  // Include the owner's ID when creating the new store
  //trả storeOwner, ownerEmail cách làm này là chưa tối ưu, chỉ cần 1 object user._id là đủ, khi trả respone ta có thể dùng populate của mongo để trả full thông tin của user trong respone mà ko cần phải tạo lẻ tẻ user.email,....
  // cái populate này nên chạy ở file schema của chính schema này, ví dụ
  // storeSchema.pre(/^find/, function(next) {
  //   this.populate({
  //     path: "storeOwner" });
  //   next();
  // });
  const newStoreData = {
    ...req.body,
    storeOwner: user._id,
    ownerEmail: user.email,
    photo: '',
    cloudinaryId: ''
  };

  if (req.file) {
    const cloudinaryResult = await cloudinary.uploader.upload(req.file.path, {
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
    });
    newStoreData.photo = cloudinaryResult.secure_url;
    newStoreData.cloudinaryId = cloudinaryResult.public_id;
  }

  const newStore = await Store.create(newStoreData);

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
