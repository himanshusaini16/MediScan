import userModel from '../models/userModel.js'
import validator from 'validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {v2 as cloudinary} from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'

import tf from '@tensorflow/tfjs'
import { modelDiabetes, modelEyedisease, modelHeartdisease, modelSkincancer} from '../server.js'
import {Image} from 'image-js'
import fs, { truncate } from 'fs'
import diabetesModel from '../models/diabetesModel.js'
import heartDiseaseModel from '../models/heartDiseaseModel.js'
import eyediseaseModel from '../models/eyediseaseModel.js'
import skinCancerModel from '../models/skincancer.js'



const waitForDModel = async () => {
    while (!modelDiabetes) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
};

const waitHeartModelLoad =async () =>{
    while(!modelHeartdisease){
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
}

// diabetes api

function preprocessInput(input) {
    const mean = [3.8, 120, 69, 20, 80, 31.99, 0.47, 33];
    const std = [3.4, 30, 19, 15, 115, 7.88, 0.33, 12];

    return input.map((value, index) => (value - mean[index]) / std[index]);
}


const diabetesPredict = async(req,res) =>{

    await waitForDModel()
    try {
        
    
    const {userId,Pregnancies,Glucose,BloodPressure,SkinThickness,Insulin,BMI,DiabetesPedigreeFunction,Age,gender} = req.body
    const userData = await userModel.findById(userId).select('-password')

    console.log(userData)

    const diabetesData = {
        userId,
        userData,
        gender,
        Pregnancies,
        Glucose,
        BloodPressure,
        SkinThickness,
        Insulin,
        BMI,
        DiabetesPedigreeFunction,
        Age,
        date : Date.now()
    }

    const newDiabtesData = new diabetesModel(diabetesData)

    await newDiabtesData.save()

    const inputTensor = tf.tensor2d([preprocessInput([
        Pregnancies, Glucose, BloodPressure, SkinThickness, Insulin, BMI, DiabetesPedigreeFunction, Age
    ])]);

        const prediction = modelDiabetes.predict(inputTensor);
        const score =  await prediction.dataSync()[0];

        const isDiabetesDetected =score  > 0.5

        if(isDiabetesDetected){
            await diabetesModel.findByIdAndUpdate(newDiabtesData._id,{isPositive:true})
        }

        res.json({ 
            success :isDiabetesDetected,
            prediction: score.toFixed(5),
            message: isDiabetesDetected ? "Diabetes Disease Detected" : "No Diabetes Disease",
            confidence: `${(score * 100).toFixed(2)}%`
        });


    }catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}


// api for heart Disease
// Configuration matching Python training
const featureColumns = [
    "age", "trestbps", "chol", "thalach", "oldpeak",
    "sex_0", "sex_1", "cp_0", "cp_1", "cp_2", "cp_3",
    "fbs_0", "fbs_1", "restecg_0", "restecg_1", "restecg_2",
    "exang_0", "exang_1", "slope_0", "slope_1", "slope_2",
    "ca_0.0", "ca_1.0", "ca_2.0", "ca_3.0", "ca_4.0",
    "thal_0.0", "thal_1.0", "thal_2.0", "thal_3.0"
];

const scalerParams = JSON.parse(fs.readFileSync('Disease/heartdisease/scaler_params.json'));

function validateScaler() {
    const numericals = ['age', 'trestbps', 'chol', 'thalach', 'oldpeak'];
   
    if (Array.isArray(scalerParams.mean)) {
        scalerParams.mean = {
            age: scalerParams.mean[0],
            trestbps: scalerParams.mean[1],
            chol: scalerParams.mean[2],
            thalach: scalerParams.mean[3],
            oldpeak: scalerParams.mean[4]
        };
    }
    
    if (Array.isArray(scalerParams.std)) {
        scalerParams.std = {
            age: scalerParams.std[0],
            trestbps: scalerParams.std[1],
            chol: scalerParams.std[2],
            thalach: scalerParams.std[3],
            oldpeak: scalerParams.std[4]
        };
    }

    numericals.forEach(col => {
        if (typeof scalerParams.mean[col] !== 'number' || 
            typeof scalerParams.std[col] !== 'number') {
            throw new Error(`Invalid scaler params for ${col}`);
        }
    });
}
validateScaler();



function preprocessInputHeart(input) {
    console.log('Raw input:', JSON.stringify(input, null, 2));

    const features = Object.fromEntries(
        featureColumns.map(col => [col, 0])
    );

  
    const numericals = ['age', 'trestbps', 'chol', 'thalach', 'oldpeak'];
    numericals.forEach(col => {
        const rawValue = input[col];
        const mean = scalerParams.mean[col];
        const std = scalerParams.std[col];

       
        if (typeof rawValue !== 'number' || isNaN(rawValue)) {
            throw new Error(`Invalid ${col}: ${rawValue}`);
        }

       
        if (std === 0) {
            features[col] = 0;
        } else {
            const scaled = (rawValue - mean) / std;
            features[col] = Number.isFinite(scaled) ? scaled : 0;
        }

    });

    const categoricalMap = {
        sex: [0, 1],
        cp: [0, 1, 2, 3],
        fbs: [0, 1],
        restecg: [0, 1, 2],
        exang: [0, 1],
        slope: [0, 1, 2],
        ca: [0.0, 1.0, 2.0, 3.0, 4.0],
        thal: [0.0, 1.0, 2.0, 3.0]
    };

    Object.entries(categoricalMap).forEach(([field, values]) => {
        const inputVal = parseFloat(input[field]);
        if (isNaN(inputVal)) {
            throw new Error(`Invalid ${field}: ${input[field]}`);
        }

        values.forEach(value => {
            const colName = `${field}_${value.toFixed(1)}`;
            if (features.hasOwnProperty(colName)) {
                features[colName] = Math.abs(inputVal - value) < 0.001 ? 1 : 0;
            }
        });
    });
    const inputArray = featureColumns.map(col => {
        const val = features[col];
        if (isNaN(val)) {
            throw new Error(`NaN detected in ${col}`);
        }
        return val;
    });

    const tensor = tf.tensor2d([inputArray], [1, 30]);

    if (tensor.isNaN().any().dataSync()[0]) {
        tensor.dispose();
        throw new Error('NaN values in tensor');
    }

    return tensor;
}



const heartdiseasePredict = async(req,res)=>{
    await waitHeartModelLoad()
    try {
        const {userId,age,sex,cp,trestbps,chol, fbs,restecg,thalach,exang,oldpeak,slope,ca,thal} = req.body
        const userData = await userModel.findById(userId).select('-password')

        // console.log(userData)
        const heartDiseaseData = {
            userId,
            userData,
            sex,
            age,
            cp,
            trestbps,
            chol,
            fbs,
            restecg,
            thalach,
            exang,
            oldpeak,
            slope,
            ca,
            thal,
            date : Date.now()
        }

        // console.log(heartDiseaseData)

        const newHeartDiseasedata = new heartDiseaseModel(heartDiseaseData)
        await newHeartDiseasedata.save()

        const rawInput={sex,age,cp,trestbps,chol,fbs,restecg,thalach,exang,oldpeak,slope,ca,thal}

        const tensor = preprocessInputHeart(rawInput);
        // console.log(tensor)
        const prediction = modelHeartdisease.predict(tensor)
        // console.log(prediction)
        const score = (await prediction.data())[0];
        console.log(score)
        tensor.dispose();
        prediction.dispose();

        const isHeartDisease = score < 0.5

        

        if(isHeartDisease){
            await heartDiseaseModel.findByIdAndUpdate(newHeartDiseasedata._id,{isPositive:true})
        }
 
        res.json({ 
            success :isHeartDisease,
            prediction: score.toFixed(5),
            message: isHeartDisease ? "Heart Disease Detected" : "No Heart Disease",
            confidence: `${(Math.abs(score - 0.5) * 200).toFixed(2)}%`
        });

        
    } catch (error) {
        console.error("Prediction error:", error);
        res.status(400).json({
            error: "Prediction failed",
            details: error.message,
            suggestion: "Please verify all input fields are numbers in the correct range"})
    }

}

// eye Disease Api

const waitForEyeModel = async () => {
    while (!modelEyedisease) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
};

async function processImage(imagePath) {
    const image = await Image.load(imagePath);

    let tensor = tf.browser.fromPixels(image)
        .resizeBilinear([64, 64]) 
        .toFloat()
        .div(tf.scalar(255))
        .expandDims();

    return tensor;
}




const eyediseasePredict = async (req,res) =>{

    await waitForEyeModel()

    if (!req.file) {
        return res.status(400).json({ error: "No image uploaded" });
    }

    try{
    const {userId,age,gender} = req.body
    const imageFile = req.file
    
    const userData = await userModel.findById(userId).select('-password')

    console.log(userData)
    console.log(userId)


    const imageUpload = await cloudinary.uploader.upload(imageFile.path,{resource_type:"image"})
    const imageUrl = imageUpload.secure_url
    console.log(imageUrl)



    const eyeDiseaseData = {
        userId,
        userData,
        age,
        image : imageUrl,
        gender,
        phone : userData.phone,
        date : Date.now()
    }

    const newEyeDiseaseData = new eyediseaseModel(eyeDiseaseData)

    await newEyeDiseaseData.save()


        const imagePath = req.file.path;
        const tensor = await processImage(imagePath);
        const prediction = modelEyedisease.predict(tensor);
        const score = (await prediction.data())[0];

        fs.unlinkSync(imagePath);
        tensor.dispose();
        prediction.dispose();

        const isEyeDiseaseDetected = score > 0.5
        console.log(isEyeDiseaseDetected)

        if(isEyeDiseaseDetected){
            await eyediseaseModel.findByIdAndUpdate(newEyeDiseaseData._id,{isPositive:true})
        }

        res.json({ 
            success :isEyeDiseaseDetected,
            prediction: score.toFixed(5),
            message: isEyeDiseaseDetected ? "Eye Disease Detected" : "No Eye Disease Detected",
            confidence: `${(score * 100).toFixed(2)}%`
        });

    
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}


// api for skincancer

const waitForSkinModel = async () => {
    while (!modelSkincancer) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
};

const classIndices = {
    0: 'benign',
    1: 'malignant',
    2: 'normal'
  };
  

  const skincancerPredict = async (req,res) =>{

    await waitForSkinModel();

    if (!req.file) {
        return res.status(400).json({ error: "No image uploaded" });
    }

    try{
    const {userId,age,gender} = req.body
    const imageFile = req.file
    
    const userData = await userModel.findById(userId).select('-password')

    // console.log(userData)


    const imageUpload = await cloudinary.uploader.upload(imageFile.path,{resource_type:"image"})
    const imageUrl = imageUpload.secure_url
    // console.log(imageUrl)



    const skincancerData = {
        userId,
        userData,
        age,
        image : imageUrl,
        phone:userData.phone,
        gender,
        date : Date.now()
    }

    const newSkincancerData = new skinCancerModel(skincancerData)

    await newSkincancerData.save()


    const imagePath = req.file.path;
    const tensor = await processImage(imagePath);
    const prediction = modelSkincancer.predict(tensor);
    const predictionData = await prediction.data();  // Get Float32Array
    const scores = Array.from(predictionData); 

    
    // console.log(scores)      // Convert to regular array
    
    // Get predicted class and confidence
    const maxIndex = scores.indexOf(Math.max(...scores));

    // console.log(maxIndex)
    const confidence = scores[maxIndex];
    // console.log(confidence)
    const predictedClass = classIndices[maxIndex];
    // console.log(predictedClass)

    const isSkincancer = (maxIndex === 0 || maxIndex ===1)

    console.log(isSkincancer)

    if(isSkincancer){
        await skinCancerModel.findByIdAndUpdate(newSkincancerData._id,{isPositive:true})
    }
    

    // Cleanup
    fs.unlinkSync(imagePath);
    tensor.dispose();
    prediction.dispose();

    res.json({
        success:isSkincancer, 
        predictedClass: predictedClass,
        confidence: `${(confidence * 100).toFixed(2)}%`,
        scores: scores.map(score => score.toFixed(5)),
        message : isSkincancer ? "Skin Cancer Deteced" : "No Disease"  // Optional: all class probabilities
    });

    
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export {diabetesPredict,heartdiseasePredict,eyediseasePredict,skincancerPredict}