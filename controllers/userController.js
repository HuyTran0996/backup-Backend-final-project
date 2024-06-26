const sharp = require('sharp');
const normalize = require('../utils/normalize');
const User = require('./../models/userModel');
const Store = require('../models/storeModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const cloudinary = require('../utils/cloudinary');
const multerUpload = require('../utils/multer');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.uploadUserPhoto = multerUpload.single('image');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  let users;
  let total;
  if (req.query.search) {
    const normalizedSearch = normalize(req.query.search);

    const regex = new RegExp(normalizedSearch, 'i');

    const features = new APIFeatures(
      User.find({ normalizedEmail: { $regex: regex } }),
      req.query
    )
      .limitFields()
      .paginate();
    users = await features.query;
    ///show total result without .limitFields() and .paginate(); to calculate page in Fe
    total = await User.countDocuments({
      normalizedProductName: { $regex: regex }
    });
  } else {
    const features = new APIFeatures(
      User.find({ isDeleted: [false, true] }).setOptions({
        bypassIsDeletedFilter: true
      }),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();
    users = await features.query;
    const total1 = new APIFeatures(
      User.countDocuments({ isDeleted: [false, true] }).setOptions({
        bypassIsDeletedFilter: true
      }),
      req.query
    ).filter();
    const total2 = await total1.query;
    total = total2.length;
  }

  res.status(200).json({
    status: 'success',
    totalUsers: users.length,
    users,
    total
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    user
  });
});

exports.getMyInfo = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    user
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'phone');

  if (req.file) {
    // Check if cloudinaryId exists before attempting to delete old image
    if (req.user.cloudinaryId) {
      // Delete old image from cloudinary
      await cloudinary.uploader.destroy(req.user.cloudinaryId);
    }

    //upload new image
    const cloudinaryResult = await cloudinary.uploader.upload(req.file.path, {
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
    });
    filteredBody.photo = cloudinaryResult.secure_url;
    filteredBody.cloudinaryId = cloudinaryResult.public_id;
  }

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    user: updatedUser
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'phone');

  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('No  store found with that ID', 404));
  }

  if (req.file) {
    // Check if cloudinaryId exists before attempting to delete old image
    if (user.cloudinaryId) {
      // Delete old image from cloudinary
      await cloudinary.uploader.destroy(user.cloudinaryId);
    }

    //upload new image
    const cloudinaryResult = await cloudinary.uploader.upload(req.file.path, {
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
    });
    filteredBody.photo = cloudinaryResult.secure_url;
    filteredBody.cloudinaryId = cloudinaryResult.public_id;
  }

  // 3) Update user document
  // user = await user.set(filteredBody).save();
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    filteredBody,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    status: 'success',
    user: updatedUser
  });
});

exports.adminChangeUserPassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('+password');
  if (!user) {
    return next(new AppError('No  store found with that ID', 404));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();

  res.status(200).json({
    status: 'success',
    user
  });
});

exports.adminDeleteUser = catchAsync(async (req, res, next) => {
  // delete store of user
  const store = await Store.findOneAndUpdate(
    { storeOwner: req.params.id },
    { isDeleted: true }
  );
  if (!store) {
    await User.findByIdAndUpdate(req.params.id, { isDeleted: true });
  }
  await User.findByIdAndUpdate(req.params.id, { isDeleted: true });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.adminActivateUser = catchAsync(async (req, res, next) => {
  // delete store of user
  let user;
  const store = await Store.findOneAndUpdate(
    { storeOwner: req.params.id },
    { isDeleted: false }
  ).setOptions({
    bypassIsDeletedFilter: true
  });
  if (!store) {
    user = await User.findByIdAndUpdate(req.params.id, {
      isDeleted: false
    }).setOptions({
      bypassIsDeletedFilter: true
    });
  }
  user = await User.findByIdAndUpdate(req.params.id, {
    isDeleted: false
  }).setOptions({
    bypassIsDeletedFilter: true
  });

  res.status(200).json({
    status: 'success',
    user
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  // delete store of user
  const store = await Store.updateMany(
    { storeOwner: req.user.id },
    { isDeleted: true, deletedAt: Date.now() }
  );
  if (!store) {
    await User.findByIdAndUpdate(req.user.id, { isDeleted: true });
  }
  await User.findByIdAndUpdate(req.user.id, { isDeleted: true });

  res.status(204).json({
    status: 'success',
    data: null
  });
});
