import mongoose from 'mongoose';

// Define the Message schema
const messageSchema = new mongoose.Schema(
  {
    room: { 
      type: String, 
      required: true 
    },
    senderId: { type:String,
      required: true 
    },
    senderRole: { 
      type: String, 
      enum: ['user', 'doctor'], // Define valid roles
      required: true 
    },
    text: { 
      type: String, 
      required: function() { return this.type === 'text'; }
    },
    imageUrl: { 
      type: String, 
      required: false 
    },
    type: { 
      type: String, 
      enum: ['text', 'image', 'audio', 'video'],  // Define types of messages
      required: true 
    }
  },
  { timestamps: true } // This will add createdAt and updatedAt fields
);

// Check if the model already exists, if not, create it
const messageModel =
  mongoose.models.Message || mongoose.model("Message", messageSchema);

export default messageModel;
