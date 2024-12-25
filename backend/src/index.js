import express from 'express';
import dotenv from 'dotenv';
import authRoutes from "../routes/auth.route.js";
import messageRoutes from "../routes/message.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import {connectDB} from "../lib/db.js";
dotenv.config();
const app = express();


const PORT = process.env.PORT

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}))
// routes
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    connectDB();
})