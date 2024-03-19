const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);

router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);

router.route('/').get(authController.protect, userController.getAllUsers);

router.route('/myInfo').get(authController.protect, userController.getMyInfo);
router.route('/:id').get(userController.getUser);

router
  .route('/updateMe')
  .patch(
    authController.protect,
    userController.uploadUserPhoto,
    userController.updateMe
  );
router
  .route('/updateUser/:id')
  .patch(userController.uploadUserPhoto, userController.updateUser);

router.delete('/deleteMe', authController.protect, userController.deleteMe);

router
  .route('/adminChangeUserPassword/:id')
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    userController.adminChangeUserPassword
  );

router
  .route('/adminActivateUser/:id')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    userController.adminActivateUser
  );

router
  .route('/:id')
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    userController.adminDeleteUser
  );

module.exports = router;
