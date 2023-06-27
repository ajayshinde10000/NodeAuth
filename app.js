import dotenv from 'dotenv'
dotenv.config();

import express from 'express'
import cors from 'cors'
import connectdb from './config/connectdb.js'
import userRoutes from './roots/userRoutes.js'

const app = express();
const port = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL

app.use(cors());

//Connection To DataBase
connectdb(DATABASE_URL);

app.use(express.json());

app.use("/api/user",userRoutes);

app.listen(port,()=>{
    console.log(`Server Listening on http://localhost:${port}`)
})