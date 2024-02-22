const express = require('express');
const orderController = require('../controllers/orderController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/').get(authController.protect, orderController.getAllOrders);
router.route('/').post(authController.protect, orderController.createOrder);

router.route('/:id').get(authController.protect, orderController.getOrder);
router.route('/:id').patch(authController.protect, orderController.updateOrder);

//only admin can delete Order

router
  .route('/:id')
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    orderController.adminDeleteOrder
  );

module.exports = router;
