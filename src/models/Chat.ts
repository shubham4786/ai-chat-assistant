import { Schema, model, models } from 'mongoose';

const ChatSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    default: 'New Chat',
  },
}, { timestamps: true });

const Chat = models.Chat || model('Chat', ChatSchema);

export default Chat;
