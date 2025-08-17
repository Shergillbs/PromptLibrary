import React, { useState, useEffect } from 'react'
import { promptsAPI, utils } from '../services/api'

function CreatePromptForm({ folders, onClose, onSuccess, onError }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    body: '',
    tags: '',
    folder_id: ''
  })
  const [detectedVariables, setDetectedVariables] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Detect variables when body text changes
  useEffect(() => {
    if (formData.body) {
      const variables = utils.extractVariables(formData.body)
      setDetectedVariables(variables)
    } else {
      setDetectedVariables([])
    }
  }, [formData.body])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.body.trim()) {
      onError('Title and body are required')
      return
    }

    setIsSubmitting(true)
    
    try {
      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        body: formData.body.trim(),
        tags: formData.tags.trim() || null,
        folder_id: formData.folder_id ? parseInt(formData.folder_id) : null
      }

      await promptsAPI.create(submitData)
      onSuccess()
      onClose()
    } catch (err) {
      onError('Failed to create prompt: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Create New Prompt</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Blog Post Outline"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of what this prompt does"
              />
            </div>

            {/* Body */}
            <div>
              <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
                Prompt Body * 
                <span className="text-gray-500 text-xs ml-2">
                  Use {'{{variable}}'} for placeholders
                </span>
              </label>
              <textarea
                id="body"
                name="body"
                value={formData.body}
                onChange={handleInputChange}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Write your prompt template here. Use {{variable}} for dynamic content..."
                required
              />
            </div>

            {/* Detected Variables */}
            {detectedVariables.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  Detected Variables:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {detectedVariables.map((variable, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                    >
                      {variable}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tags
                <span className="text-gray-500 text-xs ml-2">
                  Comma-separated (e.g., blog, content, writing)
                </span>
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="blog, content, writing"
              />
            </div>

            {/* Folder */}
            <div>
              <label htmlFor="folder_id" className="block text-sm font-medium text-gray-700 mb-2">
                Folder
              </label>
              <select
                id="folder_id"
                name="folder_id"
                value={formData.folder_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No folder</option>
                {folders.map(folder => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Prompt'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreatePromptForm
