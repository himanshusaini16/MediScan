import mongoose from "mongoose";

const heartDiseasePredictionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userData: { type: Object, required: true },
  
  age: { type: Number, required: true },
  sex: { type: Number, required: true },        // 0 = Female, 1 = Male
  cp: { type: Number, required: true },          // Chest pain type
  trestbps: { type: Number, required: true },    // Resting blood pressure
  chol: { type: Number, required: true },        // Serum cholesterol
  fbs: { type: Number, required: true },         // Fasting blood sugar > 120 mg/dl
  restecg: { type: Number, required: true },     // Resting ECG results
  thalach: { type: Number, required: true },     // Max heart rate achieved
  exang: { type: Number, required: true },       // Exercise-induced angina
  oldpeak: { type: Number, required: true },     // ST depression
  slope: { type: Number, required: true },       // Slope of peak exercise ST segment
  ca: { type: Number, required: true },          // Number of major vessels colored by fluoroscopy
  thal: { type: Number, required: true },        // Thalassemia

  isNagative: { type: Boolean, default: false },
  isPositive: { type: Boolean, default: false },
  date: { type: Date, default: Date.now }
});

const heartDiseaseModel = mongoose.models.heartdisease || mongoose.model("heartdisease", heartDiseasePredictionSchema);

export default heartDiseaseModel;
