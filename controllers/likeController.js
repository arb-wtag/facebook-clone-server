const pool=require('../database/db');

const likePost=async (req,res)=>{
    try{
        const post_id=req.params.post_id;
        const user_id=req.user.id;
        await pool.query("INSERT INTO likes (user_id, post_id) VALUES ($1, $2) ON CONFLICT (user_id, post_id) DO NOTHING",[user_id,post_id]);
        res.json({message: 'Post liked'});
    }
    catch(error)
    {
        res.status(500).json({'error':error.message});
    }
};

const unlikePost=async (req,res)=>{
    try{
        const post_id=req.params.post_id;
        const user_id=req.user.id;
        await pool.query("DELETE FROM likes WHERE user_id = $1 AND post_id = $2",[user_id,post_id]);
        res.json({message:'Post unliked'});
    }
    catch(error){
        res.status(500).json({'error':error.message});
    }
};

const getPostLikes=async (req,res)=>{
    try{
        const post_id=req.params.post_id;
        const user_id=req.user.id;
        const result= await pool.query("SELECT COUNT(*) FROM likes WHERE post_id = $1",[post_id]);
        const response=await pool.query("SELECT * FROM likes WHERE user_id = $1 AND post_id = $2",[user_id,post_id]);
        let userLiked=true;
        if(response.rows.length===0)
        {
            userLiked=false;
        }
        //console.log(result.rows);
        res.json({likes:result.rows[0].count,userLiked});
    }
    catch(error){
        res.status(500).json({'error':error.message});
    }
};

module.exports={ likePost,unlikePost,getPostLikes };