import mongoose from "mongoose";
import { OpenLocationCode } from 'open-location-code';

const DbCon=async()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URL)
        console.log('MongoDB is connected')
    }catch (error){
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}

export  default DbCon
