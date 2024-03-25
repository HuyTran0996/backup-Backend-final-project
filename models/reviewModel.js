const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  //trả productID, productName,reviewerID,reviewerName cách làm này là chưa tối ưu, chỉ cần 1 object productID,reviewerID  là đủ, khi trả respone ta có thể dùng populate của mongo để trả full thông tin của user trong respone mà ko cần phải tạo lẻ tẻ
  // cái populate này nên chạy ở file schema của chính schema này, ví dụ
  // storeSchema.pre(/^find/, function(next) {
  //   this.populate({
  //     path: "storeOwner" });
  //   next();
  // });
  productID: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }
  ],
  productName: { type: String },
  reviewerID: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  reviewerName: { type: String },
  userReview: {
    type: String,
    required: [true, 'give us your review about this product'],
    trim: true,
    maxlength: [200, 'A review must have less or equal then 200 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  },

  isDeleted: {
    type: Boolean,
    default: false
  },
  updatedAt: Date,
  deletedAt: Date
});

// QUERY MIDDLEWARE

// reviewSchema.pre(/^find/, function(next) {
//   this.find({
//     isDeleted: false
//   });

//   next();
// });

reviewSchema.pre(/^find/, function(next) {
  // Check if the query has a specific option set to bypass the isDeleted filter
  if (!this.getOptions().bypassIsDeletedFilter) {
    this.find({ isDeleted: false });
  }
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
