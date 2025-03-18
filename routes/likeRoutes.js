const express=require('express');
const { likePost, unlikePost, getPostLikes }=require('../controllers/likeController');
const authMiddleware=require('../middlewares/authMiddleware');

const router=express.Router();

router.post('/:post_id',authMiddleware,likePost);
router.delete('/:post_id',authMiddleware,unlikePost);
router.get('/:post_id',authMiddleware,getPostLikes);

module.exports=router;