import mongoose from "mongoose";

const skinCancerSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    image: { type: String, required: true },
    userData: { type: Object, required: true },
    gender: { type: String, default: "Not Selected" },
    age: { type: Number },
    isNagative: { type: Boolean, default: false },
    isPositive: { type: Boolean, default: false },
    date: { type: Date },
  }
);

const skinCancerModel =
  mongoose.models.skincancer || mongoose.model("skincancer", skinCancerSchema);

export default skinCancerModel;
