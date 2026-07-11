import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../css/Questions.module.css';
import { useGetQuestionsQuery, Question } from '../features/api/apiSlice';
import ContentRenderer from '../components/ContentRenderer';
import AskQuestionModal from '../components/AskQuestionModal';

interface QuestionsProps {
  onLogout: () => void;
}

export default function Questions({ onLogout }: QuestionsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: questions = [], isLoading, error } = useGetQuestionsQuery();

  const filteredQuestions = questions.filter((q) =>
    q.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const formatMongoDate = (dateField: any) => {
    try {
      if (!dateField) return 'Unknown Date';
      const dateStr = typeof dateField === 'object' ? dateField.$date : dateField;
      return new Date(dateStr).toLocaleDateString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const getQuestionId = (question: Question): string => {
    if (question._id && typeof question._id === 'object') {
      return (question._id as any).$oid || String(question._id);
    }
    return String(question._id);
  };

  const getAuthorDisplay = (question: Question): string => {
    if (question.author.nickname) return question.author.nickname;
    
    if (question.author && typeof question.author === 'object') {
      if (question.author.nickname) return question.author.nickname;
      if (question.author.fullName) return question.author.fullName;
    }
    
    return 'Unknown User';
  };

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <div className={styles.logoClickable}>IV</div>
        </div>

        <div className={styles.navCenter}>
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchBar}
          />
          <button className={styles.askButton} onClick={() => setIsModalOpen(true)}>
            Ask Question
          </button>
        </div>

        <div className={styles.navRight}>
          <button className={styles.logoutButton} onClick={onLogout}>
            Logout
          </button>
        </div>
      </nav>

      <main className={styles.mainContent}>
        
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#4b5563' }}>
            Loading live feed...
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px' }}>
            Failed to connect to backend service. Please check your data pipeline.
          </div>
        )}

        {/* Dynamic Card Mapping Loops */}
        {!isLoading && !error && filteredQuestions.map((question) => (
          <div key={getQuestionId(question)} className={styles.questionCard}>
            
            {/* Left Hand Block: Info, Description, Tags, Metadata */}
            <div className={styles.cardLeft}>
              <h2 className={styles.questionTitle}>
                <Link to={`/questions/${getQuestionId(question)}`} className={styles.titleLink}>
                  {question.title}
                </Link>
              </h2>
              <ContentRenderer content={question.description} className={styles.questionContent} />
              
              <div className={styles.tagsContainer}>
                {question.tags?.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>

              <div className={styles.metaBlock}>
                <span className={styles.metaDate}>Asked {formatMongoDate(question.createdAt)}</span>
                <span className={styles.metaAuthor}>By {getAuthorDisplay(question)}</span>
              </div>
            </div>

            {/* Right Hand Block: Engagement Ratings */}
            <div className={styles.cardRight}>
              <div className={styles.metricItem}>
                <span className={styles.metricNumber}>
                  {(question.answers || []).reduce((acc: number, answer: any) => {
                    const ups = answer.upvotes?.length || 0;
                    const downs = answer.downvotes?.length || 0;
                    return acc + (ups + downs);
                  }, 0)}
                </span> votes
              </div>
              
              <div className={styles.metricItem}>
                <span className={styles.metricNumber}>{question.answers?.length || 0}</span> answers
              </div>
            </div>

          </div>
        ))}

        {!isLoading && !error && filteredQuestions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            No questions match your search query.
          </div>
        )}
      </main>
      <AskQuestionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}