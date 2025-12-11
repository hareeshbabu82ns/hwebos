import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const User = model('User', userSchema);
