import mongoose from "mongoose";


// const mongourl="mongodb://127.0.0.1:27017/prescripto";

const connectDB =async () =>{
    mongoose.connection.on('connected',() => {
        console.log("Database Connected")
    })
await mongoose.connect(`${process.env.MONGODB_URL}/mediscan`)
// await mongoose.connect(mongourl)
}
export default connectDB