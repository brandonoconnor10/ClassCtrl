# ClassCtrl 🎯

ClassCtrl is a classroom noise monitoring and management tool designed to help maintain engagement and encourage positive classroom behavior. It includes real-time sound level monitoring, a challenge timer, and a dynamic leaderboard system.

⚠️ Note: This application is optimized for desktop use and is not mobile responsive.

## 🚀 Features

- Real-time microphone noise monitoring
- Visual sound level indicator
- Countdown challenge timer with pause/resume
- Leaderboard system for tracking performance
- Multi-page structure (Homepage, Monitor, Leaderboard)

## 🛠 Tech Stack

- JavaScript (ES6+)
- Web Audio API (Microphone input + sound analysis)
- HTML5 & CSS3
- Modular JavaScript architecture

## 🔊 How Noise Monitoring Works

- Uses the Web Audio API to access the user’s microphone.
- Analyzes live audio input.
- Calculates sound intensity levels.
- Updates UI dynamically based on noise thresholds.

## 🧠 Application Structure

The application separates concerns into:

- Audio processing logic
- State management
- UI updates
- Leaderboard handling

This modular structure improves readability and maintainability.

## 🏆 Leaderboard Logic

- Tracks classroom performance during timed challenges
- Dynamically updates scores
- Maintains session-based results

## 📚 What I Learned

- Working with browser audio APIs
- Real-time data processing
- Managing application state across multiple pages
- Structuring modular JavaScript applications
