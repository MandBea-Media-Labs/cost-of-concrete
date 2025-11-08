# API Endpoint Testing Guide

This document contains CURL commands for testing all API endpoints.
All commands are Windows PowerShell compatible (single-line format).

## Prerequisites

1. Start the dev server: `pnpm dev`
2. Server should be running on `http://localhost:3019`

---

## Group 1: Template API Endpoints

### GET /api/templates
List all available templates.

```powershell
curl http://localhost:3019/api/templates
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "type": "hub",
      "name": "Hub Template",
      "description": "Top-level category page with child grid",
      "allowedDepths": [0],
      "defaultMetadata": { ... }
    },
    ...
  ],
  "total": 6
}
```

---

### GET /api/templates/[type]/schema
Get metadata schema for a specific template.

**Test: Hub template**
```powershell
curl http://localhost:3019/api/templates/hub/schema
```

**Test: Spoke template**
```powershell
curl http://localhost:3019/api/templates/spoke/schema
```

**Test: Invalid template (should return 404)**
```powershell
curl http://localhost:3019/api/templates/invalid/schema
```

**Expected Response (hub):**
```json
{
  "success": true,
  "data": {
    "type": "hub",
    "name": "Hub Template",
    "description": "Top-level category page with child grid",
    "allowedDepths": [0],
    "schema": { ... },
    "defaultMetadata": { ... }
  }
}
```

---

## Group 2: Read API Endpoints

### GET /api/pages
List pages with optional filters.

**Test: List all pages (default)**
```powershell
curl http://localhost:3019/api/pages
```

**Test: List published pages only**
```powershell
curl "http://localhost:3019/api/pages?status=published"
```

**Test: List pages with specific template**
```powershell
curl "http://localhost:3019/api/pages?template=hub"
```

**Test: List root pages (depth 0)**
```powershell
curl "http://localhost:3019/api/pages?depth=0"
```

**Test: Pagination**
```powershell
curl "http://localhost:3019/api/pages?limit=10&offset=0"
```

---

### GET /api/pages/[id]
Get a specific page by ID.

**Test: Get page by ID (replace with actual UUID)**
```powershell
curl http://localhost:3019/api/pages/YOUR_PAGE_ID_HERE
```

**Test: Invalid ID (should return 404)**
```powershell
curl http://localhost:3019/api/pages/00000000-0000-0000-0000-000000000000
```

---

### GET /api/pages/by-path
Get a page by its full path.

**Test: Get page by path**
```powershell
curl "http://localhost:3019/api/pages/by-path?path=/category"
```

**Test: Nested path**
```powershell
curl "http://localhost:3019/api/pages/by-path?path=/category/sub-page"
```

**Test: Invalid path (should return 404)**
```powershell
curl "http://localhost:3019/api/pages/by-path?path=/non-existent"
```

---

## Group 3: Hierarchy API Endpoints

### GET /api/pages/[id]/children
Get child pages of a specific page.

**Test: Get children (replace with actual parent ID)**
```powershell
curl http://localhost:3019/api/pages/YOUR_PARENT_ID_HERE/children
```

**Test: Get all descendants (recursive)**
```powershell
curl "http://localhost:3019/api/pages/YOUR_PARENT_ID_HERE/children?includeDescendants=true"
```

---

### GET /api/pages/[id]/breadcrumbs
Get breadcrumb trail for a page.

**Test: Get breadcrumbs (replace with actual page ID)**
```powershell
curl http://localhost:3019/api/pages/YOUR_PAGE_ID_HERE/breadcrumbs
```

---

## Group 4: Write API Endpoints

### POST /api/pages
Create a new page.

**Test: Create root page (Hub)**
```powershell
curl -X POST http://localhost:3019/api/pages -H "Content-Type: application/json" -d "{\"title\":\"Test Hub Page\",\"content\":\"This is test content\",\"status\":\"draft\"}"
```

