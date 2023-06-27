import express from 'express'

const router = express.Router();

import userController from '../controllers/userController.js'
import checkUserAuth from '../Middleware/authMiddleware.js';

router.use('/changepassword',checkUserAuth);
router.use('/loggedUser',checkUserAuth);

//Public Routes
router.post('/register',userController.userRegistration);
router.post('/login',userController.userLogin);
router.post('/send-user-password-reset-email',userController.sendUserPasswordResetEmail);
router.post('/reset-password/:id/:token',userController.userPasswordReset);

//Protected Routes
router.post('/changepassword',userController.changeUserPassword);
router.get('/loggedUser',userController.loggedUser);
export default router;