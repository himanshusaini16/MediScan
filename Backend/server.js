import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoute.js'
import doctorRouter from './routes/doctorRoute.js'
import userRouter from './routes/userRoute.js'
import path from 'path'
import { fileURLToPath } from 'url';
import tf from '@tensorflow/tfjs'

import http from 'http';
import  {Server }  from 'socket.io';
import router from './routes/messageRoute.js'


// App Config

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
const port = process.env.PORT || 4000

const server = http.createServer(app)
const io = new Server(server, {
    cors: {
      origin: "*", 
      methods: ["GET", "POST"],
      credentials: true,
    },
  });


connectDB()
connectCloudinary()



// middleware
app.use(express.json())
app.use(cors())

app.use('/Vericose/tfjs_model',express.static(path.join(__dirname,"Vericose","tfjs_model")))
const Vericose_model_url = "https://mediscan-6ikc.onrender.com/Vericose/tfjs_model/model.json";

let vericoseModel = null;
async function VeriCose_Model_load() {
    try {
        vericoseModel = await tf.loadLayersModel(Vericose_model_url);
       console.log("Vericose Model Loded!");
    } catch (error) {
    }
}
VeriCose_Model_load()

app.use('/Disease/Diabetes/tfjs_model',express.static(path.join(__dirname,"Disease","Diabetes","tfjs_model")))
const Diabetes_model_url = "https://mediscan-6ikc.onrender.com/Disease/Diabetes/tfjs_model/model.json";

app.use('/Disease/heartdisease/tfjs_model',express.static(path.join(__dirname,"Disease","heartdisease","tfjs_model")))
const heartdisease_model_url = "https://mediscan-6ikc.onrender.com/Disease/heartdisease/tfjs_model/model.json";

app.use('/Disease/EyeDisease/tfjs_model',express.static(path.join(__dirname,"Disease","EyeDisease","tfjs_model")))
const eyedisease_model_url = "https://mediscan-6ikc.onrender.com/Disease/EyeDisease/tfjs_model/model.json";


app.use('/Disease/SkinCancer/tfjs_model',express.static(path.join(__dirname,"Disease","SkinCancer","tfjs_model")))
const skincancer_model_url = "https://mediscan-6ikc.onrender.com/Disease/SkinCancer/tfjs_model/model.json";

console.log(path.join(__dirname, "Disease", "EyeDisease", "tfjs_model"));
console.log(path.join(__dirname, "Disease", "heartdisease", "tfjs_model"));
console.log(path.join(__dirname, "Disease", "Diabetes", "tfjs_model"));
console.log(path.join(__dirname, "Disease", "SkinCancer", "tfjs_model"));
console.log(path.join(__dirname, "Vericose", "tfjs_model"));

let modelDiabetes =null
let modelHeartdisease = null
let modelEyedisease = null
let modelSkincancer = null

async function diabetes_Model_load() {
    try {
        modelDiabetes = await tf.loadLayersModel(Diabetes_model_url);
       console.log("Diabetes Model loaded!");
    } catch (error) {
    }
}


async function heartdisease_model_load(){
    try {
        modelHeartdisease = await tf.loadLayersModel(heartdisease_model_url);
       console.log("Heart Disease Model loaded!");
    } catch (error) {
        
    }
}

async function eyedisease_Model_load() {
    try {
        modelEyedisease = await tf.loadLayersModel(eyedisease_model_url);
       console.log("Eye Model loaded!");
    } catch (error) {
        console.log(error)
    }
}

async function skincancer_Model_load() {
    try {
        modelSkincancer = await tf.loadLayersModel(skincancer_model_url);
       console.log("skincancer Model loaded!");
    } catch (error) {
    }
}

diabetes_Model_load()

heartdisease_model_load()

eyedisease_Model_load()

skincancer_Model_load()


app.use('/api/admin',adminRouter)
app.use('/api/doctors',doctorRouter)
app.use('/api/user',userRouter)
app.use('/api/chat',router)

app.use((req, res, next) => {
  req.io = io; // Pass Socket.IO instance to all routes
  next();
});



io.on('connection', (socket) => {
    console.log('New client connected: ' + socket.id);

  
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on('error',(err)=>{
        console.log("Socket Error :",err)
    })

    
    socket.on('sendMessage', (messageData) => {
        console.log('Message sent to room:', messageData.room);
        console.log("message Data",messageData)
        try{
        io.to(messageData.room).emit('receive-message', {
            message: messageData.text, 
            senderRole: messageData.senderRole,
            timestamp: new Date().toISOString()
        });}
        catch(err){
            console.log("errror from server",err)
        }
    });

  
    socket.on("call-user", ({ room, offer, type }) => {
        // console.log(`Call initiated in room ${room}`);
        socket.to(room).emit("receive-call", { offer, type });
    });

 
    socket.on("call-accepted", ({ room, answer }) => {
        // console.log(`Call accepted in room ${room}`);
        socket.to(room).emit("call-answered", { answer });
    });

    socket.on("ice-candidate", ({ room, candidate }) => {
        // console.log(`ICE candidate received in room ${room}`);
        socket.to(room).emit("ice-candidate", { candidate });
    });


    socket.on("end-call", (room) => {
        // console.log(`Call ended in room ${room}`);
        socket.to(room).emit("call-ended");
    });

    // Handle client disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected: ' + socket.id);
    });
});











server.listen(port,()=>{
    console.log("Server Started at Port No",port)
})

export {vericoseModel,modelDiabetes,modelHeartdisease,modelEyedisease,modelSkincancer}