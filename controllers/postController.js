const pool=require('../database/db');
const sharp = require('sharp');
const fs = require('fs');

const createPost=async (req,res)=>{
    try{
        const { content,group_id }=req.body;
        if(content.length>500)
        {
            return res.status(400).json({message:'Post content cannot exceed 500 characters'});
        }
        const user_id=req.user.id;
        //const imagePath=`uploads/compressed-${Date.now()}.jpg`;
        //console.log(typeof content);
        let imagePaths = [];
        /*if(req.file){
        await sharp(req.file.path)
            .resize({ width: 800 })
            .jpeg({ quality: 70 })  
            .toFile(imagePath);

            fs.unlink(req.file.path, (error) => {
                if (error) console.error("Error deleting original file:", error);
            });
        }*/

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const compressedPath = `uploads/compressed-${Date.now()}-${file.filename}.jpg`;
    
                await sharp(file.path)
                      .resize({ width: 800 })
                      .jpeg({ quality: 70 })
                      .toFile(compressedPath);
    
                // Delete the original uploaded file
                fs.unlink(file.path, (error) => {
                    if (error) console.error("Error deleting original file:", error);
                });
    
                imagePaths.push(`http://localhost:5000/${compressedPath}`);
            }
        }

        //const image = req.file ? `http://localhost:5000/${imagePath}` : null;

        const result=await pool.query("INSERT INTO posts (user_id, group_id, content, image) VALUES ($1, $2, $3, $4) RETURNING *",[user_id,group_id || null,content,imagePaths.length > 0 ? JSON.stringify(imagePaths) : null]);
        res.status(201).json(result.rows[0]);
    }
    catch(error)
    {
        console.error("Error processing image:", error);
        res.status(500).json({'error':error.message});
    }
};

const getAllPosts=async (req,res)=>{
    try{
        //const result=await pool.query("SELECT posts.*, users.username, users.photo AS user_photo, groups.name AS group_name FROM posts JOIN users ON posts.user_id = users.id LEFT JOIN groups ON posts.group_id = groups.id ORDER BY posts.created_at DESC");
        const id=req.user.id;
        const result=await pool.query(`
            SELECT posts.*, users.username, users.photo AS user_photo 
            FROM posts
            JOIN users ON posts.user_id = users.id
            WHERE posts.user_id = $1
            OR posts.user_id IN (
                SELECT friend_id FROM friendships WHERE user_id = $1 AND status = 'accepted'
                UNION
                SELECT user_id FROM friendships WHERE friend_id = $1 AND status = 'accepted'
            )
            ORDER BY posts.created_at DESC
            `,[id]);
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