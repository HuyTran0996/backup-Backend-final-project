const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);

router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);

router.route('/').get(userController.getAllUsers);

router.route('/:id').get(userController.getUser);
router.route('/:id').patch(userController.updateUser);
router.delete('/deleteMe', authController.protect, userController.deleteMe);

router
  .route('/:id')
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    userController.adminDeleteUser
  );

module.exports = router;
