import { Request, Response } from 'express';
import { Question } from '../models/question.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export async function createQuestion(req: AuthenticatedRequest, res: Response) {
  const { title, description, tags } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required.' });
  }

  try {
    const newQuestion = new Question({
      title,
      description,
      tags: tags || [],
      author: req.user?.id
    });

    const savedQuestion = await newQuestion.save();
    return res.status(201).json(savedQuestion);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

export async function getAllQuestions(req: Request, res: Response) {
  try {
    const questions = await Question.find()
      .populate('author', 'nickname fullName')
      .sort({ createdAt: -1 });
    return res.json(questions);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

export async function getQuestionById(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const question = await Question.findById(id)
      .populate('author', 'nickname fullName')
      .populate('answers.author', 'nickname fullName');
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found.' });
    }
    return res.json(question);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error.' });
  }
}