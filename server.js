import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import eventsRouter from "./routes/events.js";
import userRouter from "./routes/users.js";

const app = express();
const PORT = process.env.PORT || 5050;

const corsOptions = {
  origin: "http://localhost:5173", 
  credentials: true, 
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser()); 
app.use("/api/events", eventsRouter);
app.use("/api/users", userRouter);

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port: http://localhost:${PORT}`);
});
