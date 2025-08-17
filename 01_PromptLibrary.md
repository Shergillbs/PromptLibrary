

## 1. Vision & Overview
Large-language-model workflows live and die by good prompts. *PromptLibrary* lets individual users **collect, edit, tag and re-use prompt templates** with dynamic variables.
The initial release is a **single-user CRUD web app** that supports:

1. Creating a prompt template with placeholder variables  
2. Filling variables to generate a final prompt string  
3. Organising templates by tags/folders
4. Copy-to-clipboard & basic usage-count tracking  
5. Up/down voting on prompts

---

## 2. Personas
| Persona  | Goals | Pain Points |
|----------|-------|-------------|
| **AI-first Developer** | Keep a personal vault of prompts, iterate quickly | Prompts scattered across docs & chat histories |
| **Content Creator** | Re-use prompts for social posts & blogs | Hard to remember which prompt worked best |
| **LLM Power User** | Wants to have the perfect prompt for every use case and every model | Comparing prompts performance for different models |

---

## 3. Core User Stories
1. **Create Prompt** – As a user I can add a new prompt template with a title, description, body text and 🌟 `{{variable}}` place-holders.  
2. **Edit / Delete Prompt** – I can update or remove templates I no longer need.  
3. **Tag Prompts** – I can assign one or more tags to a template and filter by tag.  
4. **Generate Prompt** – I can fill in variables in a small form and copy the final prompt to clipboard.  
5. **View Stats** – Each template shows how many times it was copied (basic effectiveness metric).
6. **Up/Down Vote** – Each template can be up/down voted by the user. We can rank prompts in each category by rating. We can rate prompt performance for different models.

---

## 4. MVP Features & Cut-Lines
| Feature | MVP? | Notes |
|---------|------|-------|
| Prompt CRUD (title, body, tags) | ✅ | Required |
| Variable detection (`{{var}}`) | ✅ | Simple regex |
| Prompt generation UI + copy | ✅ | Clipboard API |
| Tag filtering | ✅ | Multi-select dropdown |
| Folder Organization | ✅ | Create folders to organize prompts, view prompts in folders |
| Usage counter | ✅ | Increment on copy |
| Up/Down voting per prompt & model | ✅ | Increment on vote |
| User authentication | ❌ | Single-user for now ( account acts as owner) |
| Sharing / Public prompts | ❌ stretch | Later via Supabase row-level-security |
| LLM API execution | ❌ stretch | Could call OpenAI/Claude/Gemini for A/B testing |


---

## 5. Technical Decisions
| Area | Decision | Rationale |
|------|----------|-----------|
| 
| **Stack** | React + Vite front-end; Express + SQLite back-end | Simple, zero-config on  |
| **Persist­ence** |  key-value OR SQLite file | No external signup needed |
| **Styling** | Tailwind CSS (via CDN to avoid build config) | Fast, utility-first |
| **Auth** |  project owner session; single user | Keep first project friction-free |

| **AI Use** |  Agent generates boilerplate, adds DB later, can integrate LLM APIs | Demonstrates AI-assisted workflow |

---

## 6. Data Model (tiny!)
```sql
-- SQLite schema
CREATE TABLE folders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prompts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,          -- optional description
  body TEXT NOT NULL,        -- contains {{variables}}
  tags TEXT,                 -- comma-separated
  folder_id INTEGER,         -- optional folder assignment
  copy_count INTEGER DEFAULT 0,
  up_votes INTEGER DEFAULT 0,
  down_votes INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL
);


```

---

## 7. Tests-to-Pass (Acceptance Criteria)
| ID | Test | How to Verify |
|----|------|---------------|
| **P-01** | User can add a prompt with at least one `{{variable}}`. | Cypress: fill form → list shows new prompt. |
| **P-02** | Variable placeholder list auto-detected. | Unit: POST `/api/parse` → returns `["variable"]`. |
| **P-03** | Copy button increases `copy_count`. | E2E: click copy twice → list shows count = 2. |
| **P-04** | Tag filter narrows list. | UI: select tag "blog" → only tagged prompts visible. |
| **P-05** | Folder filter narrows list. | UI: select folder "blog" → only prompts in folder visible. |
| **P-06** | Up/Down voting per prompt & model. | UI: click up/down vote button → rating percentage changes. |


---

## 8. AI-First Workflow Guide (Learner Steps)

1. **Create new App** → choose *"Node.js + React"* template.  
2. **Draft a single prompt** to  AI Agent with reasoning model:  
   > "Build a minimal CRUD app called PromptLibrary … [copy 80 % of PRD]"  
3. **Iterate and Test**:  
    - Add a database
    - Add remaining features from PRD
    - Add stretch goals
    - Customize the UI
    - Change styling to your liking
    - Work on mobile responsiveness
4. **Deploy** with  Deploy. Test in browser.  
5. **Download ZIP** (`⋯ → Download as zip`).  
6. **Open in Cursor** locally:  
   * `npm install && npm run dev`  
   * Ask Cursor Agent: "Explain the project architecture file-by-file."  
   * Ask more questions to the agent to understand the project and the code.
7. **Document learning goals**
    - go through the learning_goals.md file and select which items you encountered in this project.
    - create .md notes for each learning goal covered in this project. Use AI to help you with this.
    - if you encountered any other learnings not covered in the learning_goals.md file, create .md notes for them.
8. **Share your Proof-of-Competence**
    - add project to your public github.
    - create and share a thread or video of you using the app and sharing your learnings.
    - put your repo on your github profile and share with people.

