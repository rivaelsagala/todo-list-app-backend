import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import todoRoutes from "./routes/todoRoutes";

import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/todos", todoRoutes);
app.use("/api/auth", authRoutes);

export default app;
