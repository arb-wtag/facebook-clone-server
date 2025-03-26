const express=require('express');
const cors=require('cors');
const cookieParser=require('cookie-parser');
const http=require('http');
const { Server }=require('socket.io');
require('dotenv').config();
const authRoutes=require('./routes/authRoutes');
const userRoutes=require('./routes/userRoutes');
const postRoutes=require('./routes/postRoutes');
const likeRoutes=require('./routes/likeRoutes');
const commentRoutes=require('./routes/commentRoutes');
const friendRoutes=require('./routes/friendRoutes');
const groupRoutes=require('./routes/groupRoutes');
const inboxRoutes=require('./routes/inboxRoutes');
const path=require('path');
const { apiLimiter } = require('./middlewares/rateLimiterMiddleware');

const app=express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use("/api", apiLimiter);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use('/api/auth',authRoutes);
app.use('/api/users',userRoutes);
app.use('/api/posts',postRoutes);
app.use('/api/likes',likeRoutes);
app.use('/api/comments',commentRoutes);
app.use('/api/friends',friendRoutes);
app.use('/api/groups',groupRoutes);
app.use('/api/inbox',inboxRoutes);

const server=http.createServer(app);

const io=new Server(server,{
    cors: {
        origin: 'http://localhost:5173',
        credentials: true,
    },
});

io.on('connection',(socket)=>{
    console.log('A user connected:',socket.id);

    socket.on('sendMessage',(data)=>{
        io.emit('receiveMessage',data);
    });

    socket.on('disconnect',()=>{
        console.log('A user disconnected:',socket.id); 
    });
});

const port=process.env.PORT || 5000;
server.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});