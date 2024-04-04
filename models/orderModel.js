const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    select: false
  },
  customerName: { type: String },
  price: { type: Number },

  deliverTo: { type: String },
  orderDate: { type: Date },
  orderStatus: {
    type: String,
    enum: [
      'openToAdd',
      'sentOrderToStore',
      'delivering',
      'delivered',
      'canceled'
    ],
    default: 'openToAdd'
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  },
  cancelBy: { type: String },
  isDeleted: {
    type: Boolean,
    default: false,
    select: false
  },
  updatedAt: { type: Date },
  deletedAt: { type: Date }
});

// QUERY MIDDLEWARE

orderSchema.pre(/^find/, function(next) {
  this.find({
    isDeleted: false
  });

  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
