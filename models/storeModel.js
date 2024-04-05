const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  storeOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    select: false
  },
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
  normalizedStoreName: { type: String, select: false },
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
    type: Boolean,
    default: false
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
