const express=require('express');
const { sendMessage, getMessage, getConversations, startConversation, searchUser }=require('../controllers/inboxController');
const authMiddleware=require('../middlewares/authMiddleware');

const router=express.Router();

router.get('/search',authMiddleware,searchUser); //
router.post('/send',authMiddleware,sendMessage); //
router.post('/conversation/:receiverId',authMiddleware,startConversation); //
router.get('/conversation',authMiddleware,getConversations); //
router.get('/conversation/:userId',authMiddleware,getMessage); //

module.exports=router;