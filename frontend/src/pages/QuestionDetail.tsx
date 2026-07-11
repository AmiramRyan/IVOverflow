import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';
import {
  useGetQuestionByIdQuery,
  useVoteAnswerMutation,
  useCreateAnswerMutation,
  useGetVotesQuery,
} from '../features/api/apiSlice';
import ContentRenderer from '../components/ContentRenderer';
import styles from '../css/QuestionDetail.module.css';

export default function QuestionDetail() {
  const { id: questionId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [newAnswerContent, setNewAnswerContent] = useState('');

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const currentUserId = currentUser?._id || currentUser?.id;

  const { data: question, isLoading, error } = useGetQuestionByIdQuery(questionId || '');
  const { data: votesData } = useGetVotesQuery(questionId || '', { skip: !questionId });
  const [voteAnswer, { isLoading: isVoting }] = useVoteAnswerMutation();
  const [createAnswer, { isLoading: isSubmittingAnswer }] = useCreateAnswerMutation();

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Loading question details...</p>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
          <p>Could not load question. It might have been deleted or moved.</p>
          <button className={styles.errorBtn} onClick={() => navigate('/')}>Return Home</button>
        </div>
      </div>
    );
  }

  const handleVote = async (answerId: string, voteType: 'up' | 'down') => {
    if (isVoting || !questionId) return;
    try {
      await voteAnswer({ questionId, answerId, voteType }).unwrap();
    } catch (err) {
      console.error('Failed to register vote:', err);
    }
  };

  const handleCreateAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswerContent.trim() || isSubmittingAnswer || !questionId) return;

    try {
      await createAnswer({
        questionId,
        content: newAnswerContent,
      }).unwrap();
      setNewAnswerContent('');
    } catch (err) {
      console.error('Failed to post answer:', err);
    }
  };

  const getVoteState = (answerId: string) => {
    const voteEntry = votesData?.find((v) => v.answerId === answerId);
    if (voteEntry) {
      return {
        hasUpvoted: voteEntry.userVote === 'up',
        hasDownvoted: voteEntry.userVote === 'down',
        netVotes: voteEntry.netScore,
      };
    }

    const answer = question.answers?.find((a) => a._id === answerId);
    const upVotesArray = answer?.upvotes || [];
    const downVotesArray = answer?.downvotes || [];
    const targetUserId = String(currentUserId || '').trim();

    const checkMatch = (vote: string | { _id?: string }) => {
      const voteId =
        typeof vote === 'object' && vote !== null
          ? (vote._id || String(vote))
          : String(vote);
      return voteId.trim() === targetUserId;
    };

    return {
      hasUpvoted: upVotesArray.some(checkMatch),
      hasDownvoted: downVotesArray.some(checkMatch),
      netVotes: upVotesArray.length - downVotesArray.length,
    };
  };

  const authorDisplay = question.author?.nickname || question.author?.fullName || 'Unknown Author';

  return (
    <div className={styles.pageWrapper}>
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <div className={styles.logoClickable} onClick={() => navigate('/')}>IV</div>
        </div>
        <div className={styles.navCenter}>
          <div className={styles.navBarPlaceholder}>Question Deep-Dive</div>
        </div>
        <div className={styles.navRight}>
          <button className={styles.navHomeBtn} onClick={() => navigate('/')}>Dashboard</button>
        </div>
      </nav>

      <div className={styles.container}>
        <button className={styles.backButton} onClick={() => navigate('/')}>
          <span className={styles.backArrow}>&larr;</span> Back to Questions
        </button>

        <article className={styles.questionBlock}>
          <header className={styles.header}>
            <h1 className={styles.title}>{question.title}</h1>
            <div className={styles.meta}>
              <span>Asked by <strong className={styles.authorBadge}>{authorDisplay}</strong></span>
              <span className={styles.dotSeparator}>•</span>
              <span>{new Date(question.createdAt).toLocaleDateString()}</span>
            </div>
          </header>
          <ContentRenderer content={question.description} className={styles.description} />
          <div className={styles.tags}>
            {question.tags.map((tag) => (
              <span key={tag} className={styles.tag}>#{tag}</span>
            ))}
          </div>
        </article>

        <section className={styles.answersSection}>
          <h2 className={styles.sectionHeading}>{question.answers?.length || 0} Answers</h2>
          <div className={styles.answersList}>
          {question.answers && question.answers.length > 0 ? (
            question.answers
              .slice()
              .sort((a, b) => {
                const scoreA = getVoteState(a._id).netVotes;
                const scoreB = getVoteState(b._id).netVotes;
                return scoreB - scoreA;
              })
              .map((answer) => {
              const ansAuthor =
                typeof answer.author === 'object'
                  ? answer.author?.nickname || answer.author?.fullName || 'Anonymous'
                  : 'Anonymous';
              const { hasUpvoted, hasDownvoted, netVotes } = getVoteState(answer._id);

                return (
                  <div key={answer._id} className={styles.answerCard}>
                    <div className={styles.voteColumn}>
                      <button
                        className={`${styles.voteButton} ${hasUpvoted ? styles.upvotedActive : ''}`}
                        onClick={() => handleVote(answer._id, 'up')}
                        title="Vote Up"
                      >
                        ▲
                      </button>
                      <span className={`${styles.voteScore} ${netVotes < 0 ? styles.negativeScore : ''}`}>
                        {netVotes}
                      </span>
                      <button
                        className={`${styles.voteButton} ${hasDownvoted ? styles.downvotedActive : ''}`}
                        onClick={() => handleVote(answer._id, 'down')}
                        title="Vote Down"
                      >
                        ▼
                      </button>
                    </div>

                    <div className={styles.answerMainBlock}>
                      <ContentRenderer content={answer.content} className={styles.answerContent} />
                      <div className={styles.answerMeta}>
                        <span>Answered by <strong className={styles.ansAuthorBadge}>{ansAuthor}</strong></span>
                        <span className={styles.dotSeparator}>•</span>
                        <span>{new Date(answer.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })
          ) : (
            <div className={styles.noAnswersCard}>
              <p className={styles.noAnswers}>No answers yet. Be the first to share your knowledge!</p>
            </div>
          )}
        </div>
        </section>

        <section className={styles.postAnswerSection}>
          <h3 className={styles.formHeading}>Your Answer</h3>
          <form onSubmit={handleCreateAnswer} className={styles.answerForm}>
            <textarea
              className={styles.answerInput}
              rows={5}
              placeholder="Type your solution here. Use ```language for code snippets."
              value={newAnswerContent}
              onChange={(e) => setNewAnswerContent(e.target.value)}
              disabled={isSubmittingAnswer}
            />
            <button
              type="submit"
              className={styles.submitAnswerBtn}
              disabled={isSubmittingAnswer || !newAnswerContent.trim()}
            >
              {isSubmittingAnswer ? 'Posting...' : 'Answer'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
