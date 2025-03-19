const pool=require('../database/db');

const sendFriendRequest=async (req,res)=>{
    try{
        const friend_id=req.params.friend_id;
        const user_id=req.user.id;
        if(user_id===parseInt(friend_id))
        {
            return res.status(400).json({'message':'You cannot send a friend request to yourself'});
        }
        await pool.query("INSERT INTO friendships (user_id, friend_id, status) VALUES ($1, $2, 'pending') ON CONFLICT (user_id, friend_id) DO NOTHING",[user_id,friend_id]);
        res.json({'message':'friend request sent'});
    }
    catch(error){
        res.status(500).json({'error':error.message});
    }
};

const acceptFriendRequest=async (req,res)=>{
    try{
        const friend_id=req.params.friend_id;
        const user_id=req.user.id;
        await pool.query("UPDATE friendships SET status = 'accepted' WHERE user_id = $2 AND friend_id = $1 AND status = 'pending'",[user_id,friend_id]);
        res.json({'message':'friend request accepted'});
    }
    catch(error){
        res.status(500).json({'error':error.message});
    }
};

const declineFriendRequest=async (req,res)=>{
    try{
        const friend_id=req.params.friend_id;
        const user_id=req.user.id;
        await pool.query("DELETE FROM friendships WHERE user_id = $2 AND friend_id = $1 AND status = 'pending'",[user_id,friend_id]);
        res.json({'message':'friend request declined'});
    }
    catch(error){
        res.status(500).json({'error':error.message});
    }
};

const removeFriend=async (req,res)=>{
    try{
        const friend_id=req.params.friend_id;
        const user_id=req.user.id;
        await pool.query("DELETE FROM friendships WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)",[user_id,friend_id]);
        res.json({'message':'friend removed'});
    }
    catch(error){
        res.status(500).json({'error':error.message});
    }
};

const getFriendList=async (req,res)=>{
    try{
        const user_id=req.user.id;
        const result=await pool.query(`SELECT users.id, users.username, users.photo 
            FROM friendships 
            JOIN users ON users.id = 
                CASE 
                    WHEN friendships.user_id = $1 THEN friendships.friend_id
                    ELSE friendships.user_id
                END
            WHERE (friendships.user_id = $1 OR friendships.friend_id = $1) 
            AND friendships.status = 'accepted'`,[user_id]);
        res.json(result.rows);
    }
    catch(error){
        res.status(500).json({'error':error.message});
    }
};

const getPendingRequests=async (req,res)=>{
    try{
        const user_id=req.user.id;
        const result=await pool.query("SELECT users.id, users.username, users.photo FROM friendships JOIN users ON friendships.user_id = users.id WHERE friendships.friend_id = $1 AND friendships.status = 'pending'",[user_id]);
        res.json(result.rows);
    }
    catch(error){
        res.status(500).json({'error':error.message});
    }
};

module.exports={ sendFriendRequest,acceptFriendRequest,declineFriendRequest,removeFriend,getFriendList,getPendingRequests };