const { useState, useEffect } = React;

const FlashcardApp = () => {
  // App state
  const [role, setRole] = useState('teacher'); // 'teacher' or 'student'
  const [activeTab, setActiveTab] = useState('create');
  const [flashcards, setFlashcards] = useState([]);
  const [studyCards, setStudyCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [topics, setTopics] = useState(['all']);

  // Form state
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    topic: ''
  });

  // Load flashcards from localStorage
  useEffect(() => {
    const savedFlashcards = JSON.parse(localStorage.getItem('flashcards')) || [];
    setFlashcards(savedFlashcards);
    
    // Extract unique topics
    const uniqueTopics = ['all', ...new Set(savedFlashcards.map(card => card.topic).filter(t => t))];
    setTopics(uniqueTopics);
  }, []);

  // Save flashcards to localStorage when they change
  useEffect(() => {
    localStorage.setItem('flashcards', JSON.stringify(flashcards));
  }, [flashcards]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.question || !formData.answer) return;

    const newFlashcard = {
      id: Date.now(),
      question: formData.question,
      answer: formData.answer,
      topic: formData.topic || 'General'
    };

    setFlashcards([...flashcards, newFlashcard]);
    
    // Update topics if new
    if (formData.topic && !topics.includes(formData.topic)) {
      setTopics([...topics, formData.topic]);
    }

    // Reset form
    setFormData({
      question: '',
      answer: '',
      topic: ''
    });
  };

  // Delete a flashcard
  const deleteFlashcard = (id) => {
    setFlashcards(flashcards.filter(card => card.id !== id));
  };

  // Start studying with filtered cards
  const startStudying = () => {
    const filteredCards = selectedTopic === 'all' 
      ? [...flashcards] 
      : flashcards.filter(card => card.topic === selectedTopic);
    
    if (filteredCards.length === 0) {
      alert('No flashcards available for this topic.');
      return;
    }
    
    setStudyCards(filteredCards);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setActiveTab('study');
  };

  // Navigate study cards
  const nextCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prevIndex) => 
      prevIndex === studyCards.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prevIndex) => 
      prevIndex === 0 ? studyCards.length - 1 : prevIndex - 1
    );
  };

  // Toggle card flip
  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <>
      <div className="container">
        <header className="floating">
          <h1>Interactive Flashcard App</h1>
          <p>{role === 'teacher' ? 'Create and manage beautiful flashcards' : 'Engage in immersive learning'}</p>
        </header>

        <div className="role-selector">
          <button 
            className={`role-btn ${role === 'teacher' ? 'active' : ''}`}
            onClick={() => setRole('teacher')}
          >
            <i className="fas fa-chalkboard-teacher"></i> Teacher Mode
          </button>
          <button 
            className={`role-btn ${role === 'student' ? 'active' : ''}`}
            onClick={() => setRole('student')}
          >
            <i className="fas fa-user-graduate"></i> Student Mode
          </button>
        </div>

        <div className="tabs">
          {role === 'teacher' && (
            <div 
              className={`tab ${activeTab === 'create' ? 'active' : ''}`} 
              onClick={() => setActiveTab('create')}
            >
              <i className="fas fa-plus-circle"></i> Create Flashcards
            </div>
          )}
          <div 
            className={`tab ${activeTab === 'browse' ? 'active' : ''}`} 
            onClick={() => setActiveTab('browse')}
            >
            <i className="fas fa-search"></i> Browse Flashcards
          </div>
          <div 
            className={`tab ${activeTab === 'study' ? 'active' : ''}`} 
            onClick={() => {
              if (studyCards.length === 0) startStudying();
              else setActiveTab('study');
            }}
          >
            <i className="fas fa-book-open"></i> Study Mode
          </div>
        </div>

        {/* Create Flashcards Tab */}
        {role === 'teacher' && (
          <div className={`tab-content ${activeTab === 'create' ? 'active' : ''}`}>
            <h2>Create New Flashcard</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="question">Question:</label>
                <textarea
                  id="question"
                  name="question"
                  value={formData.question}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your question here..."
                />
              </div>
              <div className="form-group">
                <label htmlFor="answer">Answer:</label>
                <textarea
                  id="answer"
                  name="answer"
                  value={formData.answer}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter the answer here..."
                />
              </div>
              <div className="form-group">
                <label htmlFor="topic">Topic (optional):</label>
                <input
                  type="text"
                  id="topic"
                  name="topic"
                  value={formData.topic}
                  onChange={handleInputChange}
                  placeholder="e.g. Math, History, Science"
                />
              </div>
              <button type="submit">
                <i className="fas fa-save"></i> Create Flashcard
              </button>
            </form>
          </div>
        )}

        {/* Browse Flashcards Tab */}
        <div className={`tab-content ${activeTab === 'browse' ? 'active' : ''}`}>
          <h2>Browse Flashcards</h2>
          
          <div className="topic-filter">
            {topics.map(topic => (
              <button
                key={topic}
                className={`topic-btn ${selectedTopic === topic ? 'active' : ''}`}
                onClick={() => setSelectedTopic(topic)}
              >
                {topic}
              </button>
            ))}
          </div>

          <button onClick={startStudying} style={{ marginBottom: '25px' }}>
            <i className="fas fa-play"></i> Study Selected Topic
          </button>

          <div className="flashcard-list">
            {flashcards
              .filter(card => selectedTopic === 'all' || card.topic === selectedTopic)
              .map(card => (
                <div key={card.id} className="flashcard">
                  {role === 'teacher' && (
                    <button 
                      className="delete-btn"
                      onClick={() => deleteFlashcard(card.id)}
                      title="Delete this flashcard"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  )}
                  <h3>{card.question}</h3>
                  <p><strong>Answer:</strong> {card.answer}</p>
                  {card.topic && <span className="topic">{card.topic}</span>}
                </div>
              ))}
          </div>

          {flashcards.filter(card => selectedTopic === 'all' || card.topic === selectedTopic).length === 0 && (
            <p style={{ textAlign: 'center', color: 'white' }}>No flashcards found for this topic.</p>
          )}
        </div>

        {/* Study Mode Tab */}
        <div className={`tab-content ${activeTab === 'study' ? 'active' : ''}`}>
          <div className="study-container">
            <div className="card-counter">
              Card {currentCardIndex + 1} of {studyCards.length} | Topic: {studyCards[currentCardIndex]?.topic || 'N/A'}
            </div>

            {studyCards.length > 0 ? (
              <div 
                className={`study-card ${isFlipped ? 'flipped' : ''}`} 
                onClick={toggleFlip}
              >
                <h2>{studyCards[currentCardIndex].question}</h2>
                <div className="answer">
                  <p>{studyCards[currentCardIndex].answer}</p>
                </div>
                <p className="prompt">Click to {isFlipped ? 'see question' : 'reveal answer'}</p>
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: 'white' }}>
                No flashcards available to study. Select a topic and click "Study Selected Topic".
              </p>
            )}

            <div className="study-controls">
              <button onClick={prevCard}>
                <i className="fas fa-arrow-left"></i> Previous
              </button>
              <button onClick={nextCard}>
                Next <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer>
        <div className="footer-content">
          <div className="footer-section">
            <h3>About Flashcard App</h3>
            <p>An interactive learning tool designed to help teachers create engaging flashcards and students to study effectively.</p>
            <div className="social-links">
              <a href="#"><i className="fab fa-facebook-f"></i></a>
              <a href="#"><i className="fab fa-twitter"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
              <a href="#"><i className="fab fa-linkedin-in"></i></a>
            </div>
          </div>

          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li><a href="#"><i className="fas fa-chevron-right"></i> Home</a></li>
              <li><a href="#"><i className="fas fa-chevron-right"></i> Features</a></li>
              <li><a href="#"><i className="fas fa-chevron-right"></i> How It Works</a></li>
              <li><a href="#"><i className="fas fa-chevron-right"></i> Testimonials</a></li>
              <li><a href="#"><i className="fas fa-chevron-right"></i> Contact Us</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Contact Info</h3>
            <ul className="contact-info">
              <li>
                <i className="fas fa-map-marker-alt"></i>
                <span>123 Learning Street, Education City</span>
              </li>
              <li>
                <i className="fas fa-phone"></i>
                <span>+1 (555) 123-4567</span>
              </li>
              <li>
                <i className="fas fa-envelope"></i>
                <span>info@flashcardapp.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Flashcard App. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
};

ReactDOM.render(<FlashcardApp />, document.getElementById('root'));
