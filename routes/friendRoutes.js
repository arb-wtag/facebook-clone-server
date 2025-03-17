const express=require('express');
const authMiddleware=require('../middlewares/authMiddleware');
const { sendFriendRequest, acceptFriendRequest, declineFriendRequest, removeFriend, getFriendList, getPendingRequests }=require('../controllers/friendController');

const router=express.Router();

router.post('/request/:friend_id',authMiddleware,sendFriendRequest);
router.put('/accept/:friend_id',authMiddleware,acceptFriendRequest);
router.put('/decline/:friend_id',authMiddleware,declineFriendRequest);
router.delete('/remove/:friend_id',authMiddleware,removeFriend);
router.get('/friends',authMiddleware,getFriendList);
router.get('/pending',authMiddleware,getPendingRequests);

module.exports=router;