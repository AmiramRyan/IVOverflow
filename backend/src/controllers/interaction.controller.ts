import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Question } from '../models/question.model';

interface VoteRequestBody {
  questionId: string;
  answerId: string;
  voteType: 'up' | 'down';
}

export const createAnswer = async (req: Request, res: Response) => {
  try {
    const { questionId, content } = req.body;
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized. Please log in to post an answer." });
    }
    
    const userId = user.id || user._id;
    if (!userId) {
      return res.status(401).json({ error: "User profile payload missing identity key." });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Answer content cannot be empty." });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ error: "Question not found." });
    }
    
    const newAnswer = {
      content,
      author: new Types.ObjectId(userId),
      upvotes: [],
      downvotes: [],
    };

    question.answers.push(newAnswer);
    await question.save();
    
    const updatedQuestion = await Question.findById(questionId).populate('answers.author', 'nickname fullName');
    const savedAnswer = updatedQuestion?.answers[updatedQuestion.answers.length - 1];

    return res.status(201).json(savedAnswer);
  } catch (error) {
    console.error("Create answer runtime error:", error);
    return res.status(500).json({ error: "Failed to create answer." });
  }
};

export const getAnswersForQuestion = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;

    const question = await Question.findById(questionId).populate('answers.author', 'nickname fullName');
    if (!question) {
      return res.status(404).json({ error: "Question not found." });
    }

    return res.json(question.answers);
  } catch (error) {
    console.error("Get answers runtime error:", error);
    return res.status(500).json({ error: "Failed to fetch answers." });
  }
};

export const voteAnswer = async (
  req: Request<{}, {}, VoteRequestBody>, 
  res: Response
) => {
  try {
    const { questionId, answerId, voteType } = req.body;
    
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized. Please log in to vote." });
    }
    
    const userId = user._id || user.id;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    const answer = (question.answers as any).id(answerId);
    if (!answer) {
      return res.status(404).json({ error: "Answer not found" });
    }

    const upVotesStrings = (answer.upvotes || []).map((id: any) => id.toString());
    const downVotesStrings = (answer.downvotes || []).map((id: any) => id.toString());
    const targetUserIdStr = userId.toString();

    if (voteType === 'up') {
      if (upVotesStrings.includes(targetUserIdStr)) {
        answer.upvotes = answer.upvotes.filter((id: any) => id.toString() !== targetUserIdStr);
      } else {
        answer.upvotes.push(userId);
        answer.downvotes = answer.downvotes.filter((id: any) => id.toString() !== targetUserIdStr);
      }
    } else if (voteType === 'down') {
      if (downVotesStrings.includes(targetUserIdStr)) {
        answer.downvotes = answer.downvotes.filter((id: any) => id.toString() !== targetUserIdStr);
      } else {
        answer.downvotes.push(userId);
        answer.upvotes = answer.upvotes.filter((id: any) => id.toString() !== targetUserIdStr);
      }
    }

    question.markModified('answers');
    await question.save();

    const upvotes = answer.upvotes.map((id: Types.ObjectId) => id.toString());
    const downvotes = answer.downvotes.map((id: Types.ObjectId) => id.toString());

    return res.json({
      answerId: answer._id,
      upvotes,
      downvotes,
      upvotesCount: upvotes.length,
      downvotesCount: downvotes.length,
      netScore: upvotes.length - downvotes.length,
    });
  } catch (error) {
    console.error("Voting controller runtime error:", error);
    return res.status(500).json({ error: "Voting save transaction failed." });
  }
};

export const getVotes = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized. Please log in to view votes." });
    }

    const userId = (user.id || user._id)?.toString();
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ error: "Question not found." });
    }

    const votes = question.answers.map((answer: any) => {
      const upvotes = (answer.upvotes || []).map((id: Types.ObjectId) => id.toString());
      const downvotes = (answer.downvotes || []).map((id: Types.ObjectId) => id.toString());
      let userVote: 'up' | 'down' | null = null;
      if (userId) {
        if (upvotes.includes(userId)) userVote = 'up';
        else if (downvotes.includes(userId)) userVote = 'down';
      }

      return {
        answerId: answer._id,
        upvotes,
        downvotes,
        upvotesCount: upvotes.length,
        downvotesCount: downvotes.length,
        netScore: upvotes.length - downvotes.length,
        userVote,
      };
    });

    return res.json(votes);
  } catch (error) {
    console.error("Get votes runtime error:", error);
    return res.status(500).json({ error: "Failed to fetch votes." });
  }
};