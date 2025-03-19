const pool=require('../database/db');

const sendMessage=async (req,res)=>{
    try{
        const { receiver_id,content }=req.body;
        const sender_id=req.user.id;
        if(!receiver_id || !content)
        {
            return res.status(400).json({message:'Receiver and content are required'});
        }
        const newMessage=await pool.query("INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *",[sender_id, receiver_id, content]);
        res.status(201).json(newMessage.rows[0]);
    }   
    catch(error)
    {
        res.status(500).json({ message: "Internal server error" });
    }
};

const getMessage=async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const loggedInUserId = req.user.id;

        const messages = await pool.query(
            `SELECT * FROM messages 
             WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1) 
             ORDER BY created_at ASC`,
            [loggedInUserId, userId]
        );

        res.json(messages.rows);
    } 
    catch (error) 
    {
        res.status(500).json({ message: "Internal server error" });
    }
};

const getConversations = async (req, res) => {
    try {
        const userId = req.user.id;
        const conversations = await pool.query(
            `SELECT DISTINCT users.id, users.username, users.photo FROM users 
            JOIN messages ON users.id = messages.sender_id OR users.id = messages.receiver_id
            WHERE (messages.sender_id = $1 OR messages.receiver_id = $1) AND users.id != $1`,
            [userId]
        );
        res.json(conversations.rows);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch conversations" });
    }
};

const startConversation = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { receiverId } = req.params;

        const existingConversation = await pool.query(`
            SELECT * FROM messages WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
        `, [senderId, receiverId]);

        if (existingConversation.rows.length > 0) {
            return res.json({ message: "Conversation already exists" });
        }

        res.json({ message: "Conversation started, send a message to continue." });
    } catch (error) {
        res.status(500).json({ error: "Error starting conversation" });
    }
};

const searchUser=async (req, res) => {
    try {
        const { username } = req.query;
        if (!username) return res.status(400).json({ error: "Username is required" });

        const users = await pool.query(
            "SELECT id, username FROM users WHERE username = $1",
            [username]
        );

        res.json(users.rows);
    } catch (error) {
        console.error("Error searching users:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports={ sendMessage,getMessage,getConversations,startConversation,searchUser };