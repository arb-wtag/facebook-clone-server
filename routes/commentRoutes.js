const express=require('express');
const { addComment, getPostComments, deleteComment }=require('../controllers/commentController');
const authMiddleware=require('../middlewares/authMiddleware');

const router=express.Router();

router.post('/:post_id',authMiddleware,addComment); //
router.get('/:post_id',getPostComments); //
router.delete('/:comment_id',authMiddleware,deleteComment); //

module.exports=router;