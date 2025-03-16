const pool=require('../database/db');

const createPost=async (req,res)=>{
    try{
        const { content,group_id }=req.body;
        const user_id=req.user.id;
        const image=req.file ? `/uploads/${req.file.filename}`: null;
        const result=await pool.query("INSERT INTO posts (user_id, group_id, content, image) VALUES ($1, $2, $3, $4) RETURNING *",[user_id,group_id || null,content,image]);
        res.status(201).json(result.rows[0]);
    }
    catch(error)
    {
        res.status(500).json({'error':error.message});
    }
};

const getAllPosts=async (req,res)=>{
    try{
        const result=await pool.query("SELECT posts.*, users.username, users.photo AS user_photo, groups.name AS group_name FROM posts JOIN users ON posts.user_id = users.id LEFT JOIN groups ON posts.group_id = groups.id ORDER BY posts.created_at DESC");
        res.json(result.rows);
    }
    catch(error)
    {
        res.status(500).json({'error':error.message});
    }
};

const getUserPosts=async (req,res)=>{
    try{
        const user_id=req.params.user_id;
        const result=await pool.query("SELECT posts.*, users.username, users.photo AS user_photo, groups.name AS group_name FROM posts JOIN users ON posts.user_id = users.id LEFT JOIN groups ON posts.group_id = groups.id WHERE posts.user_id = $1 ORDER BY posts.created_at DESC",[user_id]);
        res.json(result.rows);
    }
    catch(error){
        res.status(500).json({'error':error.message});
    }
};

const getGroupPosts=async (req,res)=>{
    try{
        const group_id=req.params.group_id;
        const result=await pool.query("SELECT posts.*, users.username, users.photo AS user_photo FROM posts JOIN users ON posts.user_id = users.id WHERE posts.group_id=$1 ORDER BY posts.created_at DESC",[group_id]);
        res.json(result.rows);
    }
    catch(error){
        res.status(500).json({'error':error.message});
    }
};

const deletePost=async (req,res)=>{
    try{
        const id=req.params.id;
        const user_id=req.user.id;
        const post=await pool.query("SELECT * FROM posts WHERE id=$1",[id]);
        if(post.rows.length===0)
        {
            return res.status(404).json({'message': 'Post not found'});
        }
        if(post.rows[0].user_id!==user_id)
        {
            return res.status(403).json({'message':'Unauthorized action'});
        }
        await pool.query("DELETE FROM posts WHERE id=$1",[id]);
        res.json({'message':'Post deleted successfully'});
    }
    catch(error)
    {
        res.status(500).json({'error':error.message});
    }
};

module.exports={ createPost,getAllPosts,getUserPosts,getGroupPosts,deletePost };