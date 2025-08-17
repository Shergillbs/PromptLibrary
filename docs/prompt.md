# 🤖 LLM Recreation Template: PromptLibrary

**Build a full-stack prompt management app with dynamic variable replacement.**

## 🎯 Requirements

Create "PromptLibrary" - a React + Node.js app for managing AI prompt templates with:
- Smart templates with `{{variable}}` placeholders
- Dynamic variable filling and prompt generation
- Folder organization and tag filtering
- Usage tracking (copy count) and voting system
- Search functionality and clipboard integration

## 🏗️ Tech Stack & Structure

```
PromptLibrary/
├── package.json              # Root: concurrently scripts
├── backend/                  # Node.js + Express + SQLite
│   ├── server.js            # Express server with CORS
│   ├── database.js          # SQLite wrapper class
│   ├── routes/prompts.js    # CRUD + vote/copy endpoints
│   ├── routes/folders.js    # Folder management
│   └── .env                 # PORT=3001, DB_PATH=./data/prompts.db
└── frontend/                 # React + Vite
    ├── src/App.jsx          # Main component with state management
    ├── components/CreatePromptForm.jsx
    ├── components/PromptGenerator.jsx
    └── services/api.js      # API client functions
```

## 📊 Database Schema

```sql
CREATE TABLE folders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prompts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  body TEXT NOT NULL,                  -- Contains {{variables}}
  tags TEXT,                          -- Comma-separated
  folder_id INTEGER,
  copy_count INTEGER DEFAULT 0,
  up_votes INTEGER DEFAULT 0,
  down_votes INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL
);
```

## 🔧 Key Implementation Steps

1. **Setup**: `npm init` root with concurrently, create backend/frontend dirs
2. **Backend**: Express server, SQLite database class, API routes for CRUD operations
3. **Frontend**: React app with state management, prompt list/cards, modal forms
4. **Variable System**: RegEx `/\{\{([^}]+)\}\}/g` to extract/replace variables
5. **API Integration**: Fetch-based API client with error handling

## 🎨 Core Features Implementation

**Variable Extraction**: Parse `{{var}}` patterns from prompt text
**Dynamic Generation**: Replace variables with user input values  
**Folder Organization**: Optional folder assignment with cascade delete
**Search & Filter**: Client-side filtering by text, tags, folders
**Usage Analytics**: Increment copy count on clipboard operations
**Voting System**: Up/down votes with database persistence

## 💡 UI Layout

Three-column layout:
- **Left**: Folder navigation sidebar
- **Center**: Prompt cards with actions (Generate/Copy/Edit/Delete/Vote)
- **Right**: Variable input form (slides in when generating)

## 🚀 Development Commands

```bash
npm run install:all    # Install all dependencies
npm run dev           # Start both servers concurrently
```

## 📝 Sample Data

```sql
INSERT INTO folders (name) VALUES ('Marketing'), ('Development'), ('Content');
INSERT INTO prompts (title, body, tags, folder_id) VALUES 
('Blog Outline', 'Create outline for {{topic}} targeting {{audience}}', 'blog,content', 3),
('Code Review', 'Review this {{language}} code: {{code}}', 'development', 2);
```

**Key APIs**: GET/POST/PUT/DELETE `/api/prompts`, `/api/folders`, plus `/api/prompts/:id/copy` and `/api/prompts/:id/vote`

**Frontend State**: prompts[], folders[], selectedFolder, searchQuery, selectedPrompt, loading, error

**Critical Functions**: 
- extractVariables() - parse template variables
- copyToClipboard() - browser clipboard API
- Dynamic form generation based on extracted variables

This template provides everything needed to recreate the complete PromptLibrary application.
