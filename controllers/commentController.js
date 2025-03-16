const pool=require('../database/db');

const addComment=async (req,res)=>{
    try{
        const post_id=req.params.post_id;
        const { content }=req.body;
        const user_id=req.user.id;
        const result=await pool.query("INSERT INTO comments (user_id, post_id, content) VALUES ($1, $2, $3) RETURNING *",[user_id,post_id,content]);
        res.status(201).json(result.rows[0]);
    }
    catch(error){
        res.status(500).json({'error':error.message});
    }
};

const getPostComments=async (req,res)=>{
    try{
        const post_id=req.params.post_id;
        const result=await pool.query("SELECT comments.*, users.username, users.photo AS user_photo FROM comments JOIN users ON comments.user_id = users.id WHERE post_id = $1 ORDER BY comments.created_at ASC",[post_id]);
        res.json(result.rows);
    }
    catch(error){
        res.status(500).json({'error':error.message});
    }
};

const deleteComment=async (req,res)=>{
    try{
        const comment_id=req.params.comment_id;
        const user_id=req.user.id;

        const comment=await pool.query("SELECT * FROM comments WHERE id = $1",[comment_id]);
        if(comment.rows.length===0)
        {
            return res.status(404).json({'message':'Comment not found'});
        }
        if(comment.rows[0].user_id!==user_id)
        {
            return res.status(403).json({'message':'Unauthorized action'});
        }
        await pool.query("DELETE FROM comments WHERE id = $1",[comment_id]);
        res.json({'message':'Comment deleted'});
    }
    catch(error)
    {
        res.status(500).json({'error':error.message});
    }
};

module.exports={ addComment, getPostComments, deleteComment };