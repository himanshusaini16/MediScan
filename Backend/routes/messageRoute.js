import express from "express";
import messageModel from "../models/messageModel.js";
import authUser from "../middleware/authUser.js";
import authDoctor from "../middleware/authDoctor.js";
import upload from "../middleware/multer.js";
import { v2 as cloudinary } from "cloudinary";

const router = express.Router();

// Allow both user and doctor access
const allowUserOrDoctor = (req, res, next) => {
  authUser(req, res, (err) => {
    if (!err) return next();
    authDoctor(req, res, (err) => {
      if (!err) return next();
      return res.status(403).json({ success: false, message: "Not Authorized" });
    });
  });
};

// Validate message structure
const validateMessage = ({ text, imageUrl, type }) => {
  const validTypes = ["text", "image", "audio", "video"];
  if (!validTypes.includes(type)) {
    return `Invalid message type: ${type}`;
  }
  if (type === "text" && !text) {
    return "Text message content is required";
  }
  if (type !== "text" && !imageUrl) {
    return `${type} message must include a media file`;
  }
  return null;
};

// Helper to upload media to Cloudinary
const uploadMediaToCloudinary = async (filePath, type) => {
  const resourceType = type === "audio" || type === "video" ? "video" : "image";
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: resourceType,
  });
  return result.secure_url;
};

// Helper to create and emit message
const createAndEmitMessage = async ({
  room,
  senderId,
  senderRole,
  text,
  type,
  imageUrl,
  io,
}) => {
  const newMessage = new messageModel({
    room,
    senderId,
    senderRole,
    text,
    type,
    imageUrl,
  });

  await newMessage.save();

  if (io) {
    io.to(room).emit("receive-message", {
      ...newMessage.toObject(),
    });
  }

  return newMessage;
};

// POST /sendMessage (User)
router.post("/sendMessage", authUser, upload.single("image"), async (req, res) => {
  try {
    const { room, text, type } = req.body;
    const senderId = req.body.userId;
    const senderRole = "user";
    const io = req.io;

    let imageUrl = null;

    if (req.file) {
      imageUrl = await uploadMediaToCloudinary(req.file.path, type);
    }

    const validationError = validateMessage({ text, imageUrl, type });
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const newMessage = await createAndEmitMessage({
      room,
      senderId,
      senderRole,
      text,
      type,
      imageUrl,
      io,
    });

    res.status(200).json({ success: true, message: "Message sent", data: newMessage });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /sendDoctorMessage
router.post(
  "/sendDoctorMessage",
  authDoctor,
  upload.single("image"),
  async (req, res) => {
    try {
      const { text, type, userId, docId } = req.body;
      const senderId = docId;
      const senderRole = "doctor";
      const io = req.io;

      if (!userId || !docId) {
        return res.status(400).json({
          success: false,
          message: "userId and docId are required.",
        });
      }

      // Room format: sorted(userId, docId)
      const room = [userId, docId].sort().join("_");

      let imageUrl = null;
      if (req.file) {
        imageUrl = await uploadMediaToCloudinary(req.file.path, type);
      }

      const validationError = validateMessage({ text, imageUrl, type });
      if (validationError) {
        return res.status(400).json({ success: false, message: validationError });
      }

      const newMessage = await createAndEmitMessage({
        room,
        senderId,
        senderRole,
        text,
        type,
        imageUrl,
        io,
      });

      res.status(200).json({ success: true, message: "Message sent", data: newMessage });
    } catch (error) {
      console.error("Error in sendDoctorMessage:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
);

// GET /getMessages/:room
router.get("/getMessages/:room", allowUserOrDoctor, async (req, res) => {
  try {
    const { room } = req.params;
    console.log(room)
    const messages = await messageModel.find({ room }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("Error in getMessages:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /getMessagesByDoctor/:room
router.get("/getMessagesByDoctor/:room", authDoctor, async (req, res) => {
  try {
    const { room } = req.params;
    console.log(room)
    const messages = await messageModel.find({ room }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("Error in getMessagesByDoctor:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
