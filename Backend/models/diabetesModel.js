import mongoose from "mongoose";


const diabetesPredictionSchema = new mongoose.Schema({

  userId : { type :String , required : true},
  userData : {type : Object , required : true},
  gender :{type : String},
  Pregnancies: { type: Number, required: true },
  Glucose: { type: Number, required: true },
  BloodPressure: { type: Number, required: true },
  SkinThickness: { type: Number, required: true },
  Insulin: { type: Number, required: true },
  BMI: { type: Number, required: true },
  DiabetesPedigreeFunction: { type: Number, required: true },
  Age: { type: Number, required: true },
  isNagative : {type:Boolean,default:false},
  isPositive : { type : Boolean, default : false},
  date: { type: Date, default: Date.now }
});

const diabetesModel = mongoose.models.diabetes || mongoose.model("diabetes", diabetesPredictionSchema);

export default diabetesModel;