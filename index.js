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

const app=express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth',authRoutes);
app.use('/api/users',userRoutes);
app.use('/api/posts',postRoutes);
app.use('/api/likes',likeRoutes);
app.use('/api/comments',commentRoutes);

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