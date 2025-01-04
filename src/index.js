import express from 'express';
import authRoutes from './route/auth.route.js'
import dotenv from 'dotenv';
import { connectDB } from './lib/db.js';
import cookieParser from 'cookie-parser';

dotenv.config();
const app = express();
const port = process.env.PORT || 5001
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);

app.listen(port, ()=>{
    
    console.log(`Server is listening on PORT: ${port}`);
    connectDB();
})