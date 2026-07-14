import mongoose from 'mongoose'

const connectDB = async()=>{
    try {
        if (!process.env.MONGO_URI) {
            console.error("Error: MONGO_URI is undefined. Please ensure you have a .env file in the backend directory with MONGO_URI set.");
            process.exit(1);
        }
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log ("Mongo DB connected")
    }catch(error){
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

export default connectDB ;