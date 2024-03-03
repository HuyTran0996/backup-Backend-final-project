const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  storeID: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      select: false
    }
  ],
  storeName: { type: String },
  productName: {
    type: String,
    required: [true, 'A product must have a name'],
    trim: true,
    maxlength: [40, 'A product name must have less or equal then 40 characters']
  },
  description: {
    type: String,
    required: [true, 'A product must have a description'],
    trim: true,
    maxlength: [
      100,
      'A product description must have less or equal then 100 characters'
    ]
  },
  price: {
    type: Number,
    required: [true, 'A product must have a price']
  },
  unit: {
    type: String,
    required: [true, 'A product must have a unit']
  },

  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  },

  isDeleted: {
    type: Boolean,
    default: false,
    select: false
  },
  deletedAt: Date,
  photo: { type: String },
  cloudinaryId: { type: String }
});

// QUERY MIDDLEWARE

productSchema.pre(/^find/, function(next) {
  this.find({
    isDeleted: false
  });

  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
