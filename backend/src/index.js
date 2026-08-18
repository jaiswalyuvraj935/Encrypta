import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import express from "express"
import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"
import dotenv from "dotenv"
import { connectDB } from "./lib/db.js"
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

app.get("/health", (req, res) => {
    res.json({ status: "ok", message: "server is up" });
});

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
    connectDB();
});