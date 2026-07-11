import { Schema, model } from 'mongoose';

const answerSchema = new Schema(
  {
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    upvotes: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    downvotes: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
  },
  { timestamps: true }
);

const questionSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    tags: [{ type: String }],
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    answers: [answerSchema],
  },
  { timestamps: true } 
);

export const Question = model('Question', questionSchema);