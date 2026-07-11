import React, { useState } from 'react';
import styles from '../css/AskQuestionModal.module.css';
import { useCreateQuestionMutation } from '../features/api/apiSlice';

interface AskQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AskQuestionModal({ isOpen, onClose }: AskQuestionModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [formError, setFormError] = useState('');

  // Hook up your RTK Query mutation trigger
  const [createQuestion, { isLoading }] = useCreateQuestionMutation();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim() || !description.trim()) {
      setFormError('Title and description are required.');
      return;
    }

    // Process tag string (e.g., "kafka, backend" -> ["kafka", "backend"])
    const tagsArray = tagInput
      .split(',')
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0);

    try {
      await createQuestion({
        title: title.trim(),
        description: description.trim(),
        tags: tagsArray,
      }).unwrap();

      // Clear form inputs on success
      setTitle('');
      setDescription('');
      setTagInput('');
      onClose(); // Close modal window
    } catch (err: any) {
      setFormError(err?.data?.error || 'Failed to publish your question. Try again.');
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Ask a Public Question</h2>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {formError && <div className={styles.errorMessage}>{formError}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="title">Title</label>
            <p className={styles.labelSubText}>Be specific and imagine you’re asking a question to another programmer.</p>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. How does Kafka handle data persistence?"
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <p className={styles.labelSubText}>Introduce the problem and expand on what you put in the title. Use ```language code blocks for snippets.</p>
            <textarea
              id="description"
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. I understand it writes to disk, but how does it stay fast?"
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="tags">Tags</label>
            <p className={styles.labelSubText}>Add up to 5 tags to describe what your question is about. Separate with commas.</p>
            <input
              type="text"
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="e.g. kafka, backend, database"
              disabled={isLoading}
            />
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={isLoading}>
              {isLoading ? 'Posting...' : 'Post Your Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}