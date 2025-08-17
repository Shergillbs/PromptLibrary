import React, { useState, useEffect } from 'react'
import { promptsAPI, foldersAPI, utils } from './services/api'
import CreatePromptForm from './components/CreatePromptForm'
import PromptGenerator from './components/PromptGenerator'

function App() {
  const [prompts, setPrompts] = useState([])
  const [folders, setFolders] = useState([])
  const [selectedFolder, setSelectedFolder] = useState(null)
  const [selectedTags, setSelectedTags] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load initial data
  useEffect(() => {
    loadData()
  }, [])

  // Reload prompts when filters change
  useEffect(() => {
    if (!loading) {
      loadPrompts()
    }
  }, [selectedFolder, selectedTags])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [promptsData, foldersData] = await Promise.all([
        promptsAPI.getAll(),
        foldersAPI.getAll()
      ])
      
      setPrompts(promptsData)
      setFolders(foldersData)
    } catch (err) {
      setError('Failed to load data: ' + err.message)
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadPrompts = async () => {
    try {
      const filters = {}
      if (selectedFolder) {
        filters.folder_id = selectedFolder
      }
      if (selectedTags.length > 0) {
        filters.tags = selectedTags
      }
      
      const promptsData = await promptsAPI.getAll(filters)
      setPrompts(promptsData)
    } catch (err) {
      setError('Failed to load prompts: ' + err.message)
      console.error('Error loading prompts:', err)
    }
  }

  const handleVote = async (promptId, voteType) => {
    try {
      await promptsAPI.vote(promptId, voteType)
      await loadPrompts() // Reload to get updated vote counts
    } catch (err) {
      setError('Failed to record vote: ' + err.message)
    }
  }

  const handleCopyPrompt = async (prompt) => {
    try {
      const success = await utils.copyToClipboard(prompt.body)
      if (success) {
        await promptsAPI.incrementCopy(prompt.id)
        await loadPrompts() // Reload to get updated copy count
        // Show success message (you could add a toast notification here)
      }
    } catch (err) {
      setError('Failed to copy prompt: ' + err.message)
    }
  }

  const handleDeletePrompt = async (promptId) => {
    if (!window.confirm('Are you sure you want to delete this prompt?')) {
      return
    }
    
    try {
      await promptsAPI.delete(promptId)
      await loadPrompts()
    } catch (err) {
      setError('Failed to delete prompt: ' + err.message)
    }
  }

  // Filter prompts based on search query
  const filteredPrompts = prompts.filter(prompt => {
    if (!searchQuery.trim()) return true
    
    const query = searchQuery.toLowerCase()
    return (
      prompt.title.toLowerCase().includes(query) ||
      (prompt.description && prompt.description.toLowerCase().includes(query)) ||
      prompt.body.toLowerCase().includes(query) ||
      (prompt.tags && prompt.tags.toLowerCase().includes(query))
    )
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PromptLibrary...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-full px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              📚 PromptLibrary
            </h1>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              + New Prompt
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Folders */}
        <aside className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
          <div className="mb-4">
            <h2 className="font-semibold text-gray-900 mb-3">Folders</h2>
            <div className="space-y-2">
              <button 
                onClick={() => setSelectedFolder(null)}
                className={`w-full text-left px-3 py-2 rounded ${
                  selectedFolder === null ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                }`}
              >
                All Prompts
              </button>
              {folders.map(folder => (
                <button 
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                  className={`w-full text-left px-3 py-2 rounded ${
                    selectedFolder === folder.id ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                  }`}
                >
                  📁 {folder.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <section className={`flex-1 p-6 overflow-y-auto ${selectedPrompt ? 'mr-80' : ''}`}>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedFolder ? folders.find(f => f.id === selectedFolder)?.name : 'All Prompts'}
                </h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search prompts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              
              {filteredPrompts.length === 0 ? (
                <div className="card p-8 text-center">
                  <div className="text-gray-400 text-4xl mb-4">
                    {prompts.length === 0 ? '📝' : '🔍'}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {prompts.length === 0 ? 'No prompts yet' : 'No prompts found'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {prompts.length === 0 
                      ? 'Create your first prompt template to get started'
                      : `No prompts match "${searchQuery}". Try a different search term.`
                    }
                  </p>
                  {prompts.length === 0 && (
                    <button 
                      onClick={() => setShowCreateForm(true)}
                      className="btn-primary"
                    >
                      Create First Prompt
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPrompts.map(prompt => (
                    <div key={prompt.id} className="card p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-medium text-gray-900">{prompt.title}</h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            Used {prompt.copy_count} times
                          </span>
                          <div className="flex items-center space-x-1">
                            <button 
                              onClick={() => handleVote(prompt.id, 'up')}
                              className="text-green-600 hover:text-green-700"
                            >
                              👍 {prompt.up_votes}
                            </button>
                            <button 
                              onClick={() => handleVote(prompt.id, 'down')}
                              className="text-red-600 hover:text-red-700"
                            >
                              👎 {prompt.down_votes}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {prompt.description && (
                        <p className="text-gray-600 mb-3">{prompt.description}</p>
                      )}
                      
                      <div className="bg-gray-50 p-4 rounded-lg mb-3">
                        <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                          {prompt.body}
                        </pre>
                      </div>
                      
                      {prompt.tags && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {prompt.tags.split(',').map((tag, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                            >
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={() => setSelectedPrompt(prompt)}
                          className="btn-primary text-sm"
                        >
                          🎯 Generate
                        </button>
                        <button 
                          onClick={() => handleCopyPrompt(prompt)}
                          className="btn-secondary text-sm"
                        >
                          📋 Copy
                        </button>
                        <button className="btn-secondary text-sm">
                          ✏️ Edit
                        </button>
                        <button 
                          onClick={() => handleDeletePrompt(prompt.id)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
        </section>

        {/* Right Sidebar - Prompt Generator */}
        {selectedPrompt && (
          <div className="fixed right-0 top-16 bottom-0 w-80 z-40">
            <PromptGenerator 
              prompt={selectedPrompt}
              onClose={() => setSelectedPrompt(null)}
              onError={setError}
            />
          </div>
        )}
      </main>

      {/* Error Message */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Create Form Modal */}
      {showCreateForm && (
        <CreatePromptForm 
          folders={folders}
          onClose={() => setShowCreateForm(false)}
          onSuccess={loadPrompts}
          onError={setError}
        />
      )}
    </div>
  )
}

export default App
