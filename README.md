# Accessibility AI

A comprehensive web application that leverages AI to break digital barriers and provide advanced accessibility features for all users.

## 🌟 Features

### AI-Powered Bento Box
- **Voice Navigation**: Navigate interfaces using voice commands with zero latency
- **Screen Reader AI**: Deep content understanding with intelligent image and layout descriptions
- **Real-time Captions**: Medical-grade accurate captions for all audio interactions
- **Sign Language Translation**: Vision-based sign language to text conversion
- **Smart Contrast**: Dynamic color adjustments tailored to individual visual needs
- **Secure Authentication**: Advanced biometric and multi-factor security

### Interactive Dashboard
- Real-time accessibility statistics
- Accessibility score trend visualization using Recharts
- Comprehensive compliance metrics

### Security Features
- JWT-based authentication
- Rate limiting and brute-force protection
- Input validation and sanitization
- Secure password hashing with bcrypt
- CORS and Helmet security middleware

## 🚀 Tech Stack

### Frontend
- React 19 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Framer Motion for animations
- Recharts for data visualization

### Backend
- Node.js with Express
- Google Generative AI (Gemini) integration
- JWT for authentication
- Security middleware (Helmet, CORS, Rate Limiting)

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone https://github.com/tejaskute284-dotcom/ai-acessiblity.git
cd ai-acessiblity
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd server
npm install
cd ..
```

4. Create a `.env` file in the `server` directory (optional):
```env
PORT=5000
JWT_SECRET=your-secret-key-here
GEMINI_API_KEY=your-gemini-api-key-here
```

## 🎯 Usage

### Development Mode

1. Start the backend server:
```bash
cd server
node index.js
```

2. In a new terminal, start the frontend development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Production Build

```bash
npm run build
```

## 🔑 Key Features

### Authentication Flow
1. Click "Join Us" in the navigation bar
2. Register a new account or login
3. Access the dashboard after successful authentication

### AI Features
- Click on any feature card in the Bento Box to interact with AI
- Receive real-time, context-aware responses
- Experience smooth animations and visual feedback

### Dashboard
- View accessibility statistics
- Track compliance levels
- Monitor accessibility score trends over time

## 🛡️ Security

- All sensitive data is protected with environment variables
- Passwords are hashed using bcrypt
- JWT tokens for secure session management
- Rate limiting to prevent abuse
- Input validation on all endpoints

## 📝 License

This project is licensed under the ISC License.

## 👥 Author

TEJAS & Wisdom King AR

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Support

For support, please open an issue in the GitHub repository.
