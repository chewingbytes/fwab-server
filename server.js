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
  "https://fwab-again.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use("/api/events", eventsRouter);
app.use("/api/users", userRouter);

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port: http://localhost:${PORT}`);
});
