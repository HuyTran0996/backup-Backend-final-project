const mongoose = require('mongoose');

const orderProductSchema = new mongoose.Schema({
  orderID: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    }
  ],

  productID: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      select: false
    }
  ],
  productName: { type: String },
  productPrice: { type: Number },
  quantity: {
    type: Number,
    required: [true, 'Please tell us your quantity number!']
  },
  productPricexQuantity: { type: Number },

  StoreID: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      select: false
    }
  ],
  storeName: { type: String },

  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  },

  updatedAt: { type: Date }
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
