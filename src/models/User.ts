import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: [true, 'Email is required'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please fill a valid email address',
    ],
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  image: {
    type: String,
  },
  // We will add chats array later
  // chats: [
  //   {
  //     type: Schema.Types.ObjectId,
  //     ref: 'Chat',
  //   },
  // ],
}, { timestamps: true });

const User = models.User || model('User', UserSchema);

export default User;
