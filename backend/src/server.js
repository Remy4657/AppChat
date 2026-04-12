import express from "express"
import dotenv from "dotenv"

import connectDB from "./libs/db.js"
import authRoute from "./routes/authRoutes.js"

dotenv.config()
console.log(process.env.MONGO_URI);

const app = express()
const PORT = process.env.PORT || 5001

//middlewares
app.use(express.json())

//public route
app.use("/api/auth", authRoute)

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`server started at port ${PORT}`)
    })
})
