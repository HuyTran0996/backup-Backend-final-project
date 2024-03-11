const express = require('express');
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/').get(authController.protect, productController.getAllProducts);
router.route('/').post(authController.protect, productController.createProduct);

router.route('/:id').get(productController.getProduct);
router
  .route('/:id')
  .patch(productController.uploadProductPhoto, productController.updateProduct);
router.route('/:id').delete(
  authController.protect,
  // authController.restrictTo('admin'),
  productController.deleteProduct
);

module.exports = router;
