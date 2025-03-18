const express=require('express');
const { register,login,logout, checkLogin }=require('../controllers/authController');
const authMiddleware=require('../middlewares/authMiddleware');

const router=express.Router();

router.post('/register',register);
router.post('/login',login);
router.post('/logout',logout);
router.get('/check-login',authMiddleware,checkLogin);

module.exports=router;