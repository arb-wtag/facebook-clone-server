const express=require('express');
const { getProfile,updateProfile }=require('../controllers/userController');
const authMiddleware=require('../middlewares/authMiddleware');

const router=express.Router();

router.get('/:id',getProfile);
router.put('/:id',authMiddleware,updateProfile);

module.exports=router;