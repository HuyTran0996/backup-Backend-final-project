const mongoose = require('mongoose');

const orderProductSchema = new mongoose.Schema({
  orderID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  productID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  storeID: {
    type: mongoose.Schema.Types.ObjectId
  },
  productName: { type: String },
  productPrice: { type: Number },
  quantity: {
    type: Number,
    required: [true, 'Please tell us your quantity number!']
  },
  unit: { type: String },

  storeName: { type: String },
  orderProductStatus: {
    type: String,
    enum: ['sentOrderToStore', 'deliveredToApp', 'canceledByStore'],
    default: 'sentOrderToStore'
  },

  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  },

  updatedAt: { type: Date },
  isDeleted: {
    type: Boolean,
    default: false,
    select: false
  },
  deletedAt: Date
});

// QUERY MIDDLEWARE

orderProductSchema.pre(/^find/, function(next) {
  this.find({
    isDeleted: false
  });

  next();
});

const OrderProduct = mongoose.model('OrderProduct', orderProductSchema);

module.exports = OrderProduct;
