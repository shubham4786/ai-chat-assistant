import { Schema, model, models } from 'mongoose';

const MessageSchema = new Schema({
  chat: {
    type: Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  }
}, { timestamps: true });

const Message = models.Message || model('Message', MessageSchema);

export default Message;
