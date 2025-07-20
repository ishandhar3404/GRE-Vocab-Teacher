// GRE Vocabulary Extension - Mastery-Free Spaced Repetition System
class GREVocabularyApp {
  constructor() {
    this.words = SHUFFLED_GRE_WORDS;
    this.currentWordIndex = 0;
    this.currentMode = 'study'; // 'study', 'quiz', 'flashcard'
    this.sessionStartTime = Date.now();
    this.sessionStats = {
      correct: 0,
      incorrect: 0,
      total: 0
    };
    this.userProgress = this.loadProgress();
    this.quizOptions = [];
    this.currentQuizWord = null;
    this.flashcardIndex = 0;
    this.flashcardFlipped = false;
    this.sessionSize = 10;
    this.sessionWords = [];
    this.sessionPhase = null; // null | 'flashcards' | 'quiz'
    this.sessionQuizIndex = 0;
    
    this.initializeEventListeners();
    this.updateStats();
    this.showStudyMode();
  }

  // Load user progress from localStorage
  loadProgress() {
    const saved = localStorage.getItem('greVocabularyProgress');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      studyHistory: {},
      totalTime: 0,
      totalCorrect: 0,
      totalIncorrect: 0
    };
  }

  // Save user progress to localStorage
  saveProgress() {
    localStorage.setItem('greVocabularyProgress', JSON.stringify(this.userProgress));
  }

  // Initialize all event listeners
  initializeEventListeners() {
    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });

    // Reset button
    document.getElementById('resetBtn').addEventListener('click', () => {
      this.showResetModal();
    });

    // Save Progress button
    document.getElementById('saveBtn').addEventListener('click', () => {
      this.saveProgress();
      alert('Progress saved!');
    });

    // Reset modal
    document.getElementById('cancelReset').addEventListener('click', () => {
      this.hideResetModal();
    });

    document.getElementById('confirmReset').addEventListener('click', () => {
      this.resetProgress();
    });

    // Quiz option buttons
    document.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.handleQuizAnswer(parseInt(e.target.dataset.option));
      });
    });

    // Next button
    document.getElementById('nextBtn').addEventListener('click', () => {
      this.nextWord();
    });

    // Flashcard navigation
    document.getElementById('prevCard').addEventListener('click', () => {
      this.previousFlashcard();
    });

    document.getElementById('nextCard').addEventListener('click', () => {
      this.nextFlashcard();
    });

    // Flashcard flip
    document.getElementById('flashcard').addEventListener('click', () => {
      this.flipFlashcard();
    });

    // Start Session button
    document.getElementById('startSessionBtn').addEventListener('click', () => {
      this.startStudySession();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardShortcuts(e);
    });
  }

  // Handle keyboard shortcuts
  handleKeyboardShortcuts(e) {
    if (e.target.tagName === 'INPUT') return;

    switch(e.key) {
      case '1':
      case '2':
      case '3':
      case '4':
        if (this.currentMode === 'quiz') {
          this.handleQuizAnswer(parseInt(e.key) - 1);
        }
        break;
      case ' ':
        e.preventDefault();
        if (this.currentMode === 'study') {
          this.startQuiz();
        } else if (this.currentMode === 'quiz') {
          this.nextWord();
        }
        break;
      case 'ArrowLeft':
        if (this.currentMode === 'flashcard') {
          this.previousFlashcard();
        }
        break;
      case 'ArrowRight':
        if (this.currentMode === 'flashcard') {
          this.nextFlashcard();
        }
        break;
      case 'Enter':
        if (this.currentMode === 'flashcard') {
          this.flipFlashcard();
        }
        break;
    }
  }

  // Switch between tabs
  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`).classList.add('active');

    // Handle tab-specific logic
    switch(tabName) {
      case 'study':
        this.currentMode = 'study';
        this.showStudyMode();
        break;
      case 'flashcards':
        this.currentMode = 'flashcard';
        this.showFlashcards();
        break;
    }
  }

  // Show study mode
  showStudyMode() {
    this.currentMode = 'study';
    this.currentWordIndex = this.getNextStudyWord();
    // Don't display the word before session starts
    document.getElementById('currentWord').textContent = '';
    document.getElementById('currentDefinition').textContent = '';
    document.getElementById('currentDefinition').style.display = 'none';
    this.hideQuizElements();
    // Show Start Session button
    document.getElementById('startSessionBtn').style.display = 'block';
    // Update stats to show current progress
    this.updateStats();
  }

  // Get next word to study (new mastery-free logic)
  getNextStudyWord() {
    const now = Date.now();
    
    // Find words that need review or haven't been studied
    const wordsToStudy = this.words.filter((_, index) => {
      const history = this.userProgress.studyHistory[index] || {};
      const lastStudied = history.lastStudied || 0;
      const interval = history.interval || 1; // Default to 1 for new words
      
      // If never studied or due for review
      return lastStudied === 0 || (now - lastStudied) >= (interval * 24 * 60 * 60 * 1000);
    });

    if (wordsToStudy.length === 0) {
      // All words are up to date, pick a random one
      return Math.floor(Math.random() * this.words.length);
    }

    // Return a random word that needs study (properly randomized)
    const randomIndex = Math.floor(Math.random() * wordsToStudy.length);
    const randomWord = wordsToStudy[randomIndex];
    return this.words.findIndex(word => word.word === randomWord.word);
  }

  // Display current word in study mode
  displayCurrentWord() {
    const word = this.words[this.currentWordIndex];
    document.getElementById('currentWord').textContent = word.word;
    document.getElementById('currentDefinition').textContent = word.definition;
  }

  // Hide quiz-related elements
  hideQuizElements() {
    document.getElementById('quizOptions').style.display = 'none';
    document.getElementById('result').style.display = 'none';
    document.getElementById('nextBtn').style.display = 'none';
    
    // Clear any result styling from option buttons
    document.querySelectorAll('.option-btn').forEach(btn => {
      btn.classList.remove('correct', 'incorrect');
      btn.disabled = false;
    });
  }

  // Start quiz mode
  startQuiz() {
    this.currentMode = 'quiz';
    this.currentQuizWord = this.words[this.currentWordIndex];
    this.generateQuizOptions();
    this.displayQuiz();
  }

  // Generate quiz options
  generateQuizOptions() {
    const correctDefinition = this.currentQuizWord.definition;
    const otherWords = this.words.filter((_, index) => index !== this.currentWordIndex);
    
    // Get 3 random incorrect definitions, ensuring no duplicates
    const incorrectDefinitions = [];
    const usedDefinitions = new Set([correctDefinition]); // Start with correct definition to avoid duplicates
    
    while (incorrectDefinitions.length < 3) {
      const randomIndex = Math.floor(Math.random() * otherWords.length);
      const randomDefinition = otherWords[randomIndex].definition;
      
      // Only add if this definition hasn't been used yet
      if (!usedDefinitions.has(randomDefinition)) {
        usedDefinitions.add(randomDefinition);
        incorrectDefinitions.push(randomDefinition);
      }
    }

    // Combine and shuffle
    this.quizOptions = [correctDefinition, ...incorrectDefinitions];
    this.shuffleArray(this.quizOptions);
  }

  // Shuffle array using Fisher-Yates algorithm
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Display quiz
  displayQuiz() {
    document.getElementById('currentWord').textContent = this.currentQuizWord.word;
    document.getElementById('currentDefinition').style.display = 'none';
    
    const quizOptions = document.getElementById('quizOptions');
    quizOptions.style.display = 'block';
    
    this.quizOptions.forEach((option, index) => {
      const btn = document.querySelector(`[data-option="${index}"]`);
      btn.textContent = option;
      btn.className = 'option-btn';
      btn.disabled = false;
    });
    
    // Clear any previous result styling
    document.getElementById('result').style.display = 'none';
  }

  // Handle quiz answer
  handleQuizAnswer(selectedIndex) {
    const isCorrect = this.quizOptions[selectedIndex] === this.currentQuizWord.definition;
    
    // Update session stats
    this.sessionStats.total++;
    if (isCorrect) {
      this.sessionStats.correct++;
    } else {
      this.sessionStats.incorrect++;
    }

    // Update progress with new mastery-free spaced repetition logic
    this.updateWordProgress(isCorrect);

    // Show result
    this.showQuizResult(isCorrect, selectedIndex);
  }

  // Update word progress (new mastery-free spaced repetition logic)
  updateWordProgress(isCorrect) {
    const wordIndex = this.currentWordIndex;
    const history = this.userProgress.studyHistory[wordIndex] || {};
    const now = Date.now();
    
    if (isCorrect) {
      // Confidence score: require consecutive correct before increasing interval
      history.consecutiveCorrect = (history.consecutiveCorrect || 0) + 1;
      
      // Determine required consecutive correct based on current interval
      let requiredConsecutive;
      if (history.interval <= 1) {
        requiredConsecutive = 2; // New/Struggling -> Improving
      } else if (history.interval <= 4) {
        requiredConsecutive = 2; // Improving -> Strong
      } else {
        requiredConsecutive = 3; // Strong -> Strong (maintain)
      }
      
      if (history.consecutiveCorrect >= requiredConsecutive) {
        // Increase interval, but cap at 5
        const currentInterval = history.interval || 1;
        let newInterval;
        
        if (currentInterval === 1) {
          newInterval = Math.floor(Math.random() * 3) + 2; // 2-4 sessions
        } else {
          newInterval = Math.min(5, currentInterval * 2); // Cap at 5
        }
        
        history.interval = newInterval;
        history.consecutiveCorrect = 0; // Reset for next growth phase
      }
    } else {
      // Reset interval and consecutive correct for incorrect answers
      history.interval = 1;
      history.consecutiveCorrect = 0;
    }
    
    history.lastStudied = now;
    history.totalAttempts = (history.totalAttempts || 0) + 1;
    history.correctAttempts = (history.correctAttempts || 0) + (isCorrect ? 1 : 0);
    history.errorCount = (history.errorCount || 0) + (isCorrect ? 0 : 1);
    
    this.userProgress.studyHistory[wordIndex] = history;
    
    // Update total progress
    if (isCorrect) {
      this.userProgress.totalCorrect = (this.userProgress.totalCorrect || 0) + 1;
    } else {
      this.userProgress.totalIncorrect = (this.userProgress.totalIncorrect || 0) + 1;
    }
    
    this.saveProgress();
    // Update stats immediately after progress change
    this.updateStats();
  }

  // Show quiz result
  showQuizResult(isCorrect, selectedIndex) {
    const result = document.getElementById('result');
    const resultIcon = document.getElementById('resultIcon');
    const resultText = document.getElementById('resultText');
    
    // Update option buttons
    this.quizOptions.forEach((option, index) => {
      const btn = document.querySelector(`[data-option="${index}"]`);
      if (option === this.currentQuizWord.definition) {
        btn.classList.add('correct');
      } else if (index === selectedIndex) {
        btn.classList.add('incorrect');
      }
      btn.disabled = true;
    });
    
    // Show result
    resultIcon.textContent = isCorrect ? '✓' : '✗';
    resultIcon.className = `result-icon ${isCorrect ? 'correct' : 'incorrect'}`;
    resultText.textContent = isCorrect ? 'Correct!' : 'Incorrect!';
    result.style.display = 'block';
    
    // Show next button
    document.getElementById('nextBtn').style.display = 'block';
  }

  // Move to next word
  nextWord() {
    this.currentWordIndex = this.getNextStudyWord();
    this.currentMode = 'study';
    this.displayCurrentWord();
    this.hideQuizElements();
    // Hide definition when returning to study mode
    document.getElementById('currentDefinition').style.display = 'none';
  }

  // Show flashcards
  showFlashcards() {
    this.flashcardIndex = 0;
    this.flashcardFlipped = false;
    this.displayFlashcard();
  }

  // Display current flashcard
  displayFlashcard() {
    const word = this.words[this.flashcardIndex];
    const history = this.userProgress.studyHistory[this.flashcardIndex] || {};
    
    document.getElementById('flashcardFront').textContent = word.word;
    document.getElementById('flashcardBack').textContent = word.definition;
    document.getElementById('flashcardBack').style.display = 'none';
    document.getElementById('flashcardFront').style.display = 'block';
    
    // Update status based on interval
    const status = document.getElementById('flashcardStatus');
    const interval = history.interval || 1;
    
    if (interval === 1) {
      if (history.lastStudied) {
        status.textContent = '🔄 Struggling';
        status.className = 'flashcard-status struggling';
      } else {
        status.textContent = '🆕 New';
        status.className = 'flashcard-status new';
      }
    } else if (interval <= 4) {
      status.textContent = '📈 Improving';
      status.className = 'flashcard-status improving';
    } else {
      status.textContent = '💪 Strong';
      status.className = 'flashcard-status strong';
    }
    
    // Update counter
    document.getElementById('cardCounter').textContent = `${this.flashcardIndex + 1}/${this.words.length}`;
    
    this.flashcardFlipped = false;
  }

  // Flip flashcard
  flipFlashcard() {
    const front = document.getElementById('flashcardFront');
    const back = document.getElementById('flashcardBack');
    
    if (this.flashcardFlipped) {
      front.style.display = 'block';
      back.style.display = 'none';
      this.flashcardFlipped = false;
    } else {
      front.style.display = 'none';
      back.style.display = 'block';
      this.flashcardFlipped = true;
    }
  }

  // Navigate to previous flashcard
  previousFlashcard() {
    if (this.flashcardIndex > 0) {
      this.flashcardIndex--;
      this.displayFlashcard();
    }
  }

  // Navigate to next flashcard
  nextFlashcard() {
    if (this.flashcardIndex < this.words.length - 1) {
      this.flashcardIndex++;
      this.displayFlashcard();
    }
  }

  // Update statistics display
  updateStats() {
    const totalWords = this.words.length;
    const seenWords = Object.keys(this.userProgress.studyHistory).length;
    const progressPercentage = Math.round((seenWords / totalWords) * 100);
    
    // Update progress bar (now shows seen words instead of mastered)
    document.getElementById('progressFill').style.width = `${progressPercentage}%`;
    document.getElementById('progressText').textContent = `${seenWords}/${totalWords}`;
    
    // Update session accuracy
    const sessionAccuracy = this.sessionStats.total > 0 
      ? Math.round((this.sessionStats.correct / this.sessionStats.total) * 100)
      : 0;
    document.getElementById('sessionAccuracy').textContent = `${sessionAccuracy}%`;
    
    // Update time spent
    const timeSpent = Math.floor((Date.now() - this.sessionStartTime) / 60000);
    document.getElementById('timeSpent').textContent = `Time: ${timeSpent}m`;
  }

  // Show reset confirmation modal
  showResetModal() {
    document.getElementById('resetModal').style.display = 'flex';
  }

  // Hide reset confirmation modal
  hideResetModal() {
    document.getElementById('resetModal').style.display = 'none';
  }

  // Reset all progress
  resetProgress() {
    this.userProgress = {
      studyHistory: {},
      totalTime: 0,
      totalCorrect: 0,
      totalIncorrect: 0
    };
    this.saveProgress();
    
    this.sessionStats = {
      correct: 0,
      incorrect: 0,
      total: 0
    };
    this.sessionStartTime = Date.now();
    
    this.hideResetModal();
    this.updateStats();
    this.showStudyMode();
  }

  // --- Study Session Flow (New Mastery-Free System) ---
  startStudySession() {
    // Generate session with new word selection logic
    this.sessionWords = this.generateSessionWords();
    this.sessionPhase = 'flashcards'; // Start with flashcards
    this.sessionQuizIndex = 0;
    this.sessionFlashcardIndex = 0;
    this.sessionMixIndex = 0;
    this.sessionMixWords = [];
    this.sessionMixType = null;
    this.sessionCompletedFlashcards = false;
    this.sessionCompletedQuizzes = false;
    this.sessionMixHistory = [];
    // Hide Start Session button
    document.getElementById('startSessionBtn').style.display = 'none';
    // Hide any word/definition before session
    document.getElementById('currentWord').textContent = '';
    document.getElementById('currentDefinition').textContent = '';
    document.getElementById('currentDefinition').style.display = 'none';
    document.getElementById('quizOptions').style.display = 'none';
    document.getElementById('result').style.display = 'none';
    document.getElementById('nextBtn').style.display = 'none';
    // Start session with flashcards
    this.showNextSessionStep();
  }

  // Generate session words with new mastery-free logic
  generateSessionWords() {
    const allWords = this.words.map((w, i) => ({ ...w, _index: i }));
    const studyHistory = this.userProgress.studyHistory;
    
    // Count seen words
    const seenWords = allWords.filter(w => {
      const history = studyHistory[w._index] || {};
      return history.lastStudied !== undefined;
    });
    
    // Determine new word count based on progress
    let newWordCount;
    if (seenWords.length < this.words.length * 0.25) {
      // First 25% of words: 4-5 new words
      newWordCount = Math.floor(Math.random() * 2) + 4;
    } else if (seenWords.length < this.words.length) {
      // 25%-100%: 2-3 new words
      newWordCount = Math.floor(Math.random() * 2) + 2;
    } else {
      // All words seen: 0-2 new words (if any remain)
      newWordCount = Math.floor(Math.random() * 3);
    }
    
    // Get new words (never seen before)
    const unseenWords = allWords.filter(w => {
      const history = studyHistory[w._index] || {};
      return history.lastStudied === undefined;
    });
    
    const newWords = unseenWords.slice(0, newWordCount);
    
    // Get review words based on new interval system
    const reviewWords = this.getPrioritizedReviewWords(seenWords, this.sessionSize - newWords.length);
    
    // Combine and shuffle, but put new words first
    const sessionWords = [...newWords, ...reviewWords];
    this.shuffleArray(sessionWords);
    
    return sessionWords.map(w => w._index);
  }

  // Get prioritized review words based on new interval system
  getPrioritizedReviewWords(seenWords, count) {
    const studyHistory = this.userProgress.studyHistory;
    const now = Date.now();
    
    // Categorize words by interval
    const struggling = []; // interval = 1
    const improving = []; // interval = 2-4
    const strong = []; // interval = 8
    
    seenWords.forEach(word => {
      const history = studyHistory[word._index] || {};
      const interval = history.interval || 1;
      const lastStudied = history.lastStudied || 0;
      const dueDate = lastStudied + (interval * 24 * 60 * 60 * 1000);
      
      if (dueDate <= now) {
        if (interval === 1) {
          struggling.push(word);
        } else if (interval <= 4) {
          improving.push(word);
        } else {
          strong.push(word);
        }
      }
    });
    
    // Sort by error rate within each category
    const sortByErrorRate = (words) => {
      return words.sort((a, b) => {
        const historyA = studyHistory[a._index] || {};
        const historyB = studyHistory[b._index] || {};
        
        const errorRateA = historyA.totalAttempts ? (historyA.errorCount || 0) / historyA.totalAttempts : 0;
        const errorRateB = historyB.totalAttempts ? (historyB.errorCount || 0) / historyB.totalAttempts : 0;
        
        return errorRateB - errorRateA; // Highest error rate first
      });
    };
    
    sortByErrorRate(struggling);
    sortByErrorRate(improving);
    sortByErrorRate(strong);
    
    // Compose review words based on new system
    let reviewWords = [];
    
    // Add struggling words first (highest priority)
    reviewWords.push(...struggling.slice(0, Math.min(3, count)));
    
    // Add improving words
    const remainingCount = count - reviewWords.length;
    if (remainingCount > 0) {
      reviewWords.push(...improving.slice(0, Math.min(3, remainingCount)));
    }
    
    // Add strong words
    const finalRemainingCount = count - reviewWords.length;
    if (finalRemainingCount > 0) {
      reviewWords.push(...strong.slice(0, finalRemainingCount));
    }
    
    // If we don't have enough due words, add some that aren't due yet
    if (reviewWords.length < count) {
      const allSeenWords = seenWords.filter(w => !reviewWords.includes(w));
      this.shuffleArray(allSeenWords);
      reviewWords.push(...allSeenWords.slice(0, count - reviewWords.length));
    }
    
    return reviewWords.slice(0, count);
  }

  // Show next step in session (flashcards, then quizzes, then mix)
  showNextSessionStep() {
    if (this.sessionPhase === 'flashcards') {
      if (this.sessionFlashcardIndex < this.sessionWords.length) {
        this.showSessionFlashcard(this.sessionWords[this.sessionFlashcardIndex]);
      } else {
        this.sessionPhase = 'quizzes';
        this.sessionQuizIndex = 0;
        this.showNextSessionStep();
      }
    } else if (this.sessionPhase === 'quizzes') {
      if (this.sessionQuizIndex < this.sessionWords.length) {
        this.showSessionQuiz(this.sessionWords[this.sessionQuizIndex]);
      } else {
        this.sessionPhase = 'mix';
        this.sessionMixWords = this.generateSessionWords(); // New batch for mix
        this.sessionMixIndex = 0;
        this.showNextSessionStep();
      }
    } else if (this.sessionPhase === 'mix') {
      if (this.sessionMixIndex < this.sessionMixWords.length) {
        // Alternate between flashcard and quiz for mix
        this.sessionMixType = (Math.random() < 0.5) ? 'flashcard' : 'quiz';
        if (this.sessionMixType === 'flashcard') {
          this.showSessionFlashcard(this.sessionMixWords[this.sessionMixIndex]);
        } else {
          this.showSessionQuiz(this.sessionMixWords[this.sessionMixIndex]);
        }
      } else {
        // Start a new mix batch
        this.sessionMixWords = this.generateSessionWords();
        this.sessionMixIndex = 0;
        this.showNextSessionStep();
      }
    }
  }

  // Show session flashcard for a given word index
  showSessionFlashcard(wordIndex) {
    this.currentMode = 'session-flashcard';
    const word = this.words[wordIndex];
    document.getElementById('currentWord').textContent = word.word;
    document.getElementById('currentDefinition').textContent = word.definition;
    document.getElementById('currentDefinition').style.display = 'block';
    document.getElementById('quizOptions').style.display = 'none';
    document.getElementById('result').style.display = 'none';
    document.getElementById('nextBtn').style.display = 'block';
    // For flashcard phase, advance index on next
    this.sessionCurrentWordIndex = wordIndex;
  }

  // Show session quiz for a given word index
  showSessionQuiz(wordIndex) {
    this.currentMode = 'session-quiz';
    this.currentQuizWord = this.words[wordIndex];
    this.generateQuizOptions();
    this.displayQuiz();
    // Clear any previous result styling
    document.querySelectorAll('.option-btn').forEach(btn => {
      btn.classList.remove('correct', 'incorrect');
      btn.disabled = false;
    });
    document.getElementById('result').style.display = 'none';
    document.getElementById('nextBtn').style.display = 'none';
    // For quiz phase, advance index on answer
    this.sessionCurrentWordIndex = wordIndex;
  }

  // Next button handler for session
  nextSessionStep() {
    if (this.sessionPhase === 'flashcards') {
      this.sessionFlashcardIndex++;
      this.showNextSessionStep();
    } else if (this.sessionPhase === 'mix' && this.sessionMixType === 'flashcard') {
      this.sessionMixIndex++;
      this.showNextSessionStep();
    } else if (this.sessionPhase === 'quizzes' || (this.sessionPhase === 'mix' && this.sessionMixType === 'quiz')) {
      // Manual Next for incorrect answers in quiz phases
      this.sessionQuizIndex++;
      this.showNextSessionStep();
    }
  }

  // Handle session quiz answer
  handleSessionQuizAnswer(selectedIndex) {
    const isCorrect = this.quizOptions[selectedIndex] === this.currentQuizWord.definition;
    // Update session stats
    this.sessionStats.total++;
    if (isCorrect) {
      this.sessionStats.correct++;
    } else {
      this.sessionStats.incorrect++;
    }
    // Update progress with new mastery-free logic
    this.updateSessionWordProgress(isCorrect);
    // Show result
    this.showSessionQuizResult(isCorrect, selectedIndex);
    
    // Auto-advance for correct answers, manual Next for incorrect
    if (isCorrect) {
      // Auto-advance after a short delay
      if (this.sessionPhase === 'quizzes') {
        this.sessionQuizIndex++;
        setTimeout(() => this.showNextSessionStep(), 800);
      } else if (this.sessionPhase === 'mix' && this.sessionMixType === 'quiz') {
        this.sessionMixIndex++;
        setTimeout(() => this.showNextSessionStep(), 800);
      }
    } else {
      // Show Next button for incorrect answers
      document.getElementById('nextBtn').style.display = 'block';
    }
  }

  // Update session word progress with new mastery-free logic
  updateSessionWordProgress(isCorrect) {
    const wordIndex = this.sessionCurrentWordIndex;
    const history = this.userProgress.studyHistory[wordIndex] || {};
    const now = Date.now();
    
    if (isCorrect) {
      // Confidence score: require consecutive correct before increasing interval
      history.consecutiveCorrect = (history.consecutiveCorrect || 0) + 1;
      
      // Determine required consecutive correct based on current interval
      let requiredConsecutive;
      if (history.interval <= 1) {
        requiredConsecutive = 2; // New/Struggling -> Improving
      } else if (history.interval <= 4) {
        requiredConsecutive = 2; // Improving -> Strong
      } else {
        requiredConsecutive = 3; // Strong -> Strong (maintain)
      }
      
      if (history.consecutiveCorrect >= requiredConsecutive) {
        // Increase interval, but cap at 5
        const currentInterval = history.interval || 1;
        let newInterval;
        
        if (currentInterval === 1) {
          newInterval = Math.floor(Math.random() * 3) + 2; // 2-4 sessions
        } else {
          newInterval = Math.min(5, currentInterval * 2); // Cap at 5
        }
        
        history.interval = newInterval;
        history.consecutiveCorrect = 0; // Reset for next growth phase
      }
    } else {
      // Reset interval and consecutive correct for incorrect answers
      history.interval = 1;
      history.consecutiveCorrect = 0;
    }
    
    history.lastStudied = now;
    history.totalAttempts = (history.totalAttempts || 0) + 1;
    history.correctAttempts = (history.correctAttempts || 0) + (isCorrect ? 1 : 0);
    history.errorCount = (history.errorCount || 0) + (isCorrect ? 0 : 1);
    
    this.userProgress.studyHistory[wordIndex] = history;
    
    // Update total progress
    if (isCorrect) {
      this.userProgress.totalCorrect = (this.userProgress.totalCorrect || 0) + 1;
    } else {
      this.userProgress.totalIncorrect = (this.userProgress.totalIncorrect || 0) + 1;
    }
    
    this.saveProgress();
    // Update stats immediately after progress change
    this.updateStats();
  }

  // Show session quiz result
  showSessionQuizResult(isCorrect, selectedIndex) {
    const result = document.getElementById('result');
    const resultIcon = document.getElementById('resultIcon');
    const resultText = document.getElementById('resultText');
    
    // Update option buttons
    this.quizOptions.forEach((option, index) => {
      const btn = document.querySelector(`[data-option="${index}"]`);
      if (option === this.currentQuizWord.definition) {
        btn.classList.add('correct');
      } else if (index === selectedIndex) {
        btn.classList.add('incorrect');
      }
      btn.disabled = true;
    });
    
    // Show result
    resultIcon.textContent = isCorrect ? '✓' : '✗';
    resultIcon.className = `result-icon ${isCorrect ? 'correct' : 'incorrect'}`;
    resultText.textContent = isCorrect ? 'Correct!' : 'Incorrect!';
    result.style.display = 'block';
    
    // Next button visibility is handled in handleSessionQuizAnswer
  }

  // End study session
  endStudySession() {
    this.sessionPhase = null;
    this.sessionWords = [];
    this.sessionQuizIndex = 0;
    this.currentMode = 'study';
    this.showStudyMode();
  }

  // Override nextWord for session mode
  nextWord() {
    if (this.sessionPhase === 'flashcards' || (this.sessionPhase === 'mix' && this.sessionMixType === 'flashcard')) {
      this.nextSessionStep();
    } else if (this.sessionPhase === 'quizzes' || (this.sessionPhase === 'mix' && this.sessionMixType === 'quiz')) {
      // Handle Next button for quiz phases (after incorrect answers)
      this.nextSessionStep();
    } else {
      // No-op outside session
    }
  }

  // Override handleQuizAnswer for session mode
  handleQuizAnswer(selectedIndex) {
    if (this.sessionPhase === 'quizzes' || (this.sessionPhase === 'mix' && this.sessionMixType === 'quiz')) {
      this.handleSessionQuizAnswer(selectedIndex);
    } else {
      // No-op outside session
    }
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new GREVocabularyApp();
}); 