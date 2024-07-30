const mongoose = require("mongoose")

const connectDB= async()=>{
    try{
        const connection = await mongoose.connect(process.env.MONGODB_URI)
        console.log("mongoDB connected", connection.connection.host)
    }catch(error){
        console.log("Error", error.message)
        process.exit()
    }
}

module.exports=connectDB