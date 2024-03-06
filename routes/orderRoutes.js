const express = require('express');
const orderController = require('../controllers/orderController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/').get(authController.protect, orderController.getAllOrders);
router
  .route('/createOrder')
  .post(authController.protect, orderController.createOrder);

router.route('/:id').get(authController.protect, orderController.getOrder);
router.route('/:id').patch(orderController.updateOrder);
router
  .route('/cancelOrder/:id')
  .patch(authController.protect, orderController.cancelOrder);

//only admin can delete Order

router
  .route('/:id')
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    orderController.adminDeleteOrder
  );

module.exports = router;
