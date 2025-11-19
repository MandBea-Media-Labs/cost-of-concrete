# Phase 7 - Batch 11: Robots.txt Management

**Priority:** 5 (SEO & Analytics)
**Status:** 🔜 Not Started
**Effort:** 2-3 hours
**Dependencies:** Batch 10 (Sitemap Generation)

---

## 🎯 Goal

Create admin UI for managing robots.txt configuration to control search engine crawling behavior.

---

## 📋 Current State

**Current Implementation:**
- Static robots.txt in `server/routes/robots.txt.get.ts`
- Hardcoded rules
- No admin control
- Only includes sitemap reference

**Needed Features:**
- Admin UI to edit robots.txt
- Support for multiple user-agents
- Allow/Disallow rules
- Crawl-delay settings
- Preview before saving

---

## 🎯 Objectives

1. Create database table for robots.txt config
2. Create admin UI for editing robots.txt
3. Support multiple user-agents
4. Support Allow/Disallow rules
5. Support Crawl-delay
6. Auto-include sitemap reference
7. Preview robots.txt before saving
8. Validate robots.txt syntax

---

## 📦 Tasks

### 1. Create Database Schema
- [ ] Create `robots_config` table
- [ ] Fields: id, user_agent, rules (JSONB), crawl_delay, is_active
- [ ] Seed with default config (User-agent: *, Allow: /)
- [ ] Add RLS policies (admin-only)

### 2. Create Admin UI Page
- [ ] Create `/admin/seo/robots` page
- [ ] List all user-agent configs
- [ ] Add "New User-Agent" button
- [ ] Edit/Delete actions
- [ ] Preview panel (live preview)

### 3. Create Robots Config Form
- [ ] User-agent input (e.g., "Googlebot", "*")
- [ ] Allow rules (array of paths)
- [ ] Disallow rules (array of paths)
- [ ] Crawl-delay input (seconds)
- [ ] Is Active toggle
- [ ] Save/Cancel buttons

### 4. Create API Endpoints
- [ ] GET /api/admin/robots (list configs)
- [ ] POST /api/admin/robots (create config)
- [ ] PATCH /api/admin/robots/[id] (update config)
- [ ] DELETE /api/admin/robots/[id] (delete config)

### 5. Update Robots.txt Endpoint
- [ ] Fetch active configs from database
- [ ] Generate robots.txt dynamically
- [ ] Include sitemap reference
- [ ] Cache for 1 hour
- [ ] Invalidate cache on config update

### 6. Add Validation
- [ ] Validate user-agent format
- [ ] Validate path patterns
- [ ] Validate crawl-delay (positive integer)
- [ ] Prevent duplicate user-agents
- [ ] Show validation errors inline

### 7. Testing
- [ ] Test creating new user-agent config
- [ ] Test editing existing config
- [ ] Test deleting config
- [ ] Test robots.txt generation
- [ ] Test preview updates in real-time
- [ ] Validate with Google's robots.txt tester

---

## 🛠️ Technical Implementation

### Database Migration
```sql
-- Create robots_config table
CREATE TABLE robots_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_agent TEXT NOT NULL,
  rules JSONB NOT NULL DEFAULT '{"allow": [], "disallow": []}',
  crawl_delay INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_agent)
);

-- RLS policies
ALTER TABLE robots_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage robots config"
  ON robots_config FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM account_profiles
      WHERE account_profiles.id = auth.uid()
      AND account_profiles.is_admin = true
    )
  );

-- Seed default config
INSERT INTO robots_config (user_agent, rules, is_active)
VALUES ('*', '{"allow": ["/"], "disallow": []}', true);
```

