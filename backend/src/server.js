import express from "express"
import cookieParser from "cookie-parser";
import dotenv from "dotenv"
import cors from "cors"
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import connectMongo from "./libs/connectMongoDb.js"
import { connectRedis } from "./libs/connectRedisDb.js"

import authRoute from "./routes/authRoutes.js"
import userRoute from "./routes/userRoute.js"
import friendRoute from "./routes/friendRoute.js"
import messageRoute from "./routes/messageRoutes.js"
import conversationRoute from "./routes/conversationRoute.js"
import notificationRoute from "./routes/notificationRoute.js"
import otpRoute from "./routes/otpRoutes.js"

import { protectedRoute } from "./middlewares/authMiddleware.js"
import { app, server } from "./socket/index.js"

dotenv.config()

const PORT = process.env.PORT || 5001

//middlewares
app.use(express.json())
app.use(cookieParser())
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// CLOUDINARY Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// swagger
const swaggerDocument = JSON.parse(fs.readFileSync("./src/swagger.json", "utf8"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//public route
app.use("/api/auth", authRoute)
app.use("/api/otp", otpRoute)

//private route
app.use(protectedRoute)
app.use("/api/users", userRoute)
app.use("/api/friends", friendRoute);
app.use("/api/messages", messageRoute);
app.use("/api/conversations", conversationRoute);
app.use("/api/notifications", notificationRoute);

(async () => {
    try {
        await Promise.all([
            connectRedis(),
            connectMongo()
        ]);

        server.listen(PORT, () => {
            console.log(`server started at port ${PORT}`);
        });
    } catch (err) {
        console.error("Lỗi khi khởi động ứng dụng:", err);
        process.exit(1);
    }
})();


