import express from "express"
import cookieParser from "cookie-parser";
import dotenv from "dotenv"
import cors from "cors"
import swaggerUi from "swagger-ui-express";
import fs from "fs";

import connectDB from "./libs/db.js"
import authRoute from "./routes/authRoutes.js"
import userRoute from "./routes/userRoute.js"
import friendRoute from "./routes/friendRoute.js"
import messageRoute from "./routes/messageRoutes.js"
import conversationRoute from "./routes/conversationRoute.js"

import { protectedRoute } from "./middlewares/authMiddleware.js"
import { app, server } from "./socket/index.js"

dotenv.config()

const PORT = process.env.PORT || 5001

//middlewares
app.use(express.json())
app.use(cookieParser())
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// swagger
const swaggerDocument = JSON.parse(fs.readFileSync("./src/swagger.json", "utf8"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//public route
app.use("/api/auth", authRoute)

//private route
app.use(protectedRoute)
app.use("/api/users", userRoute)
app.use("/api/friends", friendRoute);
app.use("/api/messages", messageRoute);
app.use("/api/conversations", conversationRoute);

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`server started at port ${PORT}`)
    })
})
