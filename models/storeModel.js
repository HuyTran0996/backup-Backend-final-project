const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  //trả storeOwner, ownerEmail cách làm này là chưa tối ưu, chỉ cần 1 object user._id là đủ, khi trả respone ta có thể dùng populate của mongo để trả full thông tin của user trong respone mà ko cần phải tạo lẻ tẻ user.email,....
  // cái populate này nên chạy ở file schema của chính schema này, ví dụ
  // storeSchema.pre(/^find/, function(next) {
  //   this.populate({
  //     path: "storeOwner" });
  //   next();
  // });
  storeOwner: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      select: false
    }
  ],
  ownerEmail: {
    type: String
    // required: [true, 'you must provide email of owner']
  },
  storeName: {
    type: String,
    required: [true, 'A store must have a name'],
    unique: true,
    trim: true,
    maxlength: [40, 'A store name must have less or equal then 40 characters']
  },
  address: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  },
  isDeleted: {
    type: Boolean
  },
  deletedAt: Date,
  photo: { type: String, default: '' },
  cloudinaryId: { type: String, default: '' }
});

// QUERY MIDDLEWARE

// storeSchema.pre(/^find/, function(next) {
//   this.find({
//     isDeleted: false
//   });

//   next();
// });

storeSchema.pre(/^find/, function(next) {
  // Check if the query has a specific option set to bypass the isDeleted filter
  if (!this.getOptions().bypassIsDeletedFilter) {
    this.find({ isDeleted: false });
  }
  next();
});

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;
