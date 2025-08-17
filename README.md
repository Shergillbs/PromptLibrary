# 📚 PromptLibrary

> A powerful, full-stack web application for managing, organizing, and reusing AI prompt templates with dynamic variables.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-blue.svg)](https://sqlite.org/)

## 🎯 Overview

PromptLibrary is a comprehensive prompt management solution designed for AI-first developers, content creators, and LLM power users. It provides an intuitive interface to create, organize, and reuse prompt templates with dynamic variable replacement, making your AI workflows more efficient and organized.

### ✨ Key Features

- **📝 Smart Prompt Templates** - Create prompts with `{{variable}}` placeholders for dynamic content
- **📁 Folder Organization** - Organize prompts into custom folders and categories
- **🏷️ Tag System** - Tag prompts for easy filtering and discovery
- **🎯 Dynamic Generation** - Fill variables in real-time to generate final prompts
- **📋 One-Click Copy** - Copy generated prompts to clipboard instantly
- **📊 Usage Analytics** - Track how often prompts are used
- **👍 Rating System** - Up/down vote prompts to identify your best templates
- **🔍 Powerful Search** - Search across titles, descriptions, content, and tags
- **📱 Responsive Design** - Works seamlessly on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/PromptLibrary.git
   cd PromptLibrary
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   Frontend: http://localhost:5173
   Backend API: http://localhost:3001
   ```

## 💡 Usage Examples

### Creating a Prompt Template

1. Click **"+ New Prompt"**
2. Add a title: `"Blog Post Outline Generator"`
3. Add description: `"Creates structured outlines for blog posts"`
4. Create your template:
   ```
   Create a comprehensive blog post outline for the topic: {{topic}}
   
   Target audience: {{audience}}
   Tone: {{tone}}
   Word count goal: {{word_count}}
   
   Include:
   - Engaging introduction hook
   - 3-5 main sections with key points
   - Conclusion with call-to-action
   ```

### Using Dynamic Variables

When you click **"🎯 Generate"**, you'll see a form to fill in:
- `topic`: "AI in Healthcare"
- `audience`: "Healthcare professionals"
- `tone`: "Professional yet accessible"
- `word_count`: "1500 words"

The final prompt gets generated with your variables filled in, ready to copy and use with any AI model.

### Organization & Discovery

- **Folders**: Organize prompts by use case (Marketing, Development, Content Creation)
- **Tags**: Add tags like `blog`, `technical`, `marketing` for quick filtering
- **Search**: Find prompts instantly by searching any text content
- **Ratings**: Vote on prompts to surface your most effective templates

## 🏗️ Architecture

PromptLibrary follows a clean, full-stack architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │────│  Express API    │────│  SQLite Database│
│   (Port 5173)   │    │  (Port 3001)    │    │   (Local File)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

**Frontend:**
- ⚛️ React 18 with modern hooks
- 🏗️ Vite for fast development and building
- 🎨 CSS with responsive design
- 🧭 React Router for navigation

**Backend:**
- 🟢 Node.js with Express.js
- 🗄️ SQLite database for simplicity and portability
- 🔄 RESTful API design
- 🔒 CORS enabled for development

**Development:**
- 📦 Monorepo structure
- 🔄 Concurrently for parallel dev servers
- 🔧 Environment-based configuration

## 📊 Database Schema

```sql
-- Folders for organizing prompts
CREATE TABLE folders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Main prompts table
CREATE TABLE prompts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  body TEXT NOT NULL,           -- Contains {{variables}}
  tags TEXT,                    -- Comma-separated
  folder_id INTEGER,            -- FK to folders
  copy_count INTEGER DEFAULT 0, -- Usage tracking
  up_votes INTEGER DEFAULT 0,   -- Rating system
  down_votes INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL
);
```

## 🛠️ API Reference

### Prompts Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/prompts` | Get all prompts (with optional filters) |
| `POST` | `/api/prompts` | Create a new prompt |
| `PUT` | `/api/prompts/:id` | Update a prompt |
| `DELETE` | `/api/prompts/:id` | Delete a prompt |
| `POST` | `/api/prompts/:id/copy` | Increment copy count |
| `POST` | `/api/prompts/:id/vote` | Vote on a prompt |

### Folders Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/folders` | Get all folders |
| `POST` | `/api/folders` | Create a new folder |
| `PUT` | `/api/folders/:id` | Update a folder |
| `DELETE` | `/api/folders/:id` | Delete a folder |

For detailed API documentation, see [docs/api-documentation.md](docs/api-documentation.md).

## 🚀 Deployment

### Local Development

```bash
# Install dependencies
npm run install:all

# Start development servers (frontend + backend)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Production Deployment

The application can be deployed to various platforms:

- **Vercel/Netlify**: Frontend static files
- **Railway/Render**: Full-stack with backend
- **Docker**: Containerized deployment
- **VPS**: Traditional server deployment

See [docs/deployment.md](docs/deployment.md) for detailed deployment guides.

## 📝 Project Structure

```
PromptLibrary/
├── README.md                 # This file
├── package.json             # Root package configuration
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API client
│   │   └── App.jsx         # Main application
│   └── package.json
├── backend/                 # Express API server
│   ├── routes/              # API route handlers
│   ├── database.js          # Database connection
│   ├── server.js           # Express server
│   └── package.json
└── docs/                   # Documentation
    ├── architecture.md      # System architecture
    ├── api-documentation.md # API reference
    ├── deployment.md       # Deployment guides
    └── prompt.md           # LLM recreation template
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and add tests if applicable
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style and patterns
- Write descriptive commit messages
- Update documentation for new features
- Test your changes thoroughly
- Keep the codebase clean and well-commented

## 🧪 Testing

```bash
# Run frontend tests
cd frontend && npm test

# Run backend tests
cd backend && npm test

# Run integration tests
npm run test:integration
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=3001
NODE_ENV=development
DB_PATH=./data/prompts.db
CORS_ORIGIN=http://localhost:5173
```

### Customization

- **Styling**: Modify CSS in `frontend/src/index.css`
- **Database**: Switch from SQLite to PostgreSQL/MySQL if needed
- **Features**: Add new API endpoints and React components

## 📚 Documentation

- [System Architecture](docs/architecture.md) - Detailed technical architecture
- [API Documentation](docs/api-documentation.md) - Complete API reference
- [Deployment Guide](docs/deployment.md) - How to deploy to production
- [LLM Recreation Template](docs/prompt.md) - Template for recreating this project

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built as part of the AI-First Development course
- Inspired by the need for better prompt management in AI workflows
- Thanks to the open-source community for excellent tools and libraries

## 📞 Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/PromptLibrary/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/PromptLibrary/discussions)
- 📧 **Email**: your.email@example.com

---

**⭐ If you find PromptLibrary useful, please star this repository!**

Made with ❤️ for the AI development community.
