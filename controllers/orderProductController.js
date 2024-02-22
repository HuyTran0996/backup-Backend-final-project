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

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: orderProducts.length,
    data: {
      orderProducts
    }
  });
});

exports.createOrderProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.body.productID);
  const infor = {
    productID: req.body.productID,
    productName: product.productName,
    productPrice: product.price,
    quantity: req.body.quantity,
    productPricexQuantity: product.price * req.body.quantity,
    StoreID: product.storeID,
    storeName: product.storeName
  };
  const orders = await Order.find({
    customerID: req.user.id,
    orderStatus: 'openToAdd',
    isDeleted: false
  });
  if (orders.length === 1) {
    // Order found, return it
    const orderProduct = await OrderProduct.create({
      orderID: orders[0].id,
      ...infor
    });
    res.status(200).json({
      status: 'success',
      data: {
        orderProduct
      },
      message: 'product is added to order'
    });
  } else if (orders.length === 0) {
    const newOrder = await Order.create({
      customerID: req.user.id,
      customerName: req.user.name
    });

    const orderProduct = await OrderProduct.create({
      orderID: newOrder.id,
      ...infor
    });

    res.status(201).json({
      status: 'success',
      data: {
        order: orderProduct
      }
    });
  } else {
    //Error because user can have ONLY 1 open order so they can add product, if they not yet have an order, the function will check and create for them
    return next(
      new AppError('something went wrong, please contact with admin', 404)
    );
  }
});

exports.updateOrderProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.body.productID);
  const infor = {
    productID: req.body.productID,
    productName: product.productName,
    productPrice: product.price,
    quantity: req.body.quantity,
    productPricexQuantity: product.price * req.body.quantity,
    StoreID: product.storeID,
    storeName: product.storeName
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
    data: {
      orderProduct
    }
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
