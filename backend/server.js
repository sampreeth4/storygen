import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
// import Story from './models/Story.js';
import storyRoutes from './routes/storyRoutes.js';
dotenv.config();
// console.log("Using OpenAI Key:", process.env.NEBIUS_API_KEY);
console.log("Using Nebius key:", process.env.NEBIUS_API_KEY ? "SET" : "NOT SET");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error" ,err));


app.get("/", (req, res) => {
    res.send("API is running...");
});
 // Health check endpoint for Kubernetes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});
app.use("/api", storyRoutes)
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));