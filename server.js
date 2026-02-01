import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import eventsRouter from "./routes/events.js";
import userRouter from "./routes/users.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

app.set("trust proxy", 1);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://fwab-again.vercel.app",
  "http://localhost:5173",
].filter(Boolean);

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(cookieParser());
app.use("/api/events", eventsRouter);
app.use("/api/users", userRouter);

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port: http://localhost:${PORT}`);
});
