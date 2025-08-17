const API_BASE_URL = '/api';

// Generic API call helper
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
}

// Prompts API
export const promptsAPI = {
  // Get all prompts with optional filtering
  getAll: (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    if (filters.folder_id) {
      queryParams.append('folder_id', filters.folder_id);
    }
    
    if (filters.tags && filters.tags.length > 0) {
      queryParams.append('tags', filters.tags.join(','));
    }
    
    const endpoint = `/prompts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiCall(endpoint);
  },

  // Get single prompt by ID
  getById: (id) => apiCall(`/prompts/${id}`),

  // Create new prompt
  create: (promptData) => apiCall('/prompts', {
    method: 'POST',
    body: promptData,
  }),

  // Update prompt
  update: (id, promptData) => apiCall(`/prompts/${id}`, {
    method: 'PUT',
    body: promptData,
  }),

  // Delete prompt
  delete: (id) => apiCall(`/prompts/${id}`, {
    method: 'DELETE',
  }),

  // Increment copy count
  incrementCopy: (id) => apiCall(`/prompts/${id}/copy`, {
    method: 'POST',
  }),

  // Submit vote
  vote: (id, voteType) => apiCall(`/prompts/${id}/vote`, {
    method: 'POST',
    body: { vote_type: voteType },
  }),

  // Parse variables from text
  parseVariables: (text) => apiCall('/prompts/parse', {
    method: 'POST',
    body: { text },
  }),

  // Generate prompt with variables
  generate: (id, variables) => apiCall(`/prompts/${id}/generate`, {
    method: 'POST',
    body: { variables },
  }),
};

// Folders API
export const foldersAPI = {
  // Get all folders
  getAll: () => apiCall('/folders'),

  // Create new folder
  create: (name) => apiCall('/folders', {
    method: 'POST',
    body: { name },
  }),

  // Delete folder
  delete: (id) => apiCall(`/folders/${id}`, {
    method: 'DELETE',
  }),
};

// Utility functions
export const utils = {
  // Extract variables from prompt text (client-side)
  extractVariables: (text) => {
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
  },

  // Copy text to clipboard
  copyToClipboard: async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers or non-HTTPS
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        return successful;
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  },

  // Format date for display
  formatDate: (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  },

  // Calculate vote percentage
  calculateVotePercentage: (upVotes, downVotes) => {
    const total = upVotes + downVotes;
    if (total === 0) return 0;
    return Math.round((upVotes / total) * 100);
  },
};

export default {
  prompts: promptsAPI,
  folders: foldersAPI,
  utils,
};
