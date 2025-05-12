import mongoose from "mongoose";

const eyediseaseSchema = new mongoose.Schema(
  {
    userId : { type :String , required : true},
    image: { type: String,required:true},
    userData : {type : Object , required : true},
    gender : {type:String,default:"Not Selected"},
    phone:{type:String,default:"0000000000"},
    age:{type:Number},
    isNagative : {type:Boolean,default:false},
    isPositive : { type : Boolean, default : false},
    date: {type:Date}

  }
);


const eyediseaseModel =
  mongoose.models.eyeDisease || mongoose.model("eyeDisease", eyediseaseSchema);

export default eyediseaseModel