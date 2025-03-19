const pool=require('../database/db');

const createGroup=async (req,res)=>{
    try{
        const { name,description }=req.body;
        const admin_id=req.user.id;
        const result=await pool.query("INSERT INTO groups (name, description, admin_id) VALUES ($1, $2, $3) RETURNING id",[name,description,admin_id]);
        const group_id=result.rows[0].id;
        await pool.query("INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, 'admin')",[group_id,admin_id]);
        res.status(201).json({message:`Group created ${group_id}`});
    }
    catch(error){
        res.status(500).json({'error':error.message});
    }
};

const joinGroup=async (req,res)=>{
    try{
        const group_id=req.params.group_id;
        const user_id=req.user.id;
        await pool.query("INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, 'member') ON CONFLICT DO NOTHING",[group_id,user_id]);
        res.json({message:'Joined group'});
    }
    catch(error){
        res.status(500).json({'error':error.message});
    }
};

const leaveGroup=async (req,res)=>{
    try{
        const group_id=req.params.group_id;
        const user_id=req.user.id;
        const result=await pool.query("SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2",[group_id,user_id]);
        if(result.rows.length===0)
        {
            return res.status(400).json({message:'You are not a member of this group'});
        }
        if(result.rows[0].role==='admin'){
            return res.status(403).json({message:'Admin cannot leave the group, assign new admin first'});
        }
        await pool.query("DELETE FROM group_members WHERE group_id = $1 AND user_id = $2",[group_id,user_id]);
        res.json({message:'Left group'});
    }
    catch(error){
        res.status(500).json({'error':error.message});
    }
};

const getGroupMembers=async (req,res)=>{
    try{
        const group_id=req.params.group_id;
        const result=await pool.query("SELECT users.id, users.username, users.photo, group_members.role FROM group_members JOIN users ON group_members.user_id = users.id WHERE group_members.group_id = $1",[group_id]);
        res.json(result.rows);
    }
    catch(error){
        res.status(500).json({'error':error.message});
    }
};

const changeUserRole=async (req,res)=>{
    try{
        const group_id=req.params.group_id;
        const user_id=req.params.user_id;
        const { role }=req.body;
        const requester_id=req.user.id;
        const result=await pool.query("SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2",[group_id,requester_id]);
        if(result.rows.length===0)
        {
            return res.status(404).json({message:'User not found in the group'});
        }
        if(result.rows[0].role!=='admin'){
            return res.status(403).json({message:'Only admins can change roles'});
        }
        await pool.query("UPDATE group_members SET role = $1 WHERE group_id = $2 AND user_id = $3",[role,group_id,user_id]);
        res.json({message:'User role updated'});
    }
    catch(error){
        res.status(500).json({'error':error.message});
    }
};

const deleteGroup=async (req,res)=>{
    try{
        const group_id=req.params.group_id;
        const user_id=req.user.id;
        const group=await pool.query("SELECT admin_id FROM groups WHERE id = $1",[group_id]);
        if(group.rows.length===0)
        {
            return res.status(404).json({message:'Group not found'});
        }
        if(group.rows[0].admin_id!==user_id)
        {
            return res.status(403).json({message: 'Only the admin can delete this group'});
        }
        await pool.query("DELETE FROM groups WHERE id = $1",[group_id]);
        res.json({message:'Group Deleted'});
    }
    catch(error){
        res.status(500).json({'error':error.message});
    }
};

const getUserGroups=async (req,res)=>{
    try{
        const user_id=req.user.id;
        const result=await pool.query("SELECT groups.id, groups.admin_id, groups.name, groups.description, group_members.role FROM group_members JOIN groups ON group_members.group_id = groups.id WHERE group_members.user_id = $1",[user_id]);
        res.json(result.rows);
    }
    catch(error){
        res.status(500).json({'error':error.message});
    }
};

const getAllGroups = async (req,res)=>{
    try{
      const result = await pool.query("SELECT * FROM groups ORDER BY created_at DESC");
      res.status(200).json(result.rows);
    } 
    catch(error){
      console.error("Error fetching groups:", error);
      res.status(500).json({ error: "Failed to fetch groups" });
    }
};

const getGroupPosts = async (req,res)=>{
    const { group_id } = req.params;
    try {
      const result = await pool.query(
        `SELECT posts.*, users.username 
         FROM posts 
         JOIN users ON posts.user_id = users.id 
         WHERE posts.group_id = $1 
         ORDER BY posts.created_at DESC`,
        [group_id]
      );
      res.status(200).json(result.rows);
    } 
    catch (error) {
      console.error("Error fetching group posts:", error);
      res.status(500).json({ error: "Failed to fetch group posts" });
    }
  };
  
const createGroupPost = async (req, res) => {
    const { group_id } = req.params;
    const { content } = req.body;
    const user_id = req.user.id; 
  
    if (!content) 
    {
      return res.status(400).json({ error: "Post content cannot be empty" });
    }
  
    try {
      const membershipCheck = await pool.query(
        "SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2",
        [group_id, user_id]
      );
      if (membershipCheck.rows.length === 0) {
        return res.status(403).json({ error: "You are not a member of this group" });
      }
  
      
      const result = await pool.query(
        "INSERT INTO posts (user_id, group_id, content) VALUES ($1, $2, $3) RETURNING *",
        [user_id, group_id, content]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Error creating group post:", error);
      res.status(500).json({ error: "Failed to create post" });
    }
};
  
const deleteGroupPost = async (req, res) => {
    const { group_id, post_id } = req.params;
    const user_id = req.user.id;
  
    try {
      const post = await pool.query("SELECT * FROM posts WHERE id = $1 AND group_id = $2", [post_id, group_id]);
      if (post.rows.length === 0) {
        return res.status(404).json({ error: "Post not found" });
      }
  
      const postOwner = post.rows[0].user_id;
  
      const groupAdminCheck = await pool.query(
        "SELECT * FROM groups WHERE id = $1 AND admin_id = $2",
        [group_id, user_id]
      );
  
      if (postOwner !== user_id && groupAdminCheck.rows.length === 0) {
        return res.status(403).json({ error: "You do not have permission to delete this post" });
      }
  
      await pool.query("DELETE FROM posts WHERE id = $1", [post_id]);
      res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error("Error deleting group post:", error);
      res.status(500).json({ error: "Failed to delete post" });
    }
};  

module.exports={ createGroup,joinGroup,leaveGroup,getGroupMembers,changeUserRole,deleteGroup,getUserGroups,getAllGroups,getGroupPosts,createGroupPost,deleteGroupPost };