const express = require('express');
const orderProductController = require('../controllers/orderProductController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(authController.protect, orderProductController.getAllOrderProducts);
router
  .route('/')
  .post(authController.protect, orderProductController.createOrderProduct);

router
  .route('/:id')
  .patch(authController.protect, orderProductController.updateOrderProduct);

router
  .route('/:id')
  .delete(authController.protect, orderProductController.deleteOrderProduct);

module.exports = router;
