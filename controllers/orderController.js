const Order = require('../models/orderModel');
const OrderProduct = require('../models/orderProductModel');
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

exports.getAllOrders = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Order.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const orders = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    totalOrders: orders.length,
    orders
  });
});

exports.getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  const orderProduct = await OrderProduct.find({ orderID: req.params.id });
  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }

  // Construct the response object outside of the res.status().json() call
  const responseData = {
    status: 'success',
    order
  };

  // Conditionally add the orderProduct or a message if it's empty
  if (orderProduct.length === 0) {
    responseData.message = 'The customer has not bought anything yet';
  } else {
    responseData.orderProduct = orderProduct;
  }

  // Send the response
  res.status(200).json({ status: 'success', ...responseData });
});

exports.createOrder = catchAsync(async (req, res, next) => {
  const orders = await Order.find({
    customerID: req.user.id,
    orderStatus: 'openToAdd',
    isDeleted: false
  });
  if (orders.length === 1) {
    // Order found, return it
    res.status(200).json({
      status: 'success',
      data: {
        orders
      },
      message: 'user has an open order already'
    });
  } else if (orders.length === 0) {
    const newOrder = await Order.create({
      customerID: req.user.id,
      customerName: req.user.name
    });

    res.status(201).json({
      status: 'success',
      data: {
        order: newOrder
      }
    });
  } else {
    //Error because user can have ONLY 1 open order so they can add product, if they not yet have an order, the function will check and create for them
    return next(
      new AppError('something went wrong, please contact with admin', 404)
    );
  }
});

exports.updateOrder = catchAsync(async (req, res, next) => {
  // 1) Filtered out unwanted fields names that are not allowed to be updated

  if (!req.body.deliverTo && !req.body.orderStatus) {
    return next(new AppError('No body found with that ID', 404));
  }
  const filteredBody = filterObj(req.body, 'deliverTo', 'orderStatus');
  const order = await Order.findByIdAndUpdate(req.params.id, filteredBody, {
    new: true,
    runValidators: true
  });

  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    order
  });
});

exports.cancelOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { orderStatus: 'canceled', cancelBy: req.user.name },
    {
      new: true,
      runValidators: true
    }
  );

  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    order
  });
});

exports.adminDeleteOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findByIdAndUpdate(req.params.id, {
    isDeleted: true,
    deletedAt: Date.now()
  });

  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
