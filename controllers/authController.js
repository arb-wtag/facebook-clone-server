const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const pool=require('../database/db');
const { body, validationResult }=require('express-validator');

const validateRegister = [
    body("username")
        .trim()
        .isLength({ min: 3 })
        .withMessage("Username must be at least 3 characters long")
        .isAlphanumeric()
        .withMessage("Username must contain only letters and numbers")
        .escape(),
    body("email")
        .isEmail()
        .withMessage("Invalid email format")
        .normalizeEmail(),
    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
];

const validateLogin = [
    body("email")
        .isEmail()
        .withMessage("Invalid email format")
        .normalizeEmail(),
    body("password")
        .notEmpty()
        .withMessage("Password is required"),
];

const register=async (req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try{
        const { username,email,password }=req.body;
        const existingUser=await pool.query("SELECT * FROM users WHERE username=$1 OR email=$2",[username,email]);
        if(existingUser.rows.length>0)
        {
            return res.status(400).json({message: 'username or email already taken'});
        }

        const hashedPassword=await bcrypt.hash(password,10);

        await pool.query("INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",[username,email,hashedPassword]);
        res.status(201).json({message:'User registered successfully'});
    }
    catch(error){
        res.status(500).json({'error':error.message});
    }
};

const login=async (req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try{
        const { email,password }=req.body;
        const user=await pool.query("SELECT * FROM users WHERE email=$1",[email]);
        if(user.rows.length===0)
        {
            return res.status(401).json({message:'Invalid credentials'});
        }
        const validPassword=await bcrypt.compare(password,user.rows[0].password);
        if(!validPassword)
        {
            return res.status(401).json({message:'Invalid credentials'});
        }
        const token=jwt.sign({id:user.rows[0].id},process.env.JWT_SECRET,{expiresIn:'1d'});
        res.cookie('token',token,{
            httpOnly: true,
            secure: process.env.NODE_ENV==='producion'
        });
        res.json({message:'Login successful'});
    }
    catch(error){
        res.status(500).json({'error':error.message});
    }
}

const logout=(req,res)=>{
    res.clearCookie('token');
    res.json({'message':'Logged out successfully'});
}

const checkLogin=async (req,res)=>{
    try{
        const user = await pool.query("SELECT id, username, email, photo FROM users WHERE id = $1", [req.user.id]);
        if(user.rows.length===0)
        {
            return res.status(404).json({message:'User not found'});
        }
        res.json(user.rows[0]);
    }
    catch(error){
        res.status(500).json({'error':error.message});
    }
}

module.exports={ register,login,logout,checkLogin,validateRegister,validateLogin };