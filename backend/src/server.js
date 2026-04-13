import express from "express"
import dotenv from "dotenv"
import cors from "cors"

import connectDB from "./libs/db.js"
import authRoute from "./routes/authRoutes.js"
import userRoute from "./routes/userRoute.js"
import { protectedRoute } from "./middlewares/authMiddleware.js"


dotenv.config()
console.log(process.env.MONGO_URI);

const app = express()
const PORT = process.env.PORT || 5001

//middlewares
app.use(express.json())
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
//public route
app.use("/api/auth", authRoute)

//private route
app.use(protectedRoute)
app.use("/api/users", userRoute)

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`server started at port ${PORT}`)
    })
})