**Test: Create child page (Spoke)**
```powershell
curl -X POST http://localhost:3019/api/pages -H "Content-Type: application/json" -d "{\"title\":\"Test Spoke Page\",\"content\":\"This is test content\",\"parentId\":\"YOUR_PARENT_ID_HERE\",\"status\":\"draft\"}"
```

**Test: Create with custom slug**
```powershell
curl -X POST http://localhost:3019/api/pages -H "Content-Type: application/json" -d "{\"title\":\"Custom Slug Page\",\"slug\":\"my-custom-slug\",\"content\":\"This is test content\",\"status\":\"draft\"}"
```

**Test: Invalid data (should return 400)**
```powershell
curl -X POST http://localhost:3019/api/pages -H "Content-Type: application/json" -d "{\"title\":\"\",\"content\":\"\"}"
```

---

### PATCH /api/pages/[id]
Update an existing page.

**Test: Update title (replace with actual page ID)**
```powershell
curl -X PATCH http://localhost:3019/api/pages/YOUR_PAGE_ID_HERE -H "Content-Type: application/json" -d "{\"title\":\"Updated Title\"}"
```

**Test: Update status to published**
```powershell
curl -X PATCH http://localhost:3019/api/pages/YOUR_PAGE_ID_HERE -H "Content-Type: application/json" -d "{\"status\":\"published\"}"
```

**Test: Update multiple fields**
```powershell
curl -X PATCH http://localhost:3019/api/pages/YOUR_PAGE_ID_HERE -H "Content-Type: application/json" -d "{\"title\":\"New Title\",\"description\":\"New description\",\"metaTitle\":\"SEO Title\"}"
```

---

### DELETE /api/pages/[id]
Soft delete a page.

**Test: Delete page (replace with actual page ID)**
```powershell
curl -X DELETE http://localhost:3019/api/pages/YOUR_PAGE_ID_HERE
```

**Test: Delete non-existent page (should return 404)**
```powershell
curl -X DELETE http://localhost:3019/api/pages/00000000-0000-0000-0000-000000000000
```

---

## Integration Testing Workflow

Complete workflow to test the entire system:

```powershell
# 1. Create a root page (Hub)
curl -X POST http://localhost:3019/api/pages -H "Content-Type: application/json" -d "{\"title\":\"Integration Test Hub\",\"content\":\"Hub content\",\"status\":\"draft\"}"

# 2. Get the page ID from response, then create a child page
curl -X POST http://localhost:3019/api/pages -H "Content-Type: application/json" -d "{\"title\":\"Integration Test Spoke\",\"content\":\"Spoke content\",\"parentId\":\"PARENT_ID_FROM_STEP_1\",\"status\":\"draft\"}"

# 3. Get children of the hub page
curl http://localhost:3019/api/pages/PARENT_ID_FROM_STEP_1/children

# 4. Get breadcrumbs of the spoke page
curl http://localhost:3019/api/pages/CHILD_ID_FROM_STEP_2/breadcrumbs

# 5. Update the spoke page
curl -X PATCH http://localhost:3019/api/pages/CHILD_ID_FROM_STEP_2 -H "Content-Type: application/json" -d "{\"status\":\"published\"}"

# 6. Get page by path
curl "http://localhost:3019/api/pages/by-path?path=/integration-test-hub/integration-test-spoke"

# 7. Delete the spoke page
curl -X DELETE http://localhost:3019/api/pages/CHILD_ID_FROM_STEP_2

# 8. Delete the hub page
curl -X DELETE http://localhost:3019/api/pages/PARENT_ID_FROM_STEP_1
```

---

## Notes

- Replace `YOUR_PAGE_ID_HERE`, `YOUR_PARENT_ID_HERE`, etc. with actual UUIDs from your database
- All endpoints require authentication (except templates)
- Responses include `success: true/false` and `data` or `error` fields
- Error responses include `statusCode`, `statusMessage`, and `message`

