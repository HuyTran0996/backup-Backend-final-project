const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
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
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  photo: { type: String },
  cloudinaryId: { type: String }
});

// QUERY MIDDLEWARE

storeSchema.pre(/^find/, function(next) {
  this.find({
    isDeleted: false
  });

  next();
});

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;
