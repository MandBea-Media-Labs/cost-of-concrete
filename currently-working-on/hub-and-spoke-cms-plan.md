# Hub-and-Spoke CMS Implementation Plan

**Project:** Cost of Concrete - Dynamic Page Management System
**Started:** 2025-11-08
**Status:** ✅ Phase 1 & 1.5 Complete - Ready for Phase 2

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture Decisions](#architecture-decisions)
3. [Database Schema](#database-schema)
4. [Template System](#template-system)
5. [Service Layer](#service-layer)
6. [Implementation Phases](#implementation-phases)
7. [Progress Tracking](#progress-tracking)

---

## 🎯 Overview

### Goals

Build a flexible, hierarchical page management system with:
- ✅ **SEO-friendly URL slugs** (user-defined)
- ✅ **Unlimited nesting depth** (category → sub-page → sub-sub-page)
- ✅ **Template-based layouts** (Hub, Spoke, Sub-Spoke, Article)
- ✅ **Markdown content storage** (future WYSIWYG/block editor support)
- ✅ **Flexible metadata** (JSONB for extensibility)
- ✅ **Performance-optimized** queries

### Key Features

1. **Hierarchical Structure**: Unlimited depth page nesting
2. **Custom URL Slugs**: User-defined, SEO-friendly paths
3. **Template System**: Different layouts for different page types
4. **Materialized Paths**: Fast path-based lookups
5. **Draft/Publish Workflow**: Content staging
6. **Soft Deletes**: Data preservation and recovery

---

## 🏗️ Architecture Decisions

### Why Application-Layer Logic?

**Decision:** Business logic in TypeScript services, NOT database functions

**Rationale:**
- ✅ **Testable**: Unit tests for all logic
- ✅ **Maintainable**: All code in TypeScript
- ✅ **DRY**: Single source of truth
- ✅ **SOLID**: Follows all principles
- ✅ **Type-Safe**: Full TypeScript benefits
- ✅ **Debuggable**: IDE support, breakpoints
- ✅ **Reusable**: Use in routes, composables, edge functions

### Layered Architecture

```
┌─────────────────────────────────────┐
│   Presentation Layer (Vue/Nuxt)     │
│   - Pages, Components, Composables  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      API Layer (Server Routes)      │
│   - /api/pages/* endpoints          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    Service Layer (Business Logic)   │
│   - PageService class               │
│   - Template validation             │
│   - Path/slug generation            │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Repository Layer (Data Access)    │
│   - PageRepository class            │
│   - Supabase queries                │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Database (Supabase/Postgres)   │
│   - Schema, Constraints, Indexes    │
│   - RLS Policies                    │
└─────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### Pages Table

```sql
CREATE TABLE pages (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Hierarchy & Routing
  parent_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  full_path TEXT NOT NULL,
  depth INTEGER NOT NULL DEFAULT 0,

  -- Template System
  template TEXT NOT NULL DEFAULT 'default',

  -- Content
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,

  -- SEO & Metadata (Basic)
  meta_title TEXT,
  meta_keywords TEXT[],
  og_image TEXT,

  -- SEO Enhancements (Phase 1.5)
  canonical_url TEXT,
  meta_robots TEXT[] DEFAULT ARRAY['index', 'follow'],
  focus_keyword TEXT,
  sitemap_priority DECIMAL(2,1) DEFAULT 0.5,
  sitemap_changefreq TEXT DEFAULT 'weekly',
  redirect_url TEXT,
  redirect_type INTEGER DEFAULT 301,

  -- Status & Publishing
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,

  -- Flexible Metadata (template-specific + SEO)
  -- metadata.template = template-specific data
  -- metadata.seo = { og, twitter, schema }
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Audit Fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),

  -- Soft Delete
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT unique_full_path UNIQUE (full_path),
  CONSTRAINT unique_slug_per_parent UNIQUE (parent_id, slug),
  CONSTRAINT valid_slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  CONSTRAINT valid_template CHECK (
    template IN ('hub', 'spoke', 'sub-spoke', 'article', 'custom', 'default')
  ),
  -- SEO Constraints (Phase 1.5)
  CONSTRAINT valid_sitemap_priority CHECK (sitemap_priority BETWEEN 0.0 AND 1.0),
  CONSTRAINT valid_sitemap_changefreq CHECK (
    sitemap_changefreq IN ('always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never')
  ),
  CONSTRAINT valid_redirect_type CHECK (redirect_type IN (301, 302, 307, 308)),
  CONSTRAINT valid_meta_robots CHECK (
    meta_robots <@ ARRAY['index', 'noindex', 'follow', 'nofollow', 'noarchive',
                         'nosnippet', 'noimageindex', 'notranslate', 'none', 'all']
  )
);
```

### Indexes

```sql
-- Fast path-based lookups
CREATE INDEX idx_pages_full_path ON pages(full_path)
  WHERE deleted_at IS NULL;

-- Fast parent-child queries
CREATE INDEX idx_pages_parent_id ON pages(parent_id)
  WHERE deleted_at IS NULL;

-- Fast slug lookups within parent
CREATE INDEX idx_pages_slug_parent ON pages(slug, parent_id)
  WHERE deleted_at IS NULL;

-- Fast published page queries
CREATE INDEX idx_pages_status_published ON pages(status, published_at)
  WHERE deleted_at IS NULL AND status = 'published';

-- Fast depth-based queries
CREATE INDEX idx_pages_depth ON pages(depth)
  WHERE deleted_at IS NULL;

-- JSONB metadata queries
CREATE INDEX idx_pages_metadata ON pages USING GIN(metadata);

-- SEO Indexes (Phase 1.5)
CREATE INDEX idx_pages_canonical_url ON pages(canonical_url)
  WHERE canonical_url IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX idx_pages_sitemap ON pages(sitemap_priority DESC, sitemap_changefreq)
  WHERE status = 'published' AND deleted_at IS NULL;

CREATE INDEX idx_pages_focus_keyword ON pages(focus_keyword)
  WHERE focus_keyword IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX idx_pages_redirect_url ON pages(redirect_url)
  WHERE redirect_url IS NOT NULL AND deleted_at IS NULL;
```

### Database Functions (Minimal)

```sql
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-set canonical_url (Phase 1.5)
CREATE OR REPLACE FUNCTION set_canonical_url()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.canonical_url IS NULL THEN
    NEW.canonical_url := NEW.full_path;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pages_set_canonical_url
  BEFORE INSERT OR UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION set_canonical_url();
```

### RLS Policies

```sql
-- Enable RLS
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Public can view published pages
CREATE POLICY "Public can view published pages"
  ON pages FOR SELECT
  USING (
    status = 'published'
    AND published_at <= NOW()
    AND deleted_at IS NULL
  );

-- Authenticated users can view all pages
CREATE POLICY "Authenticated users can view all pages"
  ON pages FOR SELECT
  USING (auth.role() = 'authenticated');

-- Authenticated users can create pages
CREATE POLICY "Authenticated users can create pages"
  ON pages FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can update pages
CREATE POLICY "Authenticated users can update pages"
  ON pages FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Authenticated users can delete pages
CREATE POLICY "Authenticated users can delete pages"
  ON pages FOR DELETE
  USING (auth.role() = 'authenticated');
```

---

## 🎨 Template System

### Template Hierarchy

```
Depth 0 (Root)     → Hub Template
  ├─ Depth 1       → Spoke Template
  │   ├─ Depth 2   → Sub-Spoke Template
  │   └─ Depth 2   → Sub-Spoke Template
  └─ Depth 1       → Spoke Template
      └─ Depth 2+  → Article Template
```

### Template Configuration

**Location:** `server/config/templates.ts`

**Templates:**
1. **Hub** (depth 0): Top-level category with child grid
2. **Spoke** (depth 1): Mid-level content with sidebar
3. **Sub-Spoke** (depth 2): Detailed content with TOC
4. **Article** (depth 3+): Deep-level article
5. **Custom**: Fully customizable
6. **Default**: Basic fallback

### Template Metadata Schemas

Each template has a JSON Schema for metadata validation:

**Hub Template Metadata:**
```json
{
  "layout": "grid",
  "showChildGrid": true,
  "heroImage": "/images/hero.jpg",
  "featuredPages": ["page-id-1", "page-id-2"],
  "columns": 3
}
```

**Spoke Template Metadata:**
```json
{
  "showSidebar": true,
  "sidebarPosition": "right",
  "relatedPages": ["page-id-1"],
  "showChildList": true,
  "callToAction": {
    "text": "Get Started",
    "url": "/contact",
    "style": "primary"
  }
}
```

---

## 🏗️ Service Layer

### File Structure

```
server/
├── config/
│   └── templates.ts          # Template configurations
├── services/
│   └── PageService.ts        # Business logic
├── repositories/
│   └── PageRepository.ts     # Data access
└── api/
    └── pages/
        ├── index.get.ts      # List pages
        ├── index.post.ts     # Create page
        ├── [id].get.ts       # Get page by ID
        ├── [id].patch.ts     # Update page
        ├── [id].delete.ts    # Delete page
        ├── by-path.get.ts    # Get page by path
        └── [id]/
            ├── children.get.ts    # Get child pages
            └── breadcrumbs.get.ts # Get breadcrumbs
```

### PageService Methods

```typescript
class PageService {
  // Slug Management
  generateSlug(title: string): string
  validateSlug(slug: string): ValidationResult

  // Path Management
  generateFullPath(slug: string, parentId?: string): Promise<string>
  calculateDepth(parentId?: string): Promise<number>

  // Template Management
  determineDefaultTemplate(depth: number): string
  validateTemplate(template: string): ValidationResult
  validateTemplateMetadata(template: string, metadata: any): ValidationResult
  validateTemplateDepth(template: string, depth: number): ValidationResult
  getAvailableTemplatesForDepth(depth: number): string[]

  // CRUD Operations
  createPage(data: PageInsert): Promise<Page>
  updatePage(id: string, data: PageUpdate): Promise<Page>
  getPageByPath(path: string): Promise<Page | null>
  deletePage(id: string): Promise<void>

  // Hierarchy Operations
  getBreadcrumbs(pageId: string): Promise<Breadcrumb[]>
  getChildren(pageId: string, includeDescendants?: boolean): Promise<Page[]>

  // SEO Operations (Phase 1.5)
  generateCanonicalUrl(fullPath: string): string
  validateMetaRobots(robots: string[]): ValidationResult
  generateSitemapPriority(depth: number): number
  validateSEOMetadata(seoData: SEOMetadata): ValidationResult
  generateSchemaOrg(page: Page, type: string): SchemaOrgData
  generateOpenGraphTags(page: Page): OpenGraphMetadata
  generateTwitterCardTags(page: Page): TwitterCardMetadata
}
```

---

## 📦 Implementation Phases

### ✅ Phase 0: Planning (COMPLETE)
- [x] Architecture design
- [x] Database schema design
- [x] Template system design
- [x] Service layer design
- [x] Documentation

### ✅ Phase 1: Database Foundation (COMPLETE)

**Goal:** Set up core database schema and infrastructure

**Tasks:**
- [x] Create `pages` table migration
- [x] Add indexes (7 indexes created)
- [x] Create `update_updated_at_column()` function
- [x] Set up RLS policies (5 policies created)
- [x] Generate TypeScript types
- [x] Test basic CRUD operations

**Testing Results:**
- [x] ✅ Insert root page (depth 0) - Hub template
- [x] ✅ Insert child page (depth 1) - Spoke template
- [x] ✅ Insert grandchild page (depth 2) - Sub-spoke template
- [x] ✅ Verify unique constraints (full_path, slug per parent)
- [x] ✅ Verify slug format constraint (lowercase, hyphens only)
- [x] ✅ Verify template constraint (6 valid templates)
- [x] ✅ Verify status constraint (draft, published, archived)
- [x] ✅ Test updated_at trigger (auto-updates on UPDATE)
- [x] ✅ Test JSONB metadata (flexible template-specific data)
- [x] ✅ Test cascade delete (parent deletion removes children)

**Deliverable:** ✅ Working database with complete page hierarchy

**Migration File:** `supabase/migrations/20251108035249_create_pages_table.sql`
**TypeScript Types:** `types/supabase.ts`
**Test File:** `supabase/tests/test_pages_schema.sql`

---

### ✅ Phase 1.5: SEO Enhancements (COMPLETE)

**Goal:** Add comprehensive SEO support for Schema.org, Open Graph, Twitter Cards, and sitemap configuration

**Tasks:**
- [x] Create SEO fields migration (hybrid approach)
- [x] Add 7 new columns (canonical_url, meta_robots, focus_keyword, sitemap_priority, sitemap_changefreq, redirect_url, redirect_type)
- [x] Add 4 constraints (sitemap priority, changefreq, redirect type, meta robots)
- [x] Add 4 indexes for SEO queries
- [x] Create auto-set canonical_url trigger
- [x] Update TypeScript types
- [x] Create SEO metadata schemas (TypeScript interfaces)
- [x] Test all SEO fields and constraints

**SEO Features Added:**
- [x] ✅ **Canonical URLs** - Auto-set to full_path, prevents duplicate content
- [x] ✅ **Meta Robots** - Array of directives (index, follow, noindex, nofollow, etc.)
- [x] ✅ **Focus Keyword** - Primary SEO keyword for each page
- [x] ✅ **Sitemap Configuration** - Priority (0.0-1.0) and change frequency
- [x] ✅ **Redirects** - URL and type (301, 302, 307, 308)
- [x] ✅ **Open Graph Tags** - Stored in metadata.seo.og (title, description, image, etc.)
- [x] ✅ **Twitter Cards** - Stored in metadata.seo.twitter (card type, title, image, etc.)
- [x] ✅ **Schema.org JSON-LD** - Stored in metadata.seo.schema (Article, HowTo, FAQ, LocalBusiness, etc.)

**Testing Results:**
- [x] ✅ Canonical URL auto-sets to full_path
- [x] ✅ Sitemap priority constraint (0.0-1.0) enforced
- [x] ✅ Sitemap changefreq constraint enforced
- [x] ✅ Meta robots constraint enforced
- [x] ✅ Redirect type constraint enforced
- [x] ✅ Depth-based sitemap priority auto-set (depth 0 = 1.0, depth 1 = 0.8, etc.)
- [x] ✅ Complete SEO metadata structure (OG + Twitter + Schema.org) working
- [x] ✅ JSONB queries for SEO data working

**Deliverable:** ✅ Production-ready SEO infrastructure

**Migration File:** `supabase/migrations/20251108040645_add_seo_enhancements.sql`
**SEO Schemas:** `server/config/seo-schemas.ts` (TypeScript interfaces + examples)
**TypeScript Types:** `types/supabase.ts` (updated with SEO fields)

---

### 🔜 Phase 2: Service & Repository Layer

**Goal:** Implement business logic and data access layers

**Tasks:**
- [ ] Create `server/config/templates.ts`
- [ ] Create `server/repositories/PageRepository.ts`
- [ ] Create `server/services/PageService.ts`
- [ ] Install `ajv` for JSON Schema validation
- [ ] Write unit tests for PageService
- [ ] Write unit tests for PageRepository

**Testing:**
- [ ] Test slug generation and validation
- [ ] Test path generation
- [ ] Test template validation
- [ ] Test metadata validation
- [ ] Test CRUD operations

**Deliverable:** Fully tested service and repository layers

---

### 🔜 Phase 3: API Endpoints

**Goal:** Create Nuxt server API routes

**Tasks:**
- [ ] `GET /api/pages` - List pages
- [ ] `POST /api/pages` - Create page
- [ ] `GET /api/pages/[id]` - Get page by ID
- [ ] `PATCH /api/pages/[id]` - Update page
- [ ] `DELETE /api/pages/[id]` - Soft delete
- [ ] `GET /api/pages/by-path` - Get by full_path
- [ ] `GET /api/pages/[id]/children` - Get children
- [ ] `GET /api/pages/[id]/breadcrumbs` - Get breadcrumbs
- [ ] `GET /api/templates` - List templates
- [ ] `GET /api/templates/[id]/schema` - Get template schema

**Testing:**
- [ ] Test each endpoint with Thunder Client
- [ ] Test error handling
- [ ] Test edge cases

**Deliverable:** Fully functional REST API

---

### 🔜 Phase 4: Dynamic Routing

**Goal:** Implement catch-all route for page rendering

**Tasks:**
- [ ] Create `app/pages/[...slug].vue`
- [ ] Fetch page data by path
- [ ] Create template components:
  - [ ] `HubTemplate.vue`
  - [ ] `SpokeTemplate.vue`
  - [ ] `SubSpokeTemplate.vue`
  - [ ] `ArticleTemplate.vue`
  - [ ] `DefaultTemplate.vue`
- [ ] Implement dynamic component loading
- [ ] Render markdown content
- [ ] Display breadcrumbs
- [ ] Show child pages
- [ ] Handle 404s
- [ ] Add SEO meta tags

**Testing:**
- [ ] Navigate to `/category`
- [ ] Navigate to `/category/sub-page`
- [ ] Navigate to `/category/sub-page/sub-sub-page`
- [ ] Test 404 handling
- [ ] Verify SEO meta tags
- [ ] Test different templates

**Deliverable:** Working dynamic page rendering

---

### 🔜 Phase 5: Admin UI (Basic)

**Goal:** Simple admin interface for page management

**Tasks:**
- [ ] Create `/admin/pages` list view
- [ ] Create `/admin/pages/new` form
- [ ] Create `/admin/pages/[id]/edit` form
- [ ] Add parent page selector
- [ ] Add slug input with validation
- [ ] Add template selector
- [ ] Add metadata editor (JSON or form-based)
- [ ] Add markdown editor
- [ ] Add status selector
- [ ] Add delete confirmation

**Testing:**
- [ ] Create root page
- [ ] Create child page
- [ ] Edit page
- [ ] Change template
- [ ] Delete page
- [ ] Verify slug validation

**Deliverable:** Basic admin interface

---

### 🔜 Phase 6: Enhanced Features

**Goal:** Polish and prepare for production

**Tasks:**
- [ ] Page reordering (within parent)
- [ ] Page duplication
- [ ] Bulk actions
- [ ] Search/filter in admin
- [ ] Preview mode
- [ ] Template preview in admin
- [ ] Performance testing (100+ pages)
- [ ] Deep nesting test (10+ levels)

**Deliverable:** Production-ready CMS

---

## 📊 Progress Tracking

### Current Phase: Phase 2 - Service & Repository Layer

**Started:** 2025-11-08
**Status:** 🟡 Ready to Start
**Blocked By:** None
**Next Steps:** Create template configuration and service layer

---

### Notes & Decisions

**2025-11-08 - Planning:**
- ✅ Decided to use application-layer logic instead of database functions
- ✅ Designed template system with auto-assignment and manual override
- ✅ Chose materialized path pattern for hierarchy
- ✅ Planned JSONB metadata for template-specific data

**2025-11-08 - Phase 1 Complete:**
- ✅ Created comprehensive migration with all constraints and indexes
- ✅ Generated TypeScript types from schema
- ✅ All database tests passed (10/10 tests successful)
- ✅ Verified: constraints, triggers, cascade deletes, JSONB metadata
- 📝 Migration file: `20251108035249_create_pages_table.sql` (194 lines)
- 📝 Test results: 4 pages created (2 hub, 1 spoke, 1 sub-spoke)
- 📝 All constraint violations correctly rejected

**2025-11-08 - Phase 1.5 Complete (SEO Enhancements):**
- ✅ Added 7 SEO columns with hybrid approach (critical fields + JSONB)
- ✅ Implemented Schema.org, Open Graph, and Twitter Card support
- ✅ Created auto-set canonical URL trigger
- ✅ Added depth-based sitemap priority defaults
- ✅ All SEO constraints and validations working
- 📝 Migration file: `20251108040645_add_seo_enhancements.sql` (196 lines)
- 📝 SEO schemas: `server/config/seo-schemas.ts` (TypeScript interfaces)
- 📝 Supports: Article, HowTo, FAQ, LocalBusiness schemas
- 📝 Test results: All SEO fields, constraints, and metadata working perfectly

---

### Future Considerations

**WYSIWYG/Block Editor:**
- Consider Tiptap, Editor.js, or Lexical
- Store blocks in `metadata.blocks` as JSON
- Each block type has its own schema

**Performance Optimizations:**
- Add caching layer (Redis)
- Implement CDN for static content
- Consider database views for complex queries

**Advanced Features:**
- Page versioning/history
- Multi-language support
- A/B testing
- Analytics integration

---

**Last Updated:** 2025-11-08
**Next Review:** After Phase 2 completion

