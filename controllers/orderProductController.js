const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const OrderProduct = require('../models/orderProductModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllOrderProducts = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(OrderProduct.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const orderProducts = await features.query;

  ///show total result without .limitFields() and .paginate(); to calculate page in Fe
  const total1 = new APIFeatures(
    OrderProduct.countDocuments(),
    req.query
  ).filter();
  const total2 = await total1.query;
  const total = total2.length;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: orderProducts.length,
    orderProducts,
    total
  });
});

exports.createOrderProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.body.productID);
  const infor = {
    productID: req.body.productID,
    productName: product.productName,
    productPrice: product.price,
    unit: product.unit,
    quantity: req.body.quantity,
    storeID: product.storeID,
    storeName: product.storeName
  };
  const orders = await Order.findOne({
    customerID: req.user.id,
    orderStatus: 'openToAdd',
    isDeleted: false
  });

  // Order found, return it
  const orderProduct = await OrderProduct.create({
    orderID: orders.id,
    ...infor
  });

  res.status(201).json({
    status: 'success',
    orderProduct,
    message: 'product is added to order'
  });
});

exports.updateOrderProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.body.productID);
  const infor = {
    productID: req.body.productID,
    productName: product.productName,
    productPrice: product.price,
    unit: product.unit,
    quantity: req.body.quantity,
    storeID: product.storeID,
    storeName: product.storeName,
    orderProductStatus: req.body.orderProductStatus
  };

  const orderProduct = await OrderProduct.findByIdAndUpdate(
    req.params.id,
    infor,
    {
      new: true,
      runValidators: true
    }
  );
  if (!orderProduct) {
    return next(new AppError('No orderProduct found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    orderProduct
  });
});

exports.deleteOrderProduct = catchAsync(async (req, res, next) => {
  //this schema does not need to set isDeleted, user can find that product and add to order later, so we delete orderProduct directly out of the database to save space
  const orderProduct = await OrderProduct.findByIdAndDelete(req.params.id);
  if (!orderProduct) {
    return next(new AppError('No order found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
