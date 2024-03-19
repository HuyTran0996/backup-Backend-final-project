const Product = require('../models/productModel');
const Review = require('../models/reviewModel');
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

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Review.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const reviews = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    reviews
  });
});

exports.getAllReviewsForAdmin = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(
    Review.find({ isDeleted: [false, true] }).setOptions({
      bypassIsDeletedFilter: true
    }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const reviews = await features.query;

  const total1 = new APIFeatures(
    Review.countDocuments({ isDeleted: [false, true] }).setOptions({
      bypassIsDeletedFilter: true
    }),
    req.query
  ).filter();
  const total2 = await total1.query;
  const total = total2.length;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    reviews,
    total
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new AppError('This product was removed by store owner', 404));
  }

  const newReview = await Review.create({
    productID: req.params.id,
    productName: product.productName,
    reviewerID: req.user.id,
    reviewerName: req.user.name,
    userReview: req.body.userReview
  });

  res.status(201).json({
    status: 'success',
    product: newReview
  });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  // 1) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'userReview');
  const review = await Review.findByIdAndUpdate(req.params.id, filteredBody, {
    new: true,
    runValidators: true
  });

  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    review
  });
});

exports.adminDeleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(req.params.id, {
    isDeleted: true,
    deletedAt: Date.now()
  });

  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.adminActivateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(req.params.id, {
    isDeleted: false
  }).setOptions({
    bypassIsDeletedFilter: true
  });
  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    review
  });
});
