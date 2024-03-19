const express = require('express');
const storeController = require('../controllers/storeController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/').get(authController.protect, storeController.getAllStores);
router.route('/').post(authController.protect, storeController.createStore);

router
  .route('/adminActivateStore/:id')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    storeController.adminActivateStore
  );

router.route('/:id').get(storeController.getStore);
router
  .route('/:id')
  .patch(storeController.uploadStorePhoto, storeController.updateStore);

router
  .route('/:id')
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    storeController.deleteStore
  );

module.exports = router;
