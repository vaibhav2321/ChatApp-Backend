import express from 'express';
import authRoutes from './route/auth.route.js'
import messageRoutes from './route/message.route.js'
import dotenv from 'dotenv';
import { connectDB } from './lib/db.js';
import cookieParser from 'cookie-parser';
import cors from "cors";

dotenv.config();
const app = express();
const port = process.env.PORT || 5001
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

app.listen(port, ()=>{
    
    console.log(`Server is listening on PORT: ${port}`);
    connectDB();
})