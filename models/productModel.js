const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  storeID: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store'
    }
  ],
  storeName: { type: String },
  productName: {
    type: String,
    required: [true, 'A product must have a name'],
    trim: true,
    maxlength: [40, 'A product name must have less or equal then 40 characters']
  },
  normalizedProductName: { type: String, select: false },
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
  genre: {
    type: String,
    enum: ['Foods', 'Devices', 'Stationery', 'Others'],
    default: 'Others'
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
  photo: { type: String, default: '' },
  cloudinaryId: { type: String, default: '' }
});

// QUERY MIDDLEWARENewPageCreateProduct

//trong đây, ta có thể trả các review cùng lúc khi gọi find bên product schema, nghĩa là bên product schema không cần add thêm review để bỏ các id của reviews vào vì càng ngày sẽ càng làm array này lớn lên và như vậy không tốt
// để làm được vậy ta sử dụng virtual của mongo

// the localField is set to _id, which means that when you populate the reviews virtual property, Mongoose will look for documents in the Review collection where the productID matches the _id of the current Product document. This allows you to dynamically fetch related reviews for a product without needing to store an array of review IDs directly in the product schema, which can become unwieldy and inefficient as the number of reviews grows.
// Xem kĩ section 11 để phối hợp giữa populate và virtual

// productSchema.virtual('reviews', {
//   ref: 'Review',
//   foreignField: 'productID', //productID là field bên reviewModel
//   localField: '_id'
// });

productSchema.pre(/^find/, function(next) {
  this.find({
    isDeleted: false
  });

  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
