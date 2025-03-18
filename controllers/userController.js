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
        const { username,bio }=req.body;
        const photo = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : null;
        //console.log(req.user.id,id);
        if(req.user.id!==parseInt(id))
        {
            return res.status(403).json({message:"Unauthorized action"});
        }
        await pool.query("UPDATE users SET username=$1, bio=$2, photo=$3 WHERE id=$4",[username,bio,photo,id]);
        res.json({message:'Profile updated successfully'});
    }
    catch(error)
    {
        res.status(500).json({'error':error.message});
    }
};

module.exports={ getProfile,updateProfile };