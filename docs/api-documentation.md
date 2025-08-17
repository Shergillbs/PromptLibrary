# 🛠️ PromptLibrary API Documentation

Complete API reference for the PromptLibrary backend service.

## 📋 Table of Contents

- [Base Information](#base-information)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Prompts API](#prompts-api)
- [Folders API](#folders-api)
- [Utility Endpoints](#utility-endpoints)
- [Request/Response Examples](#requestresponse-examples)
- [Status Codes](#status-codes)

## 🌐 Base Information

**Base URL**: `http://localhost:3001/api` (development)  
**Content-Type**: `application/json`  
**CORS**: Enabled for frontend development

## 🔐 Authentication

Currently, the API does not implement authentication. This is suitable for single-user local development. For production deployment, consider implementing:

- JWT-based authentication
- Session-based authentication
- API key authentication

## ❌ Error Handling

All API endpoints follow consistent error response format:

```json
{
  "error": "Human-readable error message"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## 📝 Prompts API

### Get All Prompts

Retrieve all prompts with optional filtering.

**Endpoint**: `GET /api/prompts`

**Query Parameters**:
- `folder_id` (optional): Filter by folder ID
- `tags` (optional): Comma-separated list of tags to filter by

**Response**:
```json
[
  {
    "id": 1,
    "title": "Blog Post Outline",
    "description": "Generate structured blog post outlines",
    "body": "Create a blog post outline for {{topic}} targeting {{audience}}",
    "tags": "blog,content,writing",
    "folder_id": 2,
    "copy_count": 15,
    "up_votes": 8,
    "down_votes": 1,
    "created_at": "2024-01-15T10:30:00Z",
    "variables": ["topic", "audience"]
  }
]
```

**Example Request**:
```bash
GET /api/prompts?folder_id=2&tags=blog,content
```

---

### Get Single Prompt

Retrieve a specific prompt by ID.

**Endpoint**: `GET /api/prompts/:id`

**Parameters**:
- `id` (required): Prompt ID

**Response**:
```json
{
  "id": 1,
  "title": "Blog Post Outline",
  "description": "Generate structured blog post outlines",
  "body": "Create a blog post outline for {{topic}} targeting {{audience}}",
  "tags": "blog,content,writing",
  "folder_id": 2,
  "copy_count": 15,
  "up_votes": 8,
  "down_votes": 1,
  "created_at": "2024-01-15T10:30:00Z",
  "variables": ["topic", "audience"]
}
```

**Error Responses**:
- `404` - Prompt not found

---

### Create Prompt

Create a new prompt template.

**Endpoint**: `POST /api/prompts`

**Request Body**:
```json
{
  "title": "Email Marketing Template",
  "description": "Professional email marketing template",
  "body": "Subject: {{subject}}\n\nHi {{recipient_name}},\n\n{{email_body}}\n\nBest regards,\n{{sender_name}}",
  "tags": "email,marketing,professional",
  "folder_id": 3
}
```

**Required Fields**:
- `title` (string): Prompt title
- `body` (string): Prompt template with {{variables}}

**Optional Fields**:
- `description` (string): Prompt description
- `tags` (string): Comma-separated tags
- `folder_id` (integer): Folder assignment

**Response**: `201 Created`
```json
{
  "id": 15,
  "title": "Email Marketing Template",
  "description": "Professional email marketing template",
  "body": "Subject: {{subject}}\n\nHi {{recipient_name}},\n\n{{email_body}}\n\nBest regards,\n{{sender_name}}",
  "tags": "email,marketing,professional",
  "folder_id": 3,
  "copy_count": 0,
  "up_votes": 0,
  "down_votes": 0,
  "created_at": "2024-01-15T11:45:00Z",
  "variables": ["subject", "recipient_name", "email_body", "sender_name"]
}
```

**Error Responses**:
- `400` - Missing required fields or invalid folder_id

---

### Update Prompt

Update an existing prompt.

**Endpoint**: `PUT /api/prompts/:id`

**Parameters**:
- `id` (required): Prompt ID

**Request Body**: Same as Create Prompt

**Response**:
```json
{
  "id": 15,
  "title": "Updated Email Template",
  "description": "Updated description",
  "body": "Updated template body with {{variables}}",
  "tags": "email,updated",
  "folder_id": 3,
  "copy_count": 5,
  "up_votes": 2,
  "down_votes": 0,
  "created_at": "2024-01-15T11:45:00Z",
  "variables": ["variables"]
}
```

**Error Responses**:
- `400` - Missing required fields or invalid folder_id
- `404` - Prompt not found

---

### Delete Prompt

Delete a prompt permanently.

**Endpoint**: `DELETE /api/prompts/:id`

**Parameters**:
- `id` (required): Prompt ID

**Response**: `200 OK`
```json
{
  "message": "Prompt deleted successfully"
}
```

**Error Responses**:
- `404` - Prompt not found

---

### Increment Copy Count

Track prompt usage by incrementing copy count.

**Endpoint**: `POST /api/prompts/:id/copy`

**Parameters**:
- `id` (required): Prompt ID

**Response**: `200 OK`
```json
{
  "message": "Copy count incremented"
}
```

**Error Responses**:
- `404` - Prompt not found

---

### Vote on Prompt

Submit an up or down vote for a prompt.

**Endpoint**: `POST /api/prompts/:id/vote`

**Parameters**:
- `id` (required): Prompt ID

**Request Body**:
```json
{
  "vote_type": "up"
}
```

**Valid vote_type values**:
- `"up"` - Upvote
- `"down"` - Downvote

**Response**: `200 OK`
```json
{
  "message": "up vote recorded"
}
```

**Error Responses**:
- `400` - Invalid vote_type
- `404` - Prompt not found

---

### Parse Variables

Extract variables from prompt text (utility endpoint).

**Endpoint**: `POST /api/prompts/parse`

**Request Body**:
```json
{
  "text": "Hello {{name}}, welcome to {{company}}! Your role is {{position}}."
}
```

**Response**: `200 OK`
```json
{
  "variables": ["name", "company", "position"]
}
```

**Error Responses**:
- `400` - Missing text field

---

### Generate Prompt

Generate a final prompt with filled variables.

**Endpoint**: `POST /api/prompts/:id/generate`

**Parameters**:
- `id` (required): Prompt ID

**Request Body**:
```json
{
  "variables": {
    "topic": "AI in Healthcare",
    "audience": "Medical professionals",
    "tone": "Professional"
  }
}
```

**Response**: `200 OK`
```json
{
  "original_prompt": {
    "id": 1,
    "title": "Blog Post Outline",
    "body": "Create a blog post outline for {{topic}} targeting {{audience}} with {{tone}} tone",
    "variables": ["topic", "audience", "tone"]
  },
  "generated_prompt": "Create a blog post outline for AI in Healthcare targeting Medical professionals with Professional tone",
  "variables_used": {
    "topic": "AI in Healthcare",
    "audience": "Medical professionals",
    "tone": "Professional"
  }
}
```

**Error Responses**:
- `404` - Prompt not found

## 📁 Folders API

### Get All Folders

Retrieve all folders with prompt counts.

**Endpoint**: `GET /api/folders`

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "name": "Marketing",
    "created_at": "2024-01-10T09:00:00Z",
    "prompt_count": 12
  },
  {
    "id": 2,
    "name": "Development",
    "created_at": "2024-01-10T09:15:00Z",
    "prompt_count": 8
  }
]
```

---

### Create Folder

Create a new folder for organizing prompts.

**Endpoint**: `POST /api/folders`

**Request Body**:
```json
{
  "name": "Content Creation"
}
```

**Required Fields**:
- `name` (string): Folder name (must be unique)

**Response**: `201 Created`
```json
{
  "id": 5,
  "name": "Content Creation",
  "created_at": "2024-01-15T12:00:00Z",
  "prompt_count": 0
}
```

**Error Responses**:
- `400` - Missing name or duplicate folder name

---

### Delete Folder

Delete a folder. Associated prompts will have their folder_id set to NULL.

**Endpoint**: `DELETE /api/folders/:id`

**Parameters**:
- `id` (required): Folder ID

**Response**: `200 OK`
```json
{
  "message": "Folder deleted successfully. Associated prompts moved to no folder."
}
```

**Error Responses**:
- `404` - Folder not found

## 🔧 Utility Endpoints

### Health Check

Check API server status.

**Endpoint**: `GET /api/health`

**Response**: `200 OK`
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T12:30:45.123Z"
}
```

## 📝 Request/Response Examples

### Complete Workflow Example

1. **Create a folder:**
```bash
POST /api/folders
{
  "name": "AI Prompts"
}
```

2. **Create a prompt in the folder:**
```bash
POST /api/prompts
{
  "title": "Code Review Assistant",
  "description": "AI assistant for code reviews",
  "body": "Review this {{language}} code for {{focus_area}}:\n\n{{code}}\n\nProvide feedback on:\n- Code quality\n- Best practices\n- Security concerns",
  "tags": "code,review,development",
  "folder_id": 1
}
```

3. **Generate a prompt:**
```bash
POST /api/prompts/1/generate
{
  "variables": {
    "language": "JavaScript",
    "focus_area": "performance optimization",
    "code": "function calculateSum(arr) { return arr.reduce((a,b) => a+b, 0) }"
  }
}
```

4. **Track usage:**
```bash
POST /api/prompts/1/copy
```

5. **Vote on the prompt:**
```bash
POST /api/prompts/1/vote
{
  "vote_type": "up"
}
```

### Variable Detection Example

The API automatically detects variables in prompt templates using the pattern `{{variable_name}}`.

**Input**:
```
"Write a {{type}} about {{subject}} for {{audience}} in {{tone}} tone. Include {{details}} and make it {{length}} long."
```

**Extracted Variables**:
```json
["type", "subject", "audience", "tone", "details", "length"]
```

### Filtering Examples

**Filter by folder:**
```bash
GET /api/prompts?folder_id=2
```

**Filter by tags:**
```bash
GET /api/prompts?tags=marketing,email
```

**Combine filters:**
```bash
GET /api/prompts?folder_id=2&tags=blog,content
```

## 📊 Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data or validation error |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server error occurred |

## 🔍 Error Response Examples

**Validation Error (400)**:
```json
{
  "error": "Title and body are required"
}
```

**Not Found Error (404)**:
```json
{
  "error": "Prompt not found"
}
```

**Duplicate Error (400)**:
```json
{
  "error": "Folder name already exists"
}
```

**Server Error (500)**:
```json
{
  "error": "Failed to create prompt"
}
```

## 🚀 Rate Limiting

Currently, no rate limiting is implemented. For production use, consider implementing:

- Request rate limiting per IP
- API key-based quotas
- DDoS protection

## 📈 Future API Enhancements

Potential future additions:

- **Authentication endpoints** (`/api/auth/*`)
- **User management** (`/api/users/*`)
- **Prompt sharing** (`/api/prompts/:id/share`)
- **Bulk operations** (`/api/prompts/bulk`)
- **Search endpoints** (`/api/search`)
- **Analytics** (`/api/analytics`)
- **Export/Import** (`/api/export`, `/api/import`)

This API provides a solid foundation for prompt management with room for future enhancements as the application grows.
