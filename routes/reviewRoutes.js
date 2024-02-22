const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/').get(authController.protect, reviewController.getAllReviews);

// this route uses ID of the product
router
  .route('/:id')
  .post(authController.protect, reviewController.createReview);

//this routes use ID of review
router.route('/:id').patch(reviewController.updateReview);

//only admin can delete review so if reviewer use bad language, store owner can report reviewer to admin
router
  .route('/:id')
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    reviewController.adminDeleteReview
  );

module.exports = router;
