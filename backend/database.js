import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class Database {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const dbPath = join(__dirname, 'data', 'prompts.db');
      
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
        } else {
          console.log('📁 Connected to SQLite database');
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  async createTables() {
    return new Promise((resolve, reject) => {
      const createFoldersTable = `
        CREATE TABLE IF NOT EXISTS folders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      const createPromptsTable = `
        CREATE TABLE IF NOT EXISTS prompts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          body TEXT NOT NULL,
          tags TEXT,
          folder_id INTEGER,
          copy_count INTEGER DEFAULT 0,
          up_votes INTEGER DEFAULT 0,
          down_votes INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL
        )
      `;

      // Create tables sequentially
      this.db.run(createFoldersTable, (err) => {
        if (err) {
          console.error('Error creating folders table:', err);
          reject(err);
          return;
        }

        this.db.run(createPromptsTable, (err) => {
          if (err) {
            console.error('Error creating prompts table:', err);
            reject(err);
            return;
          }

          console.log('✅ Database tables created successfully');
          this.seedSampleData().then(resolve).catch(reject);
        });
      });
    });
  }

  async seedSampleData() {
    return new Promise((resolve, reject) => {
      // Check if we already have data
      this.db.get('SELECT COUNT(*) as count FROM prompts', (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        if (row.count === 0) {
          // Insert sample folders
          const sampleFolders = [
            'Content Creation',
            'Development',
            'Learning'
          ];

          const insertFolder = this.db.prepare('INSERT INTO folders (name) VALUES (?)');
          
          sampleFolders.forEach(folderName => {
            insertFolder.run(folderName);
          });
          
          insertFolder.finalize();

          // Insert sample prompts
          const samplePrompts = [
            {
              title: 'Blog Post Outline',
              description: 'Generate a structured outline for blog posts',
              body: 'Create a detailed outline for a blog post about {{topic}}. Include:\n\n1. Catchy headline\n2. Introduction hook\n3. 3-5 main points\n4. Conclusion with call-to-action\n\nTarget audience: {{audience}}\nTone: {{tone}}',
              tags: 'blog,content,writing',
              folder_id: 1
            },
            {
              title: 'Code Review Checklist',
              description: 'Systematic code review prompt for any programming language',
              body: 'Please review this {{language}} code for:\n\n1. Code quality and readability\n2. Performance optimizations\n3. Security vulnerabilities\n4. Best practices adherence\n5. Testing coverage\n\nCode:\n{{code}}\n\nProvide specific suggestions for improvement.',
              tags: 'development,review,quality',
              folder_id: 2
            },
            {
              title: 'Explain Like I\'m 5',
              description: 'Break down complex topics into simple explanations',
              body: 'Explain {{concept}} as if you\'re talking to a 5-year-old. Use:\n\n- Simple words and short sentences\n- Fun analogies and examples\n- Interactive questions\n- Visual descriptions\n\nMake it engaging and easy to understand!',
              tags: 'learning,education,simple',
              folder_id: 3
            }
          ];

          const insertPrompt = this.db.prepare(`
            INSERT INTO prompts (title, description, body, tags, folder_id, copy_count, up_votes, down_votes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);

          samplePrompts.forEach(prompt => {
            insertPrompt.run(
              prompt.title,
              prompt.description,
              prompt.body,
              prompt.tags,
              prompt.folder_id,
              Math.floor(Math.random() * 20), // Random copy count
              Math.floor(Math.random() * 10), // Random up votes
              Math.floor(Math.random() * 3)   // Random down votes
            );
          });

          insertPrompt.finalize();

          console.log('🌱 Sample data seeded successfully');
        }

        resolve();
      });
    });
  }

  // Prompts operations
  async getAllPrompts(folderId = null, tags = null) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT p.*, f.name as folder_name 
        FROM prompts p 
        LEFT JOIN folders f ON p.folder_id = f.id
      `;
      const params = [];

      if (folderId) {
        query += ' WHERE p.folder_id = ?';
        params.push(folderId);
      }

      if (tags && tags.length > 0) {
        const tagCondition = folderId ? ' AND' : ' WHERE';
        const tagParams = tags.map(() => '?').join(',');
        query += `${tagCondition} (${tags.map(() => 'p.tags LIKE ?').join(' OR ')})`;
        tags.forEach(tag => params.push(`%${tag}%`));
      }

      query += ' ORDER BY p.created_at DESC';

      this.db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async getPromptById(id) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT p.*, f.name as folder_name FROM prompts p LEFT JOIN folders f ON p.folder_id = f.id WHERE p.id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  async createPrompt(promptData) {
    return new Promise((resolve, reject) => {
      const { title, description, body, tags, folder_id } = promptData;
      
      this.db.run(
        'INSERT INTO prompts (title, description, body, tags, folder_id) VALUES (?, ?, ?, ?, ?)',
        [title, description || null, body, tags || null, folder_id || null],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...promptData });
        }
      );
    });
  }

  async updatePrompt(id, promptData) {
    return new Promise((resolve, reject) => {
      const { title, description, body, tags, folder_id } = promptData;
      
      this.db.run(
        'UPDATE prompts SET title = ?, description = ?, body = ?, tags = ?, folder_id = ? WHERE id = ?',
        [title, description || null, body, tags || null, folder_id || null, id],
        function(err) {
          if (err) reject(err);
          else resolve({ id, ...promptData });
        }
      );
    });
  }

  async deletePrompt(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM prompts WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve({ deleted: this.changes > 0 });
      });
    });
  }

  async incrementCopyCount(id) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE prompts SET copy_count = copy_count + 1 WHERE id = ?',
        [id],
        function(err) {
          if (err) reject(err);
          else resolve({ updated: this.changes > 0 });
        }
      );
    });
  }

  async votePrompt(id, voteType) {
    return new Promise((resolve, reject) => {
      const column = voteType === 'up' ? 'up_votes' : 'down_votes';
      
      this.db.run(
        `UPDATE prompts SET ${column} = ${column} + 1 WHERE id = ?`,
        [id],
        function(err) {
          if (err) reject(err);
          else resolve({ updated: this.changes > 0 });
        }
      );
    });
  }

  // Folders operations
  async getAllFolders() {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT f.*, COUNT(p.id) as prompt_count FROM folders f LEFT JOIN prompts p ON f.id = p.folder_id GROUP BY f.id ORDER BY f.name',
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  async createFolder(name) {
    return new Promise((resolve, reject) => {
      this.db.run('INSERT INTO folders (name) VALUES (?)', [name], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, name });
      });
    });
  }

  async deleteFolder(id) {
    return new Promise((resolve, reject) => {
      // First update prompts to remove folder reference
      this.db.run('UPDATE prompts SET folder_id = NULL WHERE folder_id = ?', [id], (err) => {
        if (err) {
          reject(err);
          return;
        }

        // Then delete the folder
        this.db.run('DELETE FROM folders WHERE id = ?', [id], function(err) {
          if (err) reject(err);
          else resolve({ deleted: this.changes > 0 });
        });
      });
    });
  }

  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('📁 Database connection closed');
        }
      });
    }
  }
}
