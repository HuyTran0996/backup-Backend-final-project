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

router
  .route('/getAllReviewsForAdmin')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    reviewController.getAllReviewsForAdmin
  );

router
  .route('/adminActivateReview/:id')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    reviewController.adminActivateReview
  );

router
  .route('/:id')
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    reviewController.adminDeleteReview
  );

module.exports = router;
