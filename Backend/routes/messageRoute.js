import express from "express";
import messageModel from "../models/messageModel.js";
import authUser from "../middleware/authUser.js";
import authDoctor from "../middleware/authDoctor.js";
import upload from "../middleware/multer.js";
import { v2 as cloudinary } from "cloudinary";

const router = express.Router();

const allowUserOrDoctor = (req, res, next) => {
  authUser(req, res, (err) => {
    if (!err) return next();
    authDoctor(req, res, (err) => {
      if (!err) return next();
      return res
        .status(403)
        .json({ success: false, message: "Not Authorized" });
    });
  });
};

const validateMessage = ({ text, imageUrl, type }) => {
  const validTypes = ["text", "image", "audio", "video"];
  if (!validTypes.includes(type)) {
    return `Invalid message type: ${type}`;
  }
  if (type === "text" && !text) {
    return "Text message content is required";
  }
  if (type !== "text" && !imageUrl) {
    return `${type} message must include an imageUrl`;
  }
  return null;
};

router.post(
  "/sendMessage",
  authUser,
  upload.single("image"),
  async (req, res) => {
    try {
      const { room, text, type } = req.body;
      const senderId = req.body.userId;
      const senderRole = "user";

      const imageFile = req.file;
      let imageUrl = null;

      if (imageFile) {
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
          resource_type: "image",
        });
        imageUrl = imageUpload.secure_url;
      }

      const roomId = room;
      console.log(roomId);

      const validationError = validateMessage({ text, imageUrl, type });
      if (validationError) {
        return res
          .status(400)
          .json({ success: false, message: validationError });
      }

      const newMessage = new messageModel({
        room: roomId,
        senderId,
        senderRole,
        text,
        type,
        imageUrl,
      });
      // console.log(newMessage);

      await newMessage.save();
      res
        .status(200)
        .json({ success: true, message: "Message sent", data: newMessage });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

router.post(
  "/sendDoctorMessage",
  authDoctor,
  upload.single("image"),
  async (req, res) => {
    try {
      const { text, type, userId, docId } = req.body;

      const senderId = docId;
      const senderRole = "doctor";

      console.log(userId)

      let imageUrl = null;
      if (req.file) {
        try {
          const imageUpload = await cloudinary.uploader.upload(req.file.path, {
            resource_type: "image",
          });
          imageUrl = imageUpload.secure_url;
          console.log("Image uploaded to Cloudinary:", imageUrl);
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          return res
            .status(500)
            .json({ success: false, message: "Image upload failed" });
        }
      }

      if (!userId || !docId) {
        return res
          .status(400)
          .json({ success: false, message: "userId and docId are required." });
      }

      const room = userId

      console.log('room from senddoctorroute',room)

      const validationError = validateMessage({ text, imageUrl, type });
      if (validationError) {
        return res
          .status(400)
          .json({ success: false, message: validationError });
      }

      const newMessage = new messageModel({
        room,
        senderId,
        senderRole,
        text,
        type,
        imageUrl,
        timestamp: new Date(),
      });

      console.log('New message created:', newMessage);

      await newMessage.save();
      res
        .status(200)
        .json({ success: true, message: "Message sent", data: newMessage });
    } catch (error) {
      console.error('Error in sendDoctorMessage:', error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

router.get("/getMessages/:room", allowUserOrDoctor, async (req, res) => {
  try {
    const { room } = req.params;
    const { userId } = req.body;

    console.log(userId,room)

    const messages = await messageModel.find({ room }).sort({ createdAt: 1 });
    console.log(messages)
    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/getMessagesByDoctor/:room", authDoctor, async (req, res) => {
  try {
    const { room } = req.params;
    console.log("Request Body",req.params)
    console.log("body",req.body)

    const messages = await messageModel.find({ room }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
