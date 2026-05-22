import express from 'express'
import cors from 'cors'
import dotenv from "dotenv"
import connectDB from './db.js'
import expenseRoutes from './routes/expenseRoutes.js'
import authRoutes from './routes/authRoutes.js'

dotenv.config()
const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json()) 
app.use("/expenses", expenseRoutes)
app.use("/auth", authRoutes)
app.use("/uploads", express.static("uploads"))

await connectDB()   

app.use((req, res, next) => {
  console.log("HEADERS:", req.headers);
  next();
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
