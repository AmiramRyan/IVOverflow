import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  nickname: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true } //SHA-512 string
});

export const User = model('User', userSchema);