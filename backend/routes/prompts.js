import express from 'express';

const router = express.Router();

// Utility function to extract variables from prompt body
function extractVariables(text) {
  const variableRegex = /\{\{([^}]+)\}\}/g;
  const variables = [];
  let match;
  
  while ((match = variableRegex.exec(text)) !== null) {
    const variable = match[1].trim();
    if (!variables.includes(variable)) {
      variables.push(variable);
    }
  }
  
  return variables;
}

// GET /api/prompts - Get all prompts with optional filtering
router.get('/', async (req, res) => {
  try {
    const { folder_id, tags } = req.query;
    
    // Parse tags if provided
    const tagArray = tags ? tags.split(',').map(tag => tag.trim()) : null;
    
    const prompts = await req.db.getAllPrompts(
      folder_id ? parseInt(folder_id) : null,
      tagArray
    );
    
    // Add extracted variables to each prompt
    const promptsWithVariables = prompts.map(prompt => ({
      ...prompt,
      variables: extractVariables(prompt.body)
    }));
    
    res.json(promptsWithVariables);
  } catch (error) {
    console.error('Error fetching prompts:', error);
    res.status(500).json({ error: 'Failed to fetch prompts' });
  }
});

// GET /api/prompts/:id - Get single prompt by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const prompt = await req.db.getPromptById(parseInt(id));
    
    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }
    
    // Add extracted variables
    prompt.variables = extractVariables(prompt.body);
    
    res.json(prompt);
  } catch (error) {
    console.error('Error fetching prompt:', error);
    res.status(500).json({ error: 'Failed to fetch prompt' });
  }
});

// POST /api/prompts - Create new prompt
router.post('/', async (req, res) => {
  try {
    const { title, description, body, tags, folder_id } = req.body;
    
    // Validation
    if (!title || !body) {
      return res.status(400).json({ 
        error: 'Title and body are required' 
      });
    }
    
    const promptData = {
      title: title.trim(),
      description: description?.trim() || null,
      body: body.trim(),
      tags: tags?.trim() || null,
      folder_id: folder_id ? parseInt(folder_id) : null
    };
    
    const newPrompt = await req.db.createPrompt(promptData);
    
    // Add extracted variables
    newPrompt.variables = extractVariables(newPrompt.body);
    
    res.status(201).json(newPrompt);
  } catch (error) {
    console.error('Error creating prompt:', error);
    
    if (error.message && error.message.includes('FOREIGN KEY')) {
      return res.status(400).json({ error: 'Invalid folder_id' });
    }
    
    res.status(500).json({ error: 'Failed to create prompt' });
  }
});

// PUT /api/prompts/:id - Update prompt
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, body, tags, folder_id } = req.body;
    
    // Validation
    if (!title || !body) {
      return res.status(400).json({ 
        error: 'Title and body are required' 
      });
    }
    
    // Check if prompt exists
    const existingPrompt = await req.db.getPromptById(parseInt(id));
    if (!existingPrompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }
    
    const promptData = {
      title: title.trim(),
      description: description?.trim() || null,
      body: body.trim(),
      tags: tags?.trim() || null,
      folder_id: folder_id ? parseInt(folder_id) : null
    };
    
    const updatedPrompt = await req.db.updatePrompt(parseInt(id), promptData);
    
    // Add extracted variables
    updatedPrompt.variables = extractVariables(updatedPrompt.body);
    
    res.json(updatedPrompt);
  } catch (error) {
    console.error('Error updating prompt:', error);
    
    if (error.message && error.message.includes('FOREIGN KEY')) {
      return res.status(400).json({ error: 'Invalid folder_id' });
    }
    
    res.status(500).json({ error: 'Failed to update prompt' });
  }
});

// DELETE /api/prompts/:id - Delete prompt
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await req.db.deletePrompt(parseInt(id));
    
    if (!result.deleted) {
      return res.status(404).json({ error: 'Prompt not found' });
    }
    
    res.json({ message: 'Prompt deleted successfully' });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    res.status(500).json({ error: 'Failed to delete prompt' });
  }
});

// POST /api/prompts/:id/copy - Increment copy count
router.post('/:id/copy', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await req.db.incrementCopyCount(parseInt(id));
    
    if (!result.updated) {
      return res.status(404).json({ error: 'Prompt not found' });
    }
    
    res.json({ message: 'Copy count incremented' });
  } catch (error) {
    console.error('Error incrementing copy count:', error);
    res.status(500).json({ error: 'Failed to increment copy count' });
  }
});

// POST /api/prompts/:id/vote - Submit vote (up or down)
router.post('/:id/vote', async (req, res) => {
  try {
    const { id } = req.params;
    const { vote_type } = req.body;
    
    if (!vote_type || !['up', 'down'].includes(vote_type)) {
      return res.status(400).json({ 
        error: 'vote_type must be "up" or "down"' 
      });
    }
    
    const result = await req.db.votePrompt(parseInt(id), vote_type);
    
    if (!result.updated) {
      return res.status(404).json({ error: 'Prompt not found' });
    }
    
    res.json({ message: `${vote_type} vote recorded` });
  } catch (error) {
    console.error('Error recording vote:', error);
    res.status(500).json({ error: 'Failed to record vote' });
  }
});

// POST /api/prompts/parse - Extract variables from text
router.post('/parse', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const variables = extractVariables(text);
    
    res.json({ variables });
  } catch (error) {
    console.error('Error parsing variables:', error);
    res.status(500).json({ error: 'Failed to parse variables' });
  }
});

// POST /api/prompts/:id/generate - Generate prompt with filled variables
router.post('/:id/generate', async (req, res) => {
  try {
    const { id } = req.params;
    const { variables } = req.body;
    
    const prompt = await req.db.getPromptById(parseInt(id));
    
    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }
    
    // Replace variables in the prompt body
    let generatedPrompt = prompt.body;
    
    if (variables && typeof variables === 'object') {
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
        generatedPrompt = generatedPrompt.replace(regex, value || `{{${key}}}`);
      });
    }
    
    res.json({
      original_prompt: prompt,
      generated_prompt: generatedPrompt,
      variables_used: variables || {}
    });
  } catch (error) {
    console.error('Error generating prompt:', error);
    res.status(500).json({ error: 'Failed to generate prompt' });
  }
});

export default router;
