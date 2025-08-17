import React, { useState, useEffect } from 'react'
import { promptsAPI, utils } from '../services/api'

function PromptGenerator({ prompt, onClose, onError }) {
  const [variables, setVariables] = useState({})
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  // Initialize variables when prompt changes
  useEffect(() => {
    if (prompt && prompt.variables) {
      const initialVariables = {}
      prompt.variables.forEach(variable => {
        initialVariables[variable] = ''
      })
      setVariables(initialVariables)
      setGeneratedPrompt(prompt.body) // Start with original template
    }
  }, [prompt])

  // Update generated prompt in real-time as variables change
  useEffect(() => {
    if (prompt && prompt.body) {
      let updatedPrompt = prompt.body
      
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g')
        updatedPrompt = updatedPrompt.replace(regex, value || `{{${key}}}`)
      })
      
      setGeneratedPrompt(updatedPrompt)
    }
  }, [variables, prompt])

  const handleVariableChange = (variableName, value) => {
    setVariables(prev => ({
      ...prev,
      [variableName]: value
    }))
  }

  const handleGenerate = async () => {
    try {
      setIsGenerating(true)
      
      const response = await promptsAPI.generate(prompt.id, variables)
      setGeneratedPrompt(response.generated_prompt)
      
      // Increment usage count
      await promptsAPI.incrementCopy(prompt.id)
      
    } catch (err) {
      onError('Failed to generate prompt: ' + err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    try {
      const success = await utils.copyToClipboard(generatedPrompt)
      if (success) {
        setCopySuccess(true)
        await promptsAPI.incrementCopy(prompt.id)
        
        // Reset copy success message after 2 seconds
        setTimeout(() => setCopySuccess(false), 2000)
      } else {
        onError('Failed to copy to clipboard')
      }
    } catch (err) {
      onError('Failed to copy prompt: ' + err.message)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return '1 day ago'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    return `${Math.floor(diffInDays / 30)} months ago`
  }

  const calculateRating = () => {
    const total = prompt.up_votes + prompt.down_votes
    if (total === 0) return 0
    return Math.round((prompt.up_votes / total) * 100)
  }

  if (!prompt) return null

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900 truncate">
            {prompt.title}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {prompt.description && (
          <p className="text-sm text-gray-600 mb-3">{prompt.description}</p>
        )}

        {/* Metadata */}
        <div className="space-y-2 text-xs text-gray-500">
          <div className="flex justify-between">
            <span>Usage Count:</span>
            <span className="font-medium">{prompt.copy_count} times</span>
          </div>
          <div className="flex justify-between">
            <span>Rating:</span>
            <span className="font-medium">
              {calculateRating()}% ({prompt.up_votes + prompt.down_votes} votes)
            </span>
          </div>
          <div className="flex justify-between">
            <span>Created:</span>
            <span className="font-medium">{formatDate(prompt.created_at)}</span>
          </div>
          <div className="flex justify-between">
            <span>Folder:</span>
            <span className="font-medium">{prompt.folder_name || 'None'}</span>
          </div>
        </div>
      </div>

      {/* Variables Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Fill Variables</h3>
          
          {prompt.variables && prompt.variables.length > 0 ? (
            <div className="space-y-4">
              {prompt.variables.map((variable, index) => (
                <div key={index}>
                  <label 
                    htmlFor={`var-${variable}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {variable}
                  </label>
                  <input
                    type="text"
                    id={`var-${variable}`}
                    value={variables[variable] || ''}
                    onChange={(e) => handleVariableChange(variable, e.target.value)}
                    placeholder={`Enter value for ${variable}...`}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">
              No variables detected in this prompt template.
            </p>
          )}
        </div>

        {/* Generated Prompt Preview */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Preview</h3>
            <span className="text-xs text-gray-500">
              {generatedPrompt.length} characters
            </span>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4 max-h-48 overflow-y-auto">
            <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono">
              {generatedPrompt}
            </pre>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? 'Generating...' : 'Generate Prompt'}
            </button>
            
            <button
              onClick={handleCopy}
              className={`w-full py-2 px-4 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                copySuccess 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500'
              }`}
            >
              {copySuccess ? '✓ Copied!' : '📋 Copy to Clipboard'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PromptGenerator