### Dynamic Robots.txt Endpoint
```typescript
// server/routes/robots.txt.get.ts
export default defineEventHandler(async (event) => {
  // Check cache
  const cached = await useStorage('cache').getItem('robots:txt')
  if (cached) {
    setHeader(event, 'Content-Type', 'text/plain')
    return cached
  }
  
  // Fetch active configs
  const client = await serverSupabaseClient(event)
  const { data: configs } = await client
    .from('robots_config')
    .select('*')
    .eq('is_active', true)
    .order('user_agent')
  
  // Generate robots.txt
  const siteUrl = useRuntimeConfig().public.siteUrl
  
  let robotsTxt = ''
  
  for (const config of configs) {
    robotsTxt += `User-agent: ${config.user_agent}\n`
    
    // Allow rules
    for (const path of config.rules.allow || []) {
      robotsTxt += `Allow: ${path}\n`
    }
    
    // Disallow rules
    for (const path of config.rules.disallow || []) {
      robotsTxt += `Disallow: ${path}\n`
    }
    
    // Crawl-delay
    if (config.crawl_delay) {
      robotsTxt += `Crawl-delay: ${config.crawl_delay}\n`
    }
    
    robotsTxt += '\n'
  }
  
  // Add sitemap
  robotsTxt += `Sitemap: ${siteUrl}/sitemap.xml\n`
  
  // Cache for 1 hour
  await useStorage('cache').setItem('robots:txt', robotsTxt, { ttl: 3600 })
  
  setHeader(event, 'Content-Type', 'text/plain')
  return robotsTxt
})
```

### Admin UI Component
```vue
<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Robots.txt Configuration</h1>
      <Button @click="showCreateDialog = true">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
        New User-Agent
      </Button>
    </div>
    
    <!-- Config List -->
    <div class="grid gap-4">
      <Card v-for="config in configs" :key="config.id">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-medium">{{ config.user_agent }}</h3>
            <div class="text-sm text-gray-600 dark:text-gray-400 mt-2">
              <div v-if="config.rules.allow?.length">
                Allow: {{ config.rules.allow.join(', ') }}
              </div>
              <div v-if="config.rules.disallow?.length">
                Disallow: {{ config.rules.disallow.join(', ') }}
              </div>
              <div v-if="config.crawl_delay">
                Crawl-delay: {{ config.crawl_delay }}s
              </div>
            </div>
          </div>
          
          <div class="flex gap-2">
            <Button variant="ghost" size="sm" @click="editConfig(config)">
              Edit
            </Button>
            <Button variant="ghost" size="sm" @click="deleteConfig(config.id)">
              Delete
            </Button>
          </div>
        </div>
      </Card>
    </div>
    
    <!-- Preview Panel -->
    <Card>
      <h3 class="font-medium mb-4">Preview</h3>
      <pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm">{{ preview }}</pre>
    </Card>
  </div>
</template>

<script setup lang="ts">
const { data: configs, refresh } = await useFetch('/api/admin/robots')
const { data: preview } = await useFetch('/robots.txt')

const editConfig = (config) => {
  // Open edit dialog
}

const deleteConfig = async (id) => {
  const confirmed = await showConfirmDialog({
    title: 'Delete Configuration',
    message: 'Are you sure?'
  })
  
  if (!confirmed) return
  
  await $fetch(`/api/admin/robots/${id}`, { method: 'DELETE' })
  refresh()
}
</script>
```

---

## 📁 Files to Create

- `supabase/migrations/YYYYMMDDHHMMSS_create_robots_config.sql`
- `server/api/admin/robots/index.get.ts` (~40 lines)
- `server/api/admin/robots/index.post.ts` (~60 lines)
- `server/api/admin/robots/[id].patch.ts` (~60 lines)
- `server/api/admin/robots/[id].delete.ts` (~40 lines)
- `app/pages/admin/seo/robots.vue` (~200 lines)

## 📁 Files to Modify

- `server/routes/robots.txt.get.ts` (make dynamic)
- `server/utils/cache.ts` (add invalidateRobotsTxt function)

---

## ✅ Deliverables

1. ✅ Database table for robots config
2. ✅ Admin UI for editing robots.txt
3. ✅ Support for multiple user-agents
4. ✅ Dynamic robots.txt generation
5. ✅ Live preview
6. ✅ Validation

---

## 🧪 Testing Strategy

1. Create new user-agent config → verify saves
2. Edit existing config → verify updates
3. Delete config → verify removes
4. Check `/robots.txt` → verify dynamic generation
5. Test preview updates in real-time
6. Validate with Google's robots.txt tester

---

## 🚀 Next Steps

After completion:
1. Review all Phase 7 batches
2. Test all features end-to-end
3. Update documentation
4. Plan Phase 8 (if needed)

