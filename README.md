# 2025 GRE Verbal Reasoning Defeater

A Chrome extension designed to help you master GRE vocabulary through an intelligent spaced repetition learning system. This extension provides a comprehensive study experience with flashcards, quizzes, and progress tracking to ensure you're well-prepared for the GRE Verbal Reasoning section.

## Features

### Study Modes
- **Flashcard Mode**: Flip through vocabulary cards to learn definitions
- **Quiz Mode**: Test your knowledge with multiple-choice questions
- **Study Sessions**: Structured learning sessions combining flashcards and quizzes

### Progress Tracking
- Real-time progress monitoring with visual progress bars
- Session accuracy tracking
- Time spent studying
- Persistent progress storage across browser sessions

### Intelligent Learning
- Spaced repetition algorithm for optimal retention
- Prioritizes words you struggle with
- Randomized word presentation to prevent memorization patterns
- Session-based learning with review cycles

### User Experience
- Clean, modern interface
- Keyboard shortcuts for efficient navigation
- Tab-based navigation between study modes
- Responsive design that works on different screen sizes

## Installation

### For Development
1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/gre-vocabulary-extension.git
   cd gre-vocabulary-extension
   ```

2. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the extension directory

### For Users
1. Download the extension files
2. Follow the same loading process as above

## Usage

### Getting Started
1. Click the extension icon in your Chrome toolbar
2. Choose between "Study" and "Flashcards" tabs
3. Start with a study session to get familiar with the words

### Study Mode
- Click "Start Session" to begin a structured learning session
- Review flashcards first, then test your knowledge with quizzes
- Track your progress in real-time

### Flashcard Mode
- Navigate through vocabulary cards using Previous/Next buttons
- Click on cards to flip between word and definition
- Use keyboard shortcuts (arrow keys) for quick navigation

### Progress Management
- Save your progress regularly using the "Save Progress" button
- Reset progress if needed (use with caution)
- Monitor your session accuracy and time spent studying

## Technical Details

### Architecture
- **Manifest Version**: 3 (latest Chrome extension standard)
- **Storage**: Local browser storage for progress persistence
- **No External Dependencies**: Pure HTML, CSS, and JavaScript

### File Structure
```
├── manifest.json          # Extension configuration
├── popup.html            # Main extension interface
├── app.js               # Core application logic
├── words.js             # Vocabulary data
├── styles.css           # Styling and animations
├── icons/               # Extension icons (16x16 to 128x128)
└── words_randomized.txt # Raw vocabulary data
```

### Key Components
- **GREVocabularyApp Class**: Main application logic
- **Spaced Repetition System**: Intelligent word prioritization
- **Progress Tracking**: Local storage management
- **UI Management**: Tab switching and modal handling

## 📝 Vocabulary Data

The extension includes a comprehensive list of GRE vocabulary words with:
- Word definitions
- Part of speech
- Example usage (where available)
- Randomized presentation to prevent pattern recognition

## 🎨 Customization

### Adding New Words
1. Edit `words_randomized.txt` to add new vocabulary
2. Update the `SHUFFLED_GRE_WORDS` array in `words.js`
3. Reload the extension

### Styling
- Modify `styles.css` to customize the appearance
- The extension uses CSS Grid and Flexbox for responsive design
- Color scheme and animations can be easily adjusted

## Development

### Prerequisites
- Chrome browser
- Basic knowledge of HTML, CSS, and JavaScript

### Local Development
1. Make changes to the source files
2. Reload the extension in `chrome://extensions/`
3. Test changes in the extension popup

### Debugging
- Use Chrome DevTools to debug the extension
- Check the console for any JavaScript errors
- Monitor localStorage for progress data

## Future Enhancements

- [ ] Export progress data
- [ ] Additional study modes (fill-in-the-blank, sentence completion)
- [ ] Audio pronunciation
- [ ] Cloud sync for progress across devices
- [ ] Custom word lists
- [ ] Study reminders and notifications

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- GRE vocabulary data compiled from various educational resources
- Inspired by spaced repetition learning principles
- Built with modern web technologies for optimal performance



---

**Happy studying! 🎓**

*This extension is designed to help you conquer the GRE Verbal Reasoning section through systematic vocabulary building and retention.* 
