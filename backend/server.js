import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import DbCon from './utils/db.js'
import AuthRoutes from './routes/Auth.js'
import AdminRoutes from './routes/AdminRoutes.js'
import serviceProviderRoutes from './routes/serviceProviderRoutes.js';
dotenv.config()

const PORT=process.env.PORT || 3000
const app=express()

// mongo db
DbCon()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    credentials: true, 
    origin: ["http://localhost:5173", "http://localhost:5174"]
}));


app.use('/api/auth',AuthRoutes)
app.use('/api/admin',AdminRoutes)
app.use('/api/serviceProvider', serviceProviderRoutes);

app.get('/', (req, res)=>{
    res.send('test')
})


app.listen(PORT,()=>{
    console.log(`server is running on ${PORT}`)
})