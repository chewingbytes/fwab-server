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

app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use("/api/events", eventsRouter);
app.use("/api/users", userRouter);

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port: http://localhost:${PORT}`);
});
