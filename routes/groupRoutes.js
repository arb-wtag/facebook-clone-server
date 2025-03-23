const express=require('express');
const authMiddleware=require('../middlewares/authMiddleware');
const { createGroup, joinGroup, leaveGroup, getGroupMembers, changeUserRole, deleteGroup, getUserGroups, getAllGroups, deleteGroupPost, createGroupPost, getGroupPosts, groupInvite, acceptInvite, getInvites }=require('../controllers/groupController');

const router=express.Router();

router.get('/',authMiddleware,getAllGroups);
router.post('/',authMiddleware,createGroup);
router.post('/:group_id/join',authMiddleware,joinGroup);
router.post('/:group_id/leave',authMiddleware,leaveGroup);
router.get('/:group_id/members',authMiddleware,getGroupMembers);
router.put('/:group_id/role/:user_id',authMiddleware,changeUserRole);
router.delete('/:group_id',authMiddleware,deleteGroup);
router.get('/my-groups',authMiddleware,getUserGroups);
router.get("/:group_id/posts",authMiddleware,getGroupPosts);
router.post("/:group_id/posts",authMiddleware,createGroupPost);
router.delete("/:group_id/posts/:post_id",authMiddleware,deleteGroupPost);
router.post('/:groupId/invite',authMiddleware,groupInvite);
router.post('/invitations/:inviteId/accept',authMiddleware,acceptInvite);
router.get('/invitations',authMiddleware,getInvites);

module.exports=router;