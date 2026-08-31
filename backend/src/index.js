import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import express from "express"
import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"
import dotenv from "dotenv"
import { connectDB } from "./lib/db.js"
import cookieParser from "cookie-parser";
import cors from "cors";
import {app, server} from "./lib/socket.js"

dotenv.config();

const PORT = process.env.PORT || 5001;

const allowedOrigins = [
  "https://encrypta-self.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : [])
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

app.get("/", (req, res) => {
    res.json({ status: "ok", message: "server is up" });
});

server.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
    connectDB();
});