import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import realTimeDataController from "./controllers/TimerController.js";
import dotenv from "dotenv";
import path from 'path'
import router from "./routes/web.js";
import adminRouter from "./routes/admin.js";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";

dotenv.config();


// Get the current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000", // React app URL
    // origin: "https://xgame-frontend.vercel.app", // React app URL
    methods: ["GET", "POST"],
    credentials: true,
  })
);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // React app URL
    // origin: "https://xgame-frontend.vercel.app", // React app URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static("public"));


app.get("/", (req, res) => {
  res.json({ msg: "Welcome" });
});
app.get("/test", (req, res) => {
  res.json({ msg: "Testing" });
});
app.use("/api/user", router);
app.use("/admin", adminRouter);

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

realTimeDataController(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
