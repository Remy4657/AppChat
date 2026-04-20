import express from "express"
import cookieParser from "cookie-parser";
import dotenv from "dotenv"
import cors from "cors"

import connectDB from "./libs/db.js"
import authRoute from "./routes/authRoutes.js"
import userRoute from "./routes/userRoute.js"
import friendRoute from "./routes/friendRoute.js"
import { protectedRoute } from "./middlewares/authMiddleware.js"


dotenv.config()

const app = express()
const PORT = process.env.PORT || 5001

//middlewares
app.use(express.json())
app.use(cookieParser())
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

//public route
app.use("/api/auth", authRoute)

//private route
app.use(protectedRoute)
app.use("/api/users", userRoute)
app.use("/api/friends", friendRoute);

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`server started at port ${PORT}`)
    })
})
