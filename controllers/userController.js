const pool=require('../database/db');

const getProfile=async (req,res)=>{
    try{
        const id=req.params.id;
        const result=await pool.query("SELECT id, username, email, photo, bio FROM users WHERE id=$1",[id]);
        if(result.rows.length===0)
        {
            return res.status(404).json({message:'User not found'});
        }
        res.json(result.rows[0]);
    }
    catch(error){
        res.status(500).json({'error':error.message});
    }
};

const updateProfile=async (req,res)=>{
    try{
        const id=req.params.id;
        const { username,bio,photo }=req.body;
        if(req.user.id!==id)
        {
            return res.status(403).json({message:"Unauthorized action"});
        }
        await pool.query("UPDATE users SET username=$1, bio=$2, photo=$3 WHERE id=$4",[username,bio,photo]);
        res.json({message:'Profile updated successfully'});
    }
    catch(error)
    {
        res.status(500).json({'error':error.message});
    }
};

module.exports={ getProfile,updateProfile };