-- =====================================================
-- Seed local development vault secrets for job runner
-- =====================================================
-- These secrets are required for pg_cron to dispatch background jobs.
-- For production, set these via Supabase Dashboard instead.

-- Only insert if not already present
DO $$
BEGIN
  -- JOB_RUNNER_API_URL: Local Nuxt server via Docker host
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'JOB_RUNNER_API_URL') THEN
    PERFORM vault.create_secret(
      'http://host.docker.internal:3000',
      'JOB_RUNNER_API_URL',
      'Local dev API URL for job runner'
    );
  END IF;

  -- JOB_RUNNER_SECRET: Shared secret for authenticating job execution
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'JOB_RUNNER_SECRET') THEN
    PERFORM vault.create_secret(
      'dev-secret-change-in-production',
      'JOB_RUNNER_SECRET',
      'Local dev job runner secret - CHANGE IN PRODUCTION'
    );
  END IF;
END $$;
