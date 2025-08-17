import express from 'express';

const router = express.Router();

// GET /api/folders - Get all folders with prompt counts
router.get('/', async (req, res) => {
  try {
    const folders = await req.db.getAllFolders();
    res.json(folders);
  } catch (error) {
    console.error('Error fetching folders:', error);
    res.status(500).json({ error: 'Failed to fetch folders' });
  }
});

// POST /api/folders - Create new folder
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    
    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ 
        error: 'Folder name is required' 
      });
    }
    
    const folderName = name.trim();
    
    // Check for duplicate names
    const existingFolders = await req.db.getAllFolders();
    const duplicateName = existingFolders.find(
      folder => folder.name.toLowerCase() === folderName.toLowerCase()
    );
    
    if (duplicateName) {
      return res.status(400).json({ 
        error: 'Folder name already exists' 
      });
    }
    
    const newFolder = await req.db.createFolder(folderName);
    
    res.status(201).json({
      ...newFolder,
      prompt_count: 0
    });
  } catch (error) {
    console.error('Error creating folder:', error);
    
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Folder name already exists' });
    }
    
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

// DELETE /api/folders/:id - Delete folder
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await req.db.deleteFolder(parseInt(id));
    
    if (!result.deleted) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    
    res.json({ 
      message: 'Folder deleted successfully. Associated prompts moved to no folder.' 
    });
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
});

export default router;
