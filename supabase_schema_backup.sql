--
-- PostgreSQL database dump
--

\restrict 74KtJ8knOII5RCgXwgVtjhdoAmvmlZ351NiF5PvorfGFszDLpPYDHo1JdBYNIX6

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: _realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA _realtime;


--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: pg_cron; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION pg_cron; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_cron IS 'Job scheduler for PostgreSQL';


--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extensions;


--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql;


--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql_public;


--
-- Name: pg_net; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_net; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_net IS 'Async HTTP';


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgbouncer;


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA realtime;


--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA storage;


--
-- Name: supabase_functions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA supabase_functions;


--
-- Name: supabase_migrations; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA supabase_migrations;


--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA vault;


--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- Name: action; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: -
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
    ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

    ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
    ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

    REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
    REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

    GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
begin
    raise debug 'PgBouncer auth request: %', p_usename;

    return query
    select 
        rolname::text, 
        case when rolvaliduntil < now() 
            then null 
            else rolpassword::text 
        end 
    from pg_authid 
    where rolname=$1 and rolcanlogin;
end;
$_$;


--
-- Name: count_contractors_by_coordinates(numeric, numeric, numeric, text, numeric); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.count_contractors_by_coordinates(p_lat numeric, p_lng numeric, p_radius_meters numeric, p_category text DEFAULT NULL::text, p_min_rating numeric DEFAULT NULL::numeric) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  result INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO result
  FROM contractors c
  WHERE c.status = 'active'
    AND c.deleted_at IS NULL
    AND c.lat IS NOT NULL
    AND c.lng IS NOT NULL
    -- Haversine distance filter (in meters)
    AND (
      6371000 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians(p_lat)) * cos(radians(c.lat)) * 
          cos(radians(c.lng) - radians(p_lng)) + 
          sin(radians(p_lat)) * sin(radians(c.lat))
        ))
      )
    ) <= p_radius_meters
    -- Optional category filter
    AND (p_category IS NULL OR c.metadata->'categories' ? p_category)
    -- Optional minimum rating filter
    AND (p_min_rating IS NULL OR (c.rating IS NOT NULL AND c.rating > 0 AND c.rating >= p_min_rating));
  
  RETURN result;
END;
$$;


--
-- Name: count_contractors_by_radius(text, double precision, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.count_contractors_by_radius(p_city_slug text, p_radius_meters double precision DEFAULT 40233.6, p_category text DEFAULT NULL::text, p_state_code text DEFAULT NULL::text) RETURNS integer
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    AS $$
DECLARE
  city_coords GEOGRAPHY;
  result_count INT;
BEGIN
  -- Get the city coordinates
  SELECT c.coordinates INTO city_coords
  FROM cities c
  WHERE c.slug = p_city_slug
    AND c.deleted_at IS NULL
    AND (p_state_code IS NULL OR c.state_code = p_state_code)
  LIMIT 1;
  
  IF city_coords IS NULL THEN
    RETURN 0;
  END IF;
  
  SELECT COUNT(*)::INT INTO result_count
  FROM contractors con
  WHERE con.deleted_at IS NULL
    AND con.status = 'active'
    AND con.coordinates IS NOT NULL
    AND ST_DWithin(con.coordinates, city_coords, p_radius_meters)
    AND (p_category IS NULL OR con.metadata->'categories' ? p_category);
  
  RETURN result_count;
END;
$$;


--
-- Name: create_background_job_with_log(text, jsonb, uuid, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_background_job_with_log(p_job_type text, p_payload jsonb DEFAULT '{}'::jsonb, p_created_by uuid DEFAULT NULL::uuid, p_scheduled_for timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS TABLE(job_id uuid, job_type text, status text, created_at timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_job_id UUID;
  v_created_at TIMESTAMPTZ;
BEGIN
  -- Insert the job (unique constraint will prevent duplicates)
  INSERT INTO background_jobs (job_type, payload, created_by, scheduled_for)
  VALUES (p_job_type, p_payload, p_created_by, p_scheduled_for)
  RETURNING id, background_jobs.created_at INTO v_job_id, v_created_at;

  -- Insert the initial system log entry
  INSERT INTO system_logs (
    level,
    log_type,
    category,
    action,
    message,
    entity_type,
    entity_id,
    actor_id,
    metadata
  ) VALUES (
    'info',
    'activity',
    'job',
    'job.created',
    'Job ' || p_job_type || ' created' || 
      CASE WHEN p_scheduled_for IS NOT NULL 
        THEN ' (scheduled for ' || p_scheduled_for::TEXT || ')' 
        ELSE '' 
      END,
    'background_job',
    v_job_id,
    p_created_by,
    jsonb_build_object(
      'job_type', p_job_type, 
      'payload', p_payload,
      'scheduled_for', p_scheduled_for
    )
  );

  -- Return the created job info
  RETURN QUERY
  SELECT v_job_id, p_job_type, 'pending'::TEXT, v_created_at;
END;
$$;


--
-- Name: FUNCTION create_background_job_with_log(p_job_type text, p_payload jsonb, p_created_by uuid, p_scheduled_for timestamp with time zone); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.create_background_job_with_log(p_job_type text, p_payload jsonb, p_created_by uuid, p_scheduled_for timestamp with time zone) IS 'Atomically creates a background job and its initial system log entry. Supports scheduled_for for delayed execution.';


--
-- Name: process_next_background_job(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.process_next_background_job() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_job RECORD;
  v_api_url TEXT;
  v_secret TEXT;
  v_request_id BIGINT;
BEGIN
  -- Get configuration from vault (set these via Supabase dashboard)
  SELECT decrypted_secret INTO v_api_url
  FROM vault.decrypted_secrets
  WHERE name = 'JOB_RUNNER_API_URL';

  SELECT decrypted_secret INTO v_secret
  FROM vault.decrypted_secrets
  WHERE name = 'JOB_RUNNER_SECRET';

  -- Skip if not configured
  IF v_api_url IS NULL OR v_secret IS NULL THEN
    RAISE NOTICE 'Job runner not configured. Set JOB_RUNNER_API_URL and JOB_RUNNER_SECRET in vault.';
    RETURN;
  END IF;

  -- Handle stuck jobs (processing for > 30 minutes)
  UPDATE background_jobs
  SET
    status = 'failed',
    last_error = 'Job timed out after 30 minutes',
    completed_at = now()
  WHERE status = 'processing'
    AND started_at < now() - INTERVAL '30 minutes';

  -- Find next pending job, respecting one-per-type concurrency
  SELECT * INTO v_job
  FROM background_jobs
  WHERE status = 'pending'
    AND (next_retry_at IS NULL OR next_retry_at <= now())
    -- NEW: Respect scheduled_for for delayed job execution (rate-limit cooldowns)
    AND (scheduled_for IS NULL OR scheduled_for <= now())
    -- Ensure no other job of same type is processing
    AND NOT EXISTS (
      SELECT 1 FROM background_jobs other
      WHERE other.job_type = background_jobs.job_type
        AND other.status = 'processing'
    )
  ORDER BY created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  -- No pending jobs found
  IF v_job IS NULL THEN
    RETURN;
  END IF;

  -- Mark job as processing
  UPDATE background_jobs
  SET
    status = 'processing',
    started_at = now(),
    attempts = attempts + 1
  WHERE id = v_job.id;

  -- Call the API endpoint to execute the job
  SELECT net.http_post(
    url := v_api_url || '/api/jobs/' || v_job.id || '/execute',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Job-Runner-Secret', v_secret
    ),
    body := '{}'::jsonb
  ) INTO v_request_id;

  RAISE NOTICE 'Dispatched job % (type: %, request_id: %)', v_job.id, v_job.job_type, v_request_id;
END;
$$;


--
-- Name: FUNCTION process_next_background_job(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.process_next_background_job() IS 'Finds and dispatches the next pending background job. Called by pg_cron every 15 seconds. Respects scheduled_for for delayed execution.';


--
-- Name: search_contractors_by_coordinates(numeric, numeric, numeric, text, numeric, integer, integer, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.search_contractors_by_coordinates(p_lat numeric, p_lng numeric, p_radius_meters numeric, p_category text DEFAULT NULL::text, p_min_rating numeric DEFAULT NULL::numeric, p_limit integer DEFAULT 20, p_offset integer DEFAULT 0, p_order_by text DEFAULT 'rating'::text, p_order_direction text DEFAULT 'desc'::text) RETURNS TABLE(id uuid, company_name text, slug text, description text, street_address text, postal_code text, phone text, website text, email text, rating numeric, review_count integer, lat numeric, lng numeric, status text, city_id uuid, metadata jsonb, created_at timestamp with time zone, updated_at timestamp with time zone, deleted_at timestamp with time zone, city_name text, city_slug text, state_code text, distance_miles double precision)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.company_name,
    c.slug,
    c.description,
    c.street_address,
    c.postal_code,
    c.phone,
    c.website,
    c.email,
    c.rating,
    c.review_count,
    c.lat,
    c.lng,
    c.status,
    c.city_id,
    c.metadata,
    c.created_at,
    c.updated_at,
    c.deleted_at,
    ci.name AS city_name,
    ci.slug AS city_slug,
    ci.state_code,
    -- Calculate distance in miles using Haversine formula
    (
      6371 * acos(
        cos(radians(p_lat)) * cos(radians(c.lat)) * 
        cos(radians(c.lng) - radians(p_lng)) + 
        sin(radians(p_lat)) * sin(radians(c.lat))
      )
    ) * 0.621371 AS distance_miles
  FROM contractors c
  INNER JOIN cities ci ON c.city_id = ci.id
  WHERE c.status = 'active'
    AND c.deleted_at IS NULL
    AND c.lat IS NOT NULL
    AND c.lng IS NOT NULL
    -- Haversine distance filter (in meters)
    AND (
      6371000 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians(p_lat)) * cos(radians(c.lat)) * 
          cos(radians(c.lng) - radians(p_lng)) + 
          sin(radians(p_lat)) * sin(radians(c.lat))
        ))
      )
    ) <= p_radius_meters
    -- Optional category filter
    AND (p_category IS NULL OR c.metadata->'categories' ? p_category)
    -- Optional minimum rating filter (exclude NULL and 0 ratings)
    AND (p_min_rating IS NULL OR (c.rating IS NOT NULL AND c.rating > 0 AND c.rating >= p_min_rating))
  ORDER BY
    CASE WHEN p_order_by = 'distance' AND p_order_direction = 'asc' THEN
      (6371 * acos(
        cos(radians(p_lat)) * cos(radians(c.lat)) * 
        cos(radians(c.lng) - radians(p_lng)) + 
        sin(radians(p_lat)) * sin(radians(c.lat))
      ))
    END ASC,
    CASE WHEN p_order_by = 'distance' AND p_order_direction = 'desc' THEN
      (6371 * acos(
        cos(radians(p_lat)) * cos(radians(c.lat)) * 
        cos(radians(c.lng) - radians(p_lng)) + 
        sin(radians(p_lat)) * sin(radians(c.lat))
      ))
    END DESC,
    CASE WHEN p_order_by = 'rating' AND p_order_direction = 'desc' THEN c.rating END DESC NULLS LAST,
    CASE WHEN p_order_by = 'rating' AND p_order_direction = 'asc' THEN c.rating END ASC NULLS LAST,
    CASE WHEN p_order_by = 'review_count' AND p_order_direction = 'desc' THEN c.review_count END DESC NULLS LAST,
    CASE WHEN p_order_by = 'review_count' AND p_order_direction = 'asc' THEN c.review_count END ASC NULLS LAST
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;


--
-- Name: search_contractors_by_radius(text, double precision, text, text, integer, integer, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.search_contractors_by_radius(p_city_slug text, p_radius_meters double precision, p_category text DEFAULT NULL::text, p_state_code text DEFAULT NULL::text, p_limit integer DEFAULT 20, p_offset integer DEFAULT 0, p_order_by text DEFAULT 'rating'::text, p_order_direction text DEFAULT 'desc'::text) RETURNS TABLE(id uuid, company_name text, slug text, description text, street_address text, postal_code text, phone text, email text, website text, rating numeric, review_count integer, status text, metadata jsonb, images_processed boolean, lat numeric, lng numeric, city_id uuid, city_name text, city_slug text, state_code text, distance_miles numeric, created_at timestamp with time zone, updated_at timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  search_city_record RECORD;
BEGIN
  -- Get the search city coordinates (the city the user searched from)
  SELECT c.id, c.coordinates, c.name, c.slug, c.state_code 
  INTO search_city_record
  FROM cities c
  WHERE c.slug = p_city_slug
    AND c.deleted_at IS NULL
    AND (p_state_code IS NULL OR c.state_code = p_state_code)
  LIMIT 1;
  
  IF search_city_record IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    con.id,
    con.company_name,
    con.slug,
    con.description,
    con.street_address,
    con.postal_code,
    con.phone,
    con.email,
    con.website,
    con.rating,
    con.review_count,
    con.status,
    con.metadata,
    con.images_processed,
    con.lat,
    con.lng,
    con.city_id,
    -- Return the contractor's ACTUAL city data, not the search city
    contractor_city.name AS city_name,
    contractor_city.slug AS city_slug,
    contractor_city.state_code AS state_code,
    ROUND((ST_Distance(con.coordinates, search_city_record.coordinates) / 1609.34)::NUMERIC, 2) AS distance_miles,
    con.created_at,
    con.updated_at
  FROM contractors con
  -- Join with the contractor's actual city
  INNER JOIN cities contractor_city ON con.city_id = contractor_city.id
  WHERE con.deleted_at IS NULL
    AND con.status = 'active'
    AND con.coordinates IS NOT NULL
    AND ST_DWithin(con.coordinates, search_city_record.coordinates, p_radius_meters)
    AND (p_category IS NULL OR con.metadata->'categories' ? p_category)
  ORDER BY
    CASE WHEN p_order_by = 'distance' AND p_order_direction = 'asc' THEN ST_Distance(con.coordinates, search_city_record.coordinates) END ASC,
    CASE WHEN p_order_by = 'distance' AND p_order_direction = 'desc' THEN ST_Distance(con.coordinates, search_city_record.coordinates) END DESC,
    CASE WHEN p_order_by = 'rating' AND p_order_direction = 'desc' THEN con.rating END DESC NULLS LAST,
    CASE WHEN p_order_by = 'rating' AND p_order_direction = 'asc' THEN con.rating END ASC NULLS LAST,
    CASE WHEN p_order_by = 'review_count' AND p_order_direction = 'desc' THEN con.review_count END DESC NULLS LAST,
    CASE WHEN p_order_by = 'review_count' AND p_order_direction = 'asc' THEN con.review_count END ASC NULLS LAST
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;


--
-- Name: update_ai_article_evals_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_ai_article_evals_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_ai_article_job_steps_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_ai_article_job_steps_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_ai_article_jobs_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_ai_article_jobs_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_ai_golden_examples_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_ai_golden_examples_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_ai_personas_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_ai_personas_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_ai_prompt_versions_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_ai_prompt_versions_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_background_jobs_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_background_jobs_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_cities_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_cities_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_contractors_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_contractors_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_coordinates_from_latlng(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_coordinates_from_latlng() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
    NEW.coordinates = ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::geography;
  ELSE
    NEW.coordinates = NULL;
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: update_import_jobs_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_import_jobs_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_menu_items_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_menu_items_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_menus_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_menus_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_reviews_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_reviews_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_service_types_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_service_types_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: FUNCTION update_updated_at_column(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.update_updated_at_column() IS 'Automatically updates the updated_at timestamp on row update';


--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    -- Generate a new UUID for the id
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


--
-- Name: add_prefixes(text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.add_prefixes(_bucket_id text, _name text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    prefixes text[];
BEGIN
    prefixes := "storage"."get_prefixes"("_name");

    IF array_length(prefixes, 1) > 0 THEN
        INSERT INTO storage.prefixes (name, bucket_id)
        SELECT UNNEST(prefixes) as name, "_bucket_id" ON CONFLICT DO NOTHING;
    END IF;
END;
$$;


--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


--
-- Name: delete_leaf_prefixes(text[], text[]); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_leaf_prefixes(bucket_ids text[], names text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_rows_deleted integer;
BEGIN
    LOOP
        WITH candidates AS (
            SELECT DISTINCT
                t.bucket_id,
                unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        ),
        uniq AS (
             SELECT
                 bucket_id,
                 name,
                 storage.get_level(name) AS level
             FROM candidates
             WHERE name <> ''
             GROUP BY bucket_id, name
        ),
        leaf AS (
             SELECT
                 p.bucket_id,
                 p.name,
                 p.level
             FROM storage.prefixes AS p
                  JOIN uniq AS u
                       ON u.bucket_id = p.bucket_id
                           AND u.name = p.name
                           AND u.level = p.level
             WHERE NOT EXISTS (
                 SELECT 1
                 FROM storage.objects AS o
                 WHERE o.bucket_id = p.bucket_id
                   AND o.level = p.level + 1
                   AND o.name COLLATE "C" LIKE p.name || '/%'
             )
             AND NOT EXISTS (
                 SELECT 1
                 FROM storage.prefixes AS c
                 WHERE c.bucket_id = p.bucket_id
                   AND c.level = p.level + 1
                   AND c.name COLLATE "C" LIKE p.name || '/%'
             )
        )
        DELETE
        FROM storage.prefixes AS p
            USING leaf AS l
        WHERE p.bucket_id = l.bucket_id
          AND p.name = l.name
          AND p.level = l.level;

        GET DIAGNOSTICS v_rows_deleted = ROW_COUNT;
        EXIT WHEN v_rows_deleted = 0;
    END LOOP;
END;
$$;


--
-- Name: delete_prefix(text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_prefix(_bucket_id text, _name text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Check if we can delete the prefix
    IF EXISTS(
        SELECT FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name") + 1
          AND "prefixes"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    )
    OR EXISTS(
        SELECT FROM "storage"."objects"
        WHERE "objects"."bucket_id" = "_bucket_id"
          AND "storage"."get_level"("objects"."name") = "storage"."get_level"("_name") + 1
          AND "objects"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    ) THEN
    -- There are sub-objects, skip deletion
    RETURN false;
    ELSE
        DELETE FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name")
          AND "prefixes"."name" = "_name";
        RETURN true;
    END IF;
END;
$$;


--
-- Name: delete_prefix_hierarchy_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_prefix_hierarchy_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    prefix text;
BEGIN
    prefix := "storage"."get_prefix"(OLD."name");

    IF coalesce(prefix, '') != '' THEN
        PERFORM "storage"."delete_prefix"(OLD."bucket_id", prefix);
    END IF;

    RETURN OLD;
END;
$$;


--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    SELECT _parts[array_length(_parts,1)] INTO _filename;
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


--
-- Name: get_level(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_level(name text) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


--
-- Name: get_prefix(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_prefix(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$_$;


--
-- Name: get_prefixes(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_prefixes(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
$$;


--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


--
-- Name: lock_top_prefixes(text[], text[]); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.lock_top_prefixes(bucket_ids text[], names text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket text;
    v_top text;
BEGIN
    FOR v_bucket, v_top IN
        SELECT DISTINCT t.bucket_id,
            split_part(t.name, '/', 1) AS top
        FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        WHERE t.name <> ''
        ORDER BY 1, 2
        LOOP
            PERFORM pg_advisory_xact_lock(hashtextextended(v_bucket || '/' || v_top, 0));
        END LOOP;
END;
$$;


--
-- Name: objects_delete_cleanup(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_delete_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket_ids text[];
    v_names      text[];
BEGIN
    IF current_setting('storage.gc.prefixes', true) = '1' THEN
        RETURN NULL;
    END IF;

    PERFORM set_config('storage.gc.prefixes', '1', true);

    SELECT COALESCE(array_agg(d.bucket_id), '{}'),
           COALESCE(array_agg(d.name), '{}')
    INTO v_bucket_ids, v_names
    FROM deleted AS d
    WHERE d.name <> '';

    PERFORM storage.lock_top_prefixes(v_bucket_ids, v_names);
    PERFORM storage.delete_leaf_prefixes(v_bucket_ids, v_names);

    RETURN NULL;
END;
$$;


--
-- Name: objects_insert_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_insert_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    NEW.level := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


--
-- Name: objects_update_cleanup(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_update_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    -- NEW - OLD (destinations to create prefixes for)
    v_add_bucket_ids text[];
    v_add_names      text[];

    -- OLD - NEW (sources to prune)
    v_src_bucket_ids text[];
    v_src_names      text[];
BEGIN
    IF TG_OP <> 'UPDATE' THEN
        RETURN NULL;
    END IF;

    -- 1) Compute NEW−OLD (added paths) and OLD−NEW (moved-away paths)
    WITH added AS (
        SELECT n.bucket_id, n.name
        FROM new_rows n
        WHERE n.name <> '' AND position('/' in n.name) > 0
        EXCEPT
        SELECT o.bucket_id, o.name FROM old_rows o WHERE o.name <> ''
    ),
    moved AS (
         SELECT o.bucket_id, o.name
         FROM old_rows o
         WHERE o.name <> ''
         EXCEPT
         SELECT n.bucket_id, n.name FROM new_rows n WHERE n.name <> ''
    )
    SELECT
        -- arrays for ADDED (dest) in stable order
        COALESCE( (SELECT array_agg(a.bucket_id ORDER BY a.bucket_id, a.name) FROM added a), '{}' ),
        COALESCE( (SELECT array_agg(a.name      ORDER BY a.bucket_id, a.name) FROM added a), '{}' ),
        -- arrays for MOVED (src) in stable order
        COALESCE( (SELECT array_agg(m.bucket_id ORDER BY m.bucket_id, m.name) FROM moved m), '{}' ),
        COALESCE( (SELECT array_agg(m.name      ORDER BY m.bucket_id, m.name) FROM moved m), '{}' )
    INTO v_add_bucket_ids, v_add_names, v_src_bucket_ids, v_src_names;

    -- Nothing to do?
    IF (array_length(v_add_bucket_ids, 1) IS NULL) AND (array_length(v_src_bucket_ids, 1) IS NULL) THEN
        RETURN NULL;
    END IF;

    -- 2) Take per-(bucket, top) locks: ALL prefixes in consistent global order to prevent deadlocks
    DECLARE
        v_all_bucket_ids text[];
        v_all_names text[];
    BEGIN
        -- Combine source and destination arrays for consistent lock ordering
        v_all_bucket_ids := COALESCE(v_src_bucket_ids, '{}') || COALESCE(v_add_bucket_ids, '{}');
        v_all_names := COALESCE(v_src_names, '{}') || COALESCE(v_add_names, '{}');

        -- Single lock call ensures consistent global ordering across all transactions
        IF array_length(v_all_bucket_ids, 1) IS NOT NULL THEN
            PERFORM storage.lock_top_prefixes(v_all_bucket_ids, v_all_names);
        END IF;
    END;

    -- 3) Create destination prefixes (NEW−OLD) BEFORE pruning sources
    IF array_length(v_add_bucket_ids, 1) IS NOT NULL THEN
        WITH candidates AS (
            SELECT DISTINCT t.bucket_id, unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(v_add_bucket_ids, v_add_names) AS t(bucket_id, name)
            WHERE name <> ''
        )
        INSERT INTO storage.prefixes (bucket_id, name)
        SELECT c.bucket_id, c.name
        FROM candidates c
        ON CONFLICT DO NOTHING;
    END IF;

    -- 4) Prune source prefixes bottom-up for OLD−NEW
    IF array_length(v_src_bucket_ids, 1) IS NOT NULL THEN
        -- re-entrancy guard so DELETE on prefixes won't recurse
        IF current_setting('storage.gc.prefixes', true) <> '1' THEN
            PERFORM set_config('storage.gc.prefixes', '1', true);
        END IF;

        PERFORM storage.delete_leaf_prefixes(v_src_bucket_ids, v_src_names);
    END IF;

    RETURN NULL;
END;
$$;


--
-- Name: objects_update_level_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_update_level_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Set the new level
        NEW."level" := "storage"."get_level"(NEW."name");
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: objects_update_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_update_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    old_prefixes TEXT[];
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Retrieve old prefixes
        old_prefixes := "storage"."get_prefixes"(OLD."name");

        -- Remove old prefixes that are only used by this object
        WITH all_prefixes as (
            SELECT unnest(old_prefixes) as prefix
        ),
        can_delete_prefixes as (
             SELECT prefix
             FROM all_prefixes
             WHERE NOT EXISTS (
                 SELECT 1 FROM "storage"."objects"
                 WHERE "bucket_id" = OLD."bucket_id"
                   AND "name" <> OLD."name"
                   AND "name" LIKE (prefix || '%')
             )
         )
        DELETE FROM "storage"."prefixes" WHERE name IN (SELECT prefix FROM can_delete_prefixes);

        -- Add new prefixes
        PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    END IF;
    -- Set the new level
    NEW."level" := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


--
-- Name: prefixes_delete_cleanup(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.prefixes_delete_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket_ids text[];
    v_names      text[];
BEGIN
    IF current_setting('storage.gc.prefixes', true) = '1' THEN
        RETURN NULL;
    END IF;

    PERFORM set_config('storage.gc.prefixes', '1', true);

    SELECT COALESCE(array_agg(d.bucket_id), '{}'),
           COALESCE(array_agg(d.name), '{}')
    INTO v_bucket_ids, v_names
    FROM deleted AS d
    WHERE d.name <> '';

    PERFORM storage.lock_top_prefixes(v_bucket_ids, v_names);
    PERFORM storage.delete_leaf_prefixes(v_bucket_ids, v_names);

    RETURN NULL;
END;
$$;


--
-- Name: prefixes_insert_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.prefixes_insert_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    RETURN NEW;
END;
$$;


--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql
    AS $$
declare
    can_bypass_rls BOOLEAN;
begin
    SELECT rolbypassrls
    INTO can_bypass_rls
    FROM pg_roles
    WHERE rolname = coalesce(nullif(current_setting('role', true), 'none'), current_user);

    IF can_bypass_rls THEN
        RETURN QUERY SELECT * FROM storage.search_v1_optimised(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    ELSE
        RETURN QUERY SELECT * FROM storage.search_legacy_v1(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    END IF;
end;
$$;


--
-- Name: search_legacy_v1(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select path_tokens[$1] as folder
           from storage.objects
             where objects.name ilike $2 || $3 || ''%''
               and bucket_id = $4
               and array_length(objects.path_tokens, 1) <> $1
           group by folder
           order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- Name: search_v1_optimised(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select (string_to_array(name, ''/''))[level] as name
           from storage.prefixes
             where lower(prefixes.name) like lower($2 || $3) || ''%''
               and bucket_id = $4
               and level = $1
           order by name ' || v_sort_order || '
     )
     (select name,
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[level] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where lower(objects.name) like lower($2 || $3) || ''%''
       and bucket_id = $4
       and level = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    sort_col text;
    sort_ord text;
    cursor_op text;
    cursor_expr text;
    sort_expr text;
BEGIN
    -- Validate sort_order
    sort_ord := lower(sort_order);
    IF sort_ord NOT IN ('asc', 'desc') THEN
        sort_ord := 'asc';
    END IF;

    -- Determine cursor comparison operator
    IF sort_ord = 'asc' THEN
        cursor_op := '>';
    ELSE
        cursor_op := '<';
    END IF;
    
    sort_col := lower(sort_column);
    -- Validate sort column  
    IF sort_col IN ('updated_at', 'created_at') THEN
        cursor_expr := format(
            '($5 = '''' OR ROW(date_trunc(''milliseconds'', %I), name COLLATE "C") %s ROW(COALESCE(NULLIF($6, '''')::timestamptz, ''epoch''::timestamptz), $5))',
            sort_col, cursor_op
        );
        sort_expr := format(
            'COALESCE(date_trunc(''milliseconds'', %I), ''epoch''::timestamptz) %s, name COLLATE "C" %s',
            sort_col, sort_ord, sort_ord
        );
    ELSE
        cursor_expr := format('($5 = '''' OR name COLLATE "C" %s $5)', cursor_op);
        sort_expr := format('name COLLATE "C" %s', sort_ord);
    END IF;

    RETURN QUERY EXECUTE format(
        $sql$
        SELECT * FROM (
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name,
                    NULL::uuid AS id,
                    updated_at,
                    created_at,
                    NULL::timestamptz AS last_accessed_at,
                    NULL::jsonb AS metadata
                FROM storage.prefixes
                WHERE name COLLATE "C" LIKE $1 || '%%'
                    AND bucket_id = $2
                    AND level = $4
                    AND %s
                ORDER BY %s
                LIMIT $3
            )
            UNION ALL
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name,
                    id,
                    updated_at,
                    created_at,
                    last_accessed_at,
                    metadata
                FROM storage.objects
                WHERE name COLLATE "C" LIKE $1 || '%%'
                    AND bucket_id = $2
                    AND level = $4
                    AND %s
                ORDER BY %s
                LIMIT $3
            )
        ) obj
        ORDER BY %s
        LIMIT $3
        $sql$,
        cursor_expr,    -- prefixes WHERE
        sort_expr,      -- prefixes ORDER BY
        cursor_expr,    -- objects WHERE
        sort_expr,      -- objects ORDER BY
        sort_expr       -- final ORDER BY
    )
    USING prefix, bucket_name, limits, levels, start_after, sort_column_after;
END;
$_$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


--
-- Name: http_request(); Type: FUNCTION; Schema: supabase_functions; Owner: -
--

CREATE FUNCTION supabase_functions.http_request() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'supabase_functions'
    AS $$
  DECLARE
    request_id bigint;
    payload jsonb;
    url text := TG_ARGV[0]::text;
    method text := TG_ARGV[1]::text;
    headers jsonb DEFAULT '{}'::jsonb;
    params jsonb DEFAULT '{}'::jsonb;
    timeout_ms integer DEFAULT 1000;
  BEGIN
    IF url IS NULL OR url = 'null' THEN
      RAISE EXCEPTION 'url argument is missing';
    END IF;

    IF method IS NULL OR method = 'null' THEN
      RAISE EXCEPTION 'method argument is missing';
    END IF;

    IF TG_ARGV[2] IS NULL OR TG_ARGV[2] = 'null' THEN
      headers = '{"Content-Type": "application/json"}'::jsonb;
    ELSE
      headers = TG_ARGV[2]::jsonb;
    END IF;

    IF TG_ARGV[3] IS NULL OR TG_ARGV[3] = 'null' THEN
      params = '{}'::jsonb;
    ELSE
      params = TG_ARGV[3]::jsonb;
    END IF;

    IF TG_ARGV[4] IS NULL OR TG_ARGV[4] = 'null' THEN
      timeout_ms = 1000;
    ELSE
      timeout_ms = TG_ARGV[4]::integer;
    END IF;

    CASE
      WHEN method = 'GET' THEN
        SELECT http_get INTO request_id FROM net.http_get(
          url,
          params,
          headers,
          timeout_ms
        );
      WHEN method = 'POST' THEN
        payload = jsonb_build_object(
          'old_record', OLD,
          'record', NEW,
          'type', TG_OP,
          'table', TG_TABLE_NAME,
          'schema', TG_TABLE_SCHEMA
        );

        SELECT http_post INTO request_id FROM net.http_post(
          url,
          payload,
          params,
          headers,
          timeout_ms
        );
      ELSE
        RAISE EXCEPTION 'method argument % is invalid', method;
    END CASE;

    INSERT INTO supabase_functions.hooks
      (hook_table_id, hook_name, request_id)
    VALUES
      (TG_RELID, TG_NAME, request_id);

    RETURN NEW;
  END
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: extensions; Type: TABLE; Schema: _realtime; Owner: -
--

CREATE TABLE _realtime.extensions (
    id uuid NOT NULL,
    type text,
    settings jsonb,
    tenant_external_id text,
    inserted_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: _realtime; Owner: -
--

CREATE TABLE _realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


--
-- Name: tenants; Type: TABLE; Schema: _realtime; Owner: -
--

CREATE TABLE _realtime.tenants (
    id uuid NOT NULL,
    name text,
    external_id text,
    jwt_secret character varying(255),
    max_concurrent_users integer DEFAULT 200 NOT NULL,
    inserted_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL,
    max_events_per_second integer DEFAULT 100 NOT NULL,
    postgres_cdc_default text DEFAULT 'postgres_cdc_rls'::text,
    max_bytes_per_second integer DEFAULT 100000 NOT NULL,
    max_channels_per_client integer DEFAULT 100 NOT NULL,
    max_joins_per_second integer DEFAULT 500 NOT NULL,
    suspend boolean DEFAULT false,
    jwt_jwks jsonb,
    notify_private_alpha boolean DEFAULT false,
    private_only boolean DEFAULT false NOT NULL,
    migrations_ran integer DEFAULT 0,
    broadcast_adapter character varying(255) DEFAULT 'gen_rpc'::character varying,
    max_presence_events_per_second integer DEFAULT 1000,
    max_payload_size_in_kb integer DEFAULT 3000,
    CONSTRAINT jwt_secret_or_jwt_jwks_required CHECK (((jwt_secret IS NOT NULL) OR (jwt_jwks IS NOT NULL)))
);


--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


--
-- Name: oauth_client_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_client_states (
    id uuid NOT NULL,
    provider_type text NOT NULL,
    code_verifier text,
    created_at timestamp with time zone NOT NULL
);


--
-- Name: TABLE oauth_client_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.oauth_client_states IS 'Stores OAuth states for third-party provider authentication flows where Supabase acts as the OAuth client.';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048))
);


--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: account_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.account_profiles (
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    account_type text DEFAULT 'business'::text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    is_admin boolean GENERATED ALWAYS AS ((account_type = 'admin'::text)) STORED,
    status text DEFAULT 'active'::text NOT NULL,
    CONSTRAINT account_profiles_status_check CHECK ((status = ANY (ARRAY['active'::text, 'suspended'::text, 'deleted'::text])))
);


--
-- Name: TABLE account_profiles; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.account_profiles IS 'Per-account profile and roles for application-level auth (admin vs business, etc.)';


--
-- Name: COLUMN account_profiles.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.account_profiles.id IS 'FK to auth.users.id';


--
-- Name: COLUMN account_profiles.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.account_profiles.created_at IS 'Timestamp when profile was created';


--
-- Name: COLUMN account_profiles.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.account_profiles.updated_at IS 'Timestamp when profile was last updated';


--
-- Name: COLUMN account_profiles.account_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.account_profiles.account_type IS 'Account type (e.g., admin, business).';


--
-- Name: COLUMN account_profiles.metadata; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.account_profiles.metadata IS 'Flexible JSONB bag for per-account settings and future expansion.';


--
-- Name: COLUMN account_profiles.is_admin; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.account_profiles.is_admin IS 'Computed flag indicating whether this account is an admin.';


--
-- Name: COLUMN account_profiles.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.account_profiles.status IS 'Account status: active (can log in), suspended (temporarily blocked), deleted (soft-deleted)';


--
-- Name: ai_article_evals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_article_evals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL,
    step_id uuid,
    eval_type text DEFAULT 'automated'::text NOT NULL,
    iteration integer DEFAULT 1,
    overall_score integer,
    readability_score integer,
    seo_score integer,
    accuracy_score integer,
    engagement_score integer,
    brand_voice_score integer,
    passed boolean,
    feedback text,
    issues jsonb DEFAULT '[]'::jsonb,
    rated_by uuid,
    rated_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT ai_article_evals_accuracy_score_check CHECK (((accuracy_score >= 0) AND (accuracy_score <= 100))),
    CONSTRAINT ai_article_evals_brand_voice_score_check CHECK (((brand_voice_score >= 0) AND (brand_voice_score <= 100))),
    CONSTRAINT ai_article_evals_engagement_score_check CHECK (((engagement_score >= 0) AND (engagement_score <= 100))),
    CONSTRAINT ai_article_evals_eval_type_check CHECK ((eval_type = ANY (ARRAY['automated'::text, 'human'::text]))),
    CONSTRAINT ai_article_evals_overall_score_check CHECK (((overall_score >= 0) AND (overall_score <= 100))),
    CONSTRAINT ai_article_evals_readability_score_check CHECK (((readability_score >= 0) AND (readability_score <= 100))),
    CONSTRAINT ai_article_evals_seo_score_check CHECK (((seo_score >= 0) AND (seo_score <= 100)))
);


--
-- Name: TABLE ai_article_evals; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.ai_article_evals IS 'Evaluation scores for AI-generated articles (automated and human)';


--
-- Name: COLUMN ai_article_evals.job_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_article_evals.job_id IS 'Article job being evaluated';


--
-- Name: COLUMN ai_article_evals.step_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_article_evals.step_id IS 'Specific step that triggered this eval (usually QA)';


--
-- Name: COLUMN ai_article_evals.eval_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_article_evals.eval_type IS 'automated (QA agent) or human (manual review)';


--
-- Name: COLUMN ai_article_evals.overall_score; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_article_evals.overall_score IS 'Aggregate quality score (0-100)';


--
-- Name: COLUMN ai_article_evals.readability_score; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_article_evals.readability_score IS 'Reading level and clarity score';


--
-- Name: COLUMN ai_article_evals.seo_score; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_article_evals.seo_score IS 'SEO optimization score';


--
-- Name: COLUMN ai_article_evals.accuracy_score; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_article_evals.accuracy_score IS 'Factual accuracy score';


--
-- Name: COLUMN ai_article_evals.engagement_score; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_article_evals.engagement_score IS 'Reader engagement potential score';


--
-- Name: COLUMN ai_article_evals.brand_voice_score; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_article_evals.brand_voice_score IS 'Brand voice consistency score';


--
-- Name: COLUMN ai_article_evals.issues; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_article_evals.issues IS 'Array of detected issues with categories and suggestions';


--
-- Name: ai_article_job_steps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_article_job_steps (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL,
    agent_type text NOT NULL,
    persona_id uuid,
    iteration integer DEFAULT 1,
    status text DEFAULT 'pending'::text NOT NULL,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    duration_ms integer,
    input jsonb,
    output jsonb,
    tokens_used integer DEFAULT 0,
    prompt_tokens integer DEFAULT 0,
    completion_tokens integer DEFAULT 0,
    logs jsonb DEFAULT '[]'::jsonb,
    error_message text,
    error_details jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT ai_article_job_steps_agent_type_check CHECK ((agent_type = ANY (ARRAY['research'::text, 'writer'::text, 'seo'::text, 'qa'::text, 'project_manager'::text]))),
    CONSTRAINT ai_article_job_steps_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'running'::text, 'completed'::text, 'failed'::text, 'skipped'::text])))
);


--
-- Name: TABLE ai_article_job_steps; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.ai_article_job_steps IS 'Individual agent execution steps within an article job';


--
-- Name: COLUMN ai_article_job_steps.job_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_article_job_steps.job_id IS 'Parent article job';


--
-- Name: COLUMN ai_article_job_steps.agent_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_article_job_steps.agent_type IS 'Type of agent that executed this step';


--
-- Name: COLUMN ai_article_job_steps.persona_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_article_job_steps.persona_id IS 'Persona used for this step';


--
-- Name: COLUMN ai_article_job_steps.iteration; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_article_job_steps.iteration IS 'Iteration number (for QA feedback loops)';


--
-- Name: COLUMN ai_article_job_steps.duration_ms; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_article_job_steps.duration_ms IS 'Execution time in milliseconds';


--
-- Name: COLUMN ai_article_job_steps.input; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_article_job_steps.input IS 'Input data provided to the agent';


--
-- Name: COLUMN ai_article_job_steps.output; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_article_job_steps.output IS 'Structured output from the agent';


--
-- Name: COLUMN ai_article_job_steps.logs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_article_job_steps.logs IS 'Verbose log entries for Agent Room display';


--
-- Name: ai_article_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_article_jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    keyword text NOT NULL,
    settings jsonb DEFAULT '{}'::jsonb,
    status text DEFAULT 'pending'::text NOT NULL,
    current_agent text,
    progress_percent integer DEFAULT 0,
    current_iteration integer DEFAULT 1,
    max_iterations integer DEFAULT 3,
    total_tokens_used integer DEFAULT 0,
    estimated_cost_usd numeric(10,6) DEFAULT 0,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    page_id uuid,
    final_output jsonb,
    last_error text,
    priority integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT ai_article_jobs_current_agent_check CHECK ((current_agent = ANY (ARRAY['research'::text, 'writer'::text, 'seo'::text, 'qa'::text, 'project_manager'::text]))),
    CONSTRAINT ai_article_jobs_progress_percent_check CHECK (((progress_percent >= 0) AND (progress_percent <= 100))),
    CONSTRAINT ai_article_jobs_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'failed'::text, 'cancelled'::text])))
);


--
-- Name: TABLE ai_article_jobs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.ai_article_jobs IS 'Article generation jobs for the multi-agent AI writing pipeline';


--
-- Name: COLUMN ai_article_jobs.keyword; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_article_jobs.keyword IS 'Target keyword/topic for article generation';


--
-- Name: COLUMN ai_article_jobs.settings; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_article_jobs.settings IS 'Job configuration including autoPost, targetWordCount, pipeline config';


--
-- Name: COLUMN ai_article_jobs.current_agent; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_article_jobs.current_agent IS 'Currently executing agent in the pipeline';


--
-- Name: COLUMN ai_article_jobs.current_iteration; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_article_jobs.current_iteration IS 'Current QA feedback loop iteration';


--
-- Name: COLUMN ai_article_jobs.total_tokens_used; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_article_jobs.total_tokens_used IS 'Cumulative token usage across all agents';


--
-- Name: COLUMN ai_article_jobs.page_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_article_jobs.page_id IS 'Reference to created page (if autoPost enabled)';


--
-- Name: COLUMN ai_article_jobs.final_output; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_article_jobs.final_output IS 'Aggregated output from all agents';


--
-- Name: COLUMN ai_article_jobs.priority; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_article_jobs.priority IS 'Queue priority (higher = processed first)';


--
-- Name: ai_golden_examples; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_golden_examples (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    agent_type text NOT NULL,
    title text NOT NULL,
    description text,
    input_example jsonb NOT NULL,
    output_example jsonb NOT NULL,
    source_job_id uuid,
    source_step_id uuid,
    quality_score integer,
    tags text[] DEFAULT '{}'::text[],
    is_active boolean DEFAULT true,
    usage_count integer DEFAULT 0,
    last_used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    deleted_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT ai_golden_examples_agent_type_check CHECK ((agent_type = ANY (ARRAY['research'::text, 'writer'::text, 'seo'::text, 'qa'::text, 'project_manager'::text]))),
    CONSTRAINT ai_golden_examples_quality_score_check CHECK (((quality_score >= 0) AND (quality_score <= 100)))
);


--
-- Name: TABLE ai_golden_examples; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.ai_golden_examples IS 'High-quality examples for few-shot learning in AI agents';


--
-- Name: COLUMN ai_golden_examples.agent_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_golden_examples.agent_type IS 'Type of agent this example is for';


--
-- Name: COLUMN ai_golden_examples.input_example; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_golden_examples.input_example IS 'Example input that was provided to the agent';


--
-- Name: COLUMN ai_golden_examples.output_example; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_golden_examples.output_example IS 'High-quality output that the agent produced';


--
-- Name: COLUMN ai_golden_examples.source_job_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_golden_examples.source_job_id IS 'Original job this example came from';


--
-- Name: COLUMN ai_golden_examples.quality_score; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_golden_examples.quality_score IS 'Quality score from evaluation';


--
-- Name: COLUMN ai_golden_examples.tags; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_golden_examples.tags IS 'Tags for categorization (e.g., topic, style)';


--
-- Name: COLUMN ai_golden_examples.usage_count; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_golden_examples.usage_count IS 'How many times this example has been used';


--
-- Name: ai_personas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_personas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    agent_type text NOT NULL,
    name text NOT NULL,
    description text,
    system_prompt text NOT NULL,
    provider text DEFAULT 'anthropic'::text NOT NULL,
    model text DEFAULT 'claude-sonnet-4-20250514'::text NOT NULL,
    temperature numeric(3,2) DEFAULT 0.7,
    max_tokens integer DEFAULT 4096,
    is_default boolean DEFAULT false,
    is_enabled boolean DEFAULT true,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    CONSTRAINT ai_personas_agent_type_check CHECK ((agent_type = ANY (ARRAY['research'::text, 'writer'::text, 'seo'::text, 'qa'::text, 'project_manager'::text]))),
    CONSTRAINT ai_personas_provider_check CHECK ((provider = ANY (ARRAY['anthropic'::text, 'openai'::text]))),
    CONSTRAINT ai_personas_temperature_check CHECK (((temperature >= (0)::numeric) AND (temperature <= (2)::numeric)))
);


--
-- Name: TABLE ai_personas; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.ai_personas IS 'AI agent personas with system prompts and model configuration for the multi-agent article writing system';


--
-- Name: COLUMN ai_personas.agent_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_personas.agent_type IS 'Type of agent: research, writer, seo, qa, project_manager';


--
-- Name: COLUMN ai_personas.system_prompt; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_personas.system_prompt IS 'Full system prompt sent to the LLM';


--
-- Name: COLUMN ai_personas.provider; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_personas.provider IS 'LLM provider: anthropic, openai';


--
-- Name: COLUMN ai_personas.model; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_personas.model IS 'Model identifier (e.g., claude-sonnet-4-20250514, gpt-4o)';


--
-- Name: COLUMN ai_personas.is_default; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_personas.is_default IS 'Default persona for this agent type (only one per type)';


--
-- Name: COLUMN ai_personas.metadata; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_personas.metadata IS 'Additional configuration (stop sequences, tools, etc.)';


--
-- Name: ai_prompt_versions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_prompt_versions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    persona_id uuid NOT NULL,
    version integer NOT NULL,
    system_prompt text NOT NULL,
    is_primary boolean DEFAULT false,
    is_challenger boolean DEFAULT false,
    traffic_split integer DEFAULT 0,
    total_uses integer DEFAULT 0,
    avg_eval_score numeric(5,2),
    pass_rate numeric(5,2),
    status text DEFAULT 'draft'::text NOT NULL,
    promoted_at timestamp with time zone,
    archived_at timestamp with time zone,
    change_notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT ai_prompt_versions_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'active'::text, 'archived'::text]))),
    CONSTRAINT ai_prompt_versions_traffic_split_check CHECK (((traffic_split >= 0) AND (traffic_split <= 100)))
);


--
-- Name: TABLE ai_prompt_versions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.ai_prompt_versions IS 'Version history for AI persona prompts with A/B testing support';


--
-- Name: COLUMN ai_prompt_versions.persona_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_prompt_versions.persona_id IS 'Parent persona this version belongs to';


--
-- Name: COLUMN ai_prompt_versions.version; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_prompt_versions.version IS 'Version number (auto-incremented per persona)';


--
-- Name: COLUMN ai_prompt_versions.is_primary; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_prompt_versions.is_primary IS 'Primary version receiving most traffic';


--
-- Name: COLUMN ai_prompt_versions.is_challenger; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_prompt_versions.is_challenger IS 'Challenger version for A/B testing';


--
-- Name: COLUMN ai_prompt_versions.traffic_split; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_prompt_versions.traffic_split IS 'Percentage of traffic to this version';


--
-- Name: COLUMN ai_prompt_versions.avg_eval_score; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_prompt_versions.avg_eval_score IS 'Average evaluation score across uses';


--
-- Name: COLUMN ai_prompt_versions.pass_rate; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_prompt_versions.pass_rate IS 'Percentage of uses that passed QA';


--
-- Name: COLUMN ai_prompt_versions.change_notes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ai_prompt_versions.change_notes IS 'Notes about what changed in this version';


--
-- Name: background_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.background_jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    job_type text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    max_attempts integer DEFAULT 3 NOT NULL,
    next_retry_at timestamp with time zone,
    last_error text,
    total_items integer,
    processed_items integer DEFAULT 0 NOT NULL,
    failed_items integer DEFAULT 0 NOT NULL,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    result jsonb,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    created_by uuid,
    scheduled_for timestamp with time zone,
    CONSTRAINT background_jobs_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'failed'::text, 'cancelled'::text])))
);


--
-- Name: TABLE background_jobs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.background_jobs IS 'Generic background job queue supporting multiple job types with retry logic and progress tracking.';


--
-- Name: COLUMN background_jobs.job_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.background_jobs.job_type IS 'Type of job (e.g., image_enrichment, ai_contractor_enrichment, page_generation)';


--
-- Name: COLUMN background_jobs.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.background_jobs.status IS 'Job status: pending, processing, completed, failed, cancelled';


--
-- Name: COLUMN background_jobs.attempts; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.background_jobs.attempts IS 'Number of execution attempts made';


--
-- Name: COLUMN background_jobs.max_attempts; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.background_jobs.max_attempts IS 'Maximum retry attempts before marking as failed (default: 3)';


--
-- Name: COLUMN background_jobs.next_retry_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.background_jobs.next_retry_at IS 'When to retry after a failure (exponential backoff)';


--
-- Name: COLUMN background_jobs.last_error; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.background_jobs.last_error IS 'Error message from the most recent failure';


--
-- Name: COLUMN background_jobs.total_items; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.background_jobs.total_items IS 'Total items to process (for progress calculation)';


--
-- Name: COLUMN background_jobs.processed_items; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.background_jobs.processed_items IS 'Number of items successfully processed';


--
-- Name: COLUMN background_jobs.failed_items; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.background_jobs.failed_items IS 'Number of items that failed processing';


--
-- Name: COLUMN background_jobs.payload; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.background_jobs.payload IS 'Job input parameters (JSONB)';


--
-- Name: COLUMN background_jobs.result; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.background_jobs.result IS 'Job output/summary data (JSONB)';


--
-- Name: COLUMN background_jobs.created_by; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.background_jobs.created_by IS 'User who initiated the job';


--
-- Name: COLUMN background_jobs.scheduled_for; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.background_jobs.scheduled_for IS 'Job will not execute until this time. NULL = execute immediately. Used for rate-limit cooldown retry queuing.';


--
-- Name: business_claims; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.business_claims (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    contractor_id uuid NOT NULL,
    claimant_user_id uuid,
    claimant_email text NOT NULL,
    claimant_name text,
    claimant_phone text,
    verification_method text,
    status text DEFAULT 'unverified'::text NOT NULL,
    admin_notes text,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    email_verification_token uuid,
    email_verified_at timestamp with time zone,
    email_verification_expires_at timestamp with time zone,
    account_activation_token uuid,
    account_activated_at timestamp with time zone,
    account_activation_expires_at timestamp with time zone,
    CONSTRAINT business_claims_status_check CHECK ((status = ANY (ARRAY['unverified'::text, 'pending'::text, 'approved'::text, 'rejected'::text, 'completed'::text]))),
    CONSTRAINT business_claims_verification_method_check CHECK ((verification_method = ANY (ARRAY['email_match'::text, 'admin_approval'::text, 'authenticated_user'::text])))
);


--
-- Name: TABLE business_claims; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.business_claims IS 'Tracks business claim requests from users wanting to manage contractor profiles';


--
-- Name: COLUMN business_claims.verification_method; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_claims.verification_method IS 'How the claim was verified: email_match (auto) or admin_approval (manual)';


--
-- Name: COLUMN business_claims.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_claims.status IS 'Claim status: unverified (email not verified), pending (awaiting admin review), approved (can activate account), rejected, completed (account created)';


--
-- Name: COLUMN business_claims.email_verification_token; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_claims.email_verification_token IS 'UUID token sent via email to verify claimant owns the email address';


--
-- Name: COLUMN business_claims.email_verified_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_claims.email_verified_at IS 'Timestamp when claimant verified their email address';


--
-- Name: COLUMN business_claims.email_verification_expires_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_claims.email_verification_expires_at IS 'Token expiration (24 hours from claim submission)';


--
-- Name: COLUMN business_claims.account_activation_token; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_claims.account_activation_token IS 'UUID token sent after approval for account activation';


--
-- Name: COLUMN business_claims.account_activated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_claims.account_activated_at IS 'Timestamp when claimant completed account activation (set password)';


--
-- Name: COLUMN business_claims.account_activation_expires_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.business_claims.account_activation_expires_at IS 'Token expiration (7 days from approval)';


--
-- Name: cities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    state_code text NOT NULL,
    lat numeric,
    lng numeric,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone,
    coordinates public.geography(Point,4326),
    CONSTRAINT valid_city_slug_format CHECK ((slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'::text)),
    CONSTRAINT valid_state_code CHECK ((state_code ~ '^[A-Z]{2}$'::text))
);


--
-- Name: TABLE cities; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.cities IS 'Cities for contractor locations with geographic coordinates';


--
-- Name: contractor_service_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contractor_service_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    contractor_id uuid NOT NULL,
    service_type_id uuid NOT NULL,
    confidence_score numeric(3,2),
    source text DEFAULT 'ai_enrichment'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT contractor_service_types_confidence_score_check CHECK (((confidence_score >= (0)::numeric) AND (confidence_score <= (1)::numeric))),
    CONSTRAINT contractor_service_types_source_check CHECK ((source = ANY (ARRAY['ai_enrichment'::text, 'manual'::text, 'import'::text])))
);


--
-- Name: TABLE contractor_service_types; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.contractor_service_types IS 'Junction table linking contractors to their service types with AI-inferred confidence scores';


--
-- Name: contractors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contractors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    google_place_id text,
    google_cid text,
    company_name text NOT NULL,
    slug text NOT NULL,
    description text,
    city_id uuid,
    street_address text,
    postal_code text,
    lat numeric,
    lng numeric,
    phone text,
    website text,
    email text,
    rating numeric(2,1),
    review_count integer DEFAULT 0,
    status text DEFAULT 'pending'::text NOT NULL,
    images_processed boolean DEFAULT false NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone,
    coordinates public.geography(Point,4326),
    is_claimed boolean DEFAULT false NOT NULL,
    claimed_by uuid,
    claimed_at timestamp with time zone,
    CONSTRAINT contractors_rating_check CHECK (((rating >= 1.0) AND (rating <= 5.0))),
    CONSTRAINT valid_contractor_slug_format CHECK ((slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'::text)),
    CONSTRAINT valid_contractor_status CHECK ((status = ANY (ARRAY['pending'::text, 'active'::text, 'suspended'::text])))
);


--
-- Name: TABLE contractors; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.contractors IS 'Contractor business profiles with Google Places integration';


--
-- Name: COLUMN contractors.is_claimed; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.contractors.is_claimed IS 'Whether this contractor profile has been claimed by a business owner';


--
-- Name: COLUMN contractors.claimed_by; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.contractors.claimed_by IS 'The user ID who claimed this contractor profile';


--
-- Name: COLUMN contractors.claimed_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.contractors.claimed_at IS 'When the contractor profile was claimed';


--
-- Name: import_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.import_jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    filename text,
    status text DEFAULT 'pending'::text NOT NULL,
    total_rows integer DEFAULT 0 NOT NULL,
    processed_rows integer DEFAULT 0 NOT NULL,
    imported_count integer DEFAULT 0 NOT NULL,
    updated_count integer DEFAULT 0 NOT NULL,
    skipped_count integer DEFAULT 0 NOT NULL,
    skipped_claimed_count integer DEFAULT 0 NOT NULL,
    error_count integer DEFAULT 0 NOT NULL,
    pending_image_count integer DEFAULT 0 NOT NULL,
    raw_data jsonb DEFAULT '[]'::jsonb NOT NULL,
    errors jsonb DEFAULT '[]'::jsonb NOT NULL,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    reviews_imported_count integer DEFAULT 0 NOT NULL,
    CONSTRAINT import_jobs_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'failed'::text, 'cancelled'::text])))
);


--
-- Name: TABLE import_jobs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.import_jobs IS 'Batch import job queue for contractor imports. Stores raw Apify JSON and tracks processing progress.';


--
-- Name: COLUMN import_jobs.raw_data; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.import_jobs.raw_data IS 'Array of Apify rows to process. Rows are processed in order by index.';


--
-- Name: COLUMN import_jobs.errors; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.import_jobs.errors IS 'Array of error objects: {row: number, placeId: string|null, message: string}';


--
-- Name: COLUMN import_jobs.reviews_imported_count; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.import_jobs.reviews_imported_count IS 'Total number of reviews imported during this job';


--
-- Name: menu_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.menu_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    menu_id uuid NOT NULL,
    parent_id uuid,
    page_id uuid,
    custom_url text,
    label text NOT NULL,
    description text,
    open_in_new_tab boolean DEFAULT false NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    is_enabled boolean DEFAULT true NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    link_type text DEFAULT 'page'::text NOT NULL,
    CONSTRAINT dropdown_must_be_top_level CHECK (((link_type <> 'dropdown'::text) OR (parent_id IS NULL))),
    CONSTRAINT link_source_valid CHECK ((((link_type = 'dropdown'::text) AND (page_id IS NULL) AND (custom_url IS NULL) AND (parent_id IS NULL)) OR ((link_type = 'page'::text) AND (page_id IS NOT NULL) AND (custom_url IS NULL)) OR ((link_type = 'custom'::text) AND (page_id IS NULL) AND (custom_url IS NOT NULL)))),
    CONSTRAINT menu_items_link_type_check CHECK ((link_type = ANY (ARRAY['dropdown'::text, 'page'::text, 'custom'::text])))
);


--
-- Name: TABLE menu_items; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.menu_items IS 'Menu items with support for dropdown menus (label-only), page links, and custom URLs';


--
-- Name: COLUMN menu_items.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menu_items.id IS 'Unique identifier for the menu item';


--
-- Name: COLUMN menu_items.menu_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menu_items.menu_id IS 'Reference to parent menu';


--
-- Name: COLUMN menu_items.parent_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menu_items.parent_id IS 'Reference to parent item (NULL = top-level)';


--
-- Name: COLUMN menu_items.page_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menu_items.page_id IS 'Reference to page (mutually exclusive with custom_url)';


--
-- Name: COLUMN menu_items.custom_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menu_items.custom_url IS 'Custom URL (mutually exclusive with page_id)';


--
-- Name: COLUMN menu_items.label; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menu_items.label IS 'Display text for the menu item';


--
-- Name: COLUMN menu_items.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menu_items.description IS 'Optional description (shown in dropdowns for child items)';


--
-- Name: COLUMN menu_items.open_in_new_tab; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menu_items.open_in_new_tab IS 'Whether to open link in new tab';


--
-- Name: COLUMN menu_items.display_order; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menu_items.display_order IS 'Order within parent (0-indexed)';


--
-- Name: COLUMN menu_items.is_enabled; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menu_items.is_enabled IS 'Whether this item is visible';


--
-- Name: COLUMN menu_items.metadata; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menu_items.metadata IS 'Flexible JSONB for future extensibility';


--
-- Name: COLUMN menu_items.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menu_items.created_at IS 'Timestamp when item was created';


--
-- Name: COLUMN menu_items.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menu_items.updated_at IS 'Timestamp when item was last updated';


--
-- Name: COLUMN menu_items.created_by; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menu_items.created_by IS 'User who created the item';


--
-- Name: COLUMN menu_items.updated_by; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menu_items.updated_by IS 'User who last updated the item';


--
-- Name: COLUMN menu_items.deleted_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menu_items.deleted_at IS 'Timestamp when item was soft deleted (NULL if active)';


--
-- Name: COLUMN menu_items.link_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menu_items.link_type IS 'Type of menu item: dropdown (label-only), page (internal link), or custom (external URL)';


--
-- Name: menus; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.menus (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    show_in_header boolean DEFAULT false NOT NULL,
    show_in_footer boolean DEFAULT false NOT NULL,
    is_enabled boolean DEFAULT true NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    CONSTRAINT valid_slug_format CHECK ((slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'::text))
);


--
-- Name: TABLE menus; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.menus IS 'Navigation menus with location controls. A menu can be in Header, Footer, or None (not displayed).';


--
-- Name: COLUMN menus.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menus.id IS 'Unique identifier for the menu';


--
-- Name: COLUMN menus.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menus.name IS 'Display name of the menu (e.g., "Main Navigation")';


--
-- Name: COLUMN menus.slug; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menus.slug IS 'URL-friendly identifier (e.g., "main-nav")';


--
-- Name: COLUMN menus.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menus.description IS 'Admin notes about the menu purpose';


--
-- Name: COLUMN menus.show_in_header; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menus.show_in_header IS 'Whether this menu appears in the header';


--
-- Name: COLUMN menus.show_in_footer; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menus.show_in_footer IS 'Whether this menu appears in the footer';


--
-- Name: COLUMN menus.is_enabled; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menus.is_enabled IS 'Master on/off switch for the entire menu';


--
-- Name: COLUMN menus.display_order; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menus.display_order IS 'Order when multiple menus in same location';


--
-- Name: COLUMN menus.metadata; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menus.metadata IS 'Flexible JSONB for future extensibility';


--
-- Name: COLUMN menus.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menus.created_at IS 'Timestamp when menu was created';


--
-- Name: COLUMN menus.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menus.updated_at IS 'Timestamp when menu was last updated';


--
-- Name: COLUMN menus.created_by; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menus.created_by IS 'User who created the menu';


--
-- Name: COLUMN menus.updated_by; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menus.updated_by IS 'User who last updated the menu';


--
-- Name: COLUMN menus.deleted_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menus.deleted_at IS 'Timestamp when menu was soft deleted (NULL if active)';


--
-- Name: page_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.page_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    description text,
    component_name text NOT NULL,
    metadata_schema jsonb DEFAULT '{}'::jsonb NOT NULL,
    default_metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    color text NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    is_enabled boolean DEFAULT true NOT NULL,
    is_system boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    CONSTRAINT valid_component_name_format CHECK ((component_name ~ '^[A-Z][a-zA-Z0-9]*$'::text)),
    CONSTRAINT valid_slug_format CHECK ((slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'::text))
);


--
-- Name: TABLE page_templates; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.page_templates IS 'Database-driven page template system for flexible template management';


--
-- Name: COLUMN page_templates.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.page_templates.id IS 'Unique identifier for the template';


--
-- Name: COLUMN page_templates.slug; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.page_templates.slug IS 'URL-friendly identifier (kebab-case)';


--
-- Name: COLUMN page_templates.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.page_templates.name IS 'Display name for the template';


--
-- Name: COLUMN page_templates.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.page_templates.description IS 'Description of template purpose and usage';


--
-- Name: COLUMN page_templates.component_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.page_templates.component_name IS 'Vue component name (PascalCase)';


--
-- Name: COLUMN page_templates.metadata_schema; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.page_templates.metadata_schema IS 'JSON Schema for validating template metadata';


--
-- Name: COLUMN page_templates.default_metadata; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.page_templates.default_metadata IS 'Default metadata values for new pages';


--
-- Name: COLUMN page_templates.color; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.page_templates.color IS 'Hex color for UI badges and visual identification';


--
-- Name: COLUMN page_templates.display_order; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.page_templates.display_order IS 'Order for displaying templates in UI';


--
-- Name: COLUMN page_templates.is_enabled; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.page_templates.is_enabled IS 'Whether template is available for use';


--
-- Name: COLUMN page_templates.is_system; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.page_templates.is_system IS 'System templates cannot be deleted';


--
-- Name: COLUMN page_templates.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.page_templates.created_at IS 'Timestamp when template was created';


--
-- Name: COLUMN page_templates.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.page_templates.updated_at IS 'Timestamp when template was last updated';


--
-- Name: COLUMN page_templates.created_by; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.page_templates.created_by IS 'User who created the template';


--
-- Name: COLUMN page_templates.updated_by; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.page_templates.updated_by IS 'User who last updated the template';


--
-- Name: COLUMN page_templates.deleted_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.page_templates.deleted_at IS 'Timestamp when template was soft-deleted';


--
-- Name: pages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parent_id uuid,
    slug text NOT NULL,
    full_path text NOT NULL,
    depth integer DEFAULT 0 NOT NULL,
    template text DEFAULT 'default'::text NOT NULL,
    title text NOT NULL,
    description text,
    content text NOT NULL,
    meta_title text,
    meta_keywords text[],
    og_image text,
    status text DEFAULT 'draft'::text NOT NULL,
    published_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    canonical_url text,
    meta_robots text[] DEFAULT ARRAY['index'::text, 'follow'::text],
    focus_keyword text,
    sitemap_priority numeric(2,1) DEFAULT 0.5,
    sitemap_changefreq text DEFAULT 'weekly'::text,
    redirect_url text,
    redirect_type integer DEFAULT 301,
    CONSTRAINT valid_meta_robots CHECK ((meta_robots <@ ARRAY['index'::text, 'noindex'::text, 'follow'::text, 'nofollow'::text, 'noarchive'::text, 'nosnippet'::text, 'noimageindex'::text, 'notranslate'::text, 'none'::text, 'all'::text])),
    CONSTRAINT valid_redirect_type CHECK ((redirect_type = ANY (ARRAY[301, 302, 307, 308]))),
    CONSTRAINT valid_sitemap_changefreq CHECK ((sitemap_changefreq = ANY (ARRAY['always'::text, 'hourly'::text, 'daily'::text, 'weekly'::text, 'monthly'::text, 'yearly'::text, 'never'::text]))),
    CONSTRAINT valid_sitemap_priority CHECK (((sitemap_priority >= 0.0) AND (sitemap_priority <= 1.0))),
    CONSTRAINT valid_slug_format CHECK ((slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'::text)),
    CONSTRAINT valid_status CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text])))
);


--
-- Name: TABLE pages; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.pages IS 'Pages table - ordered by created_at DESC (newest first)';


--
-- Name: COLUMN pages.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pages.id IS 'Unique identifier for the page';


--
-- Name: COLUMN pages.parent_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pages.parent_id IS 'Reference to parent page (NULL for root pages)';


--
-- Name: COLUMN pages.slug; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pages.slug IS 'URL-friendly slug (lowercase, alphanumeric, hyphens only)';


--
-- Name: COLUMN pages.full_path; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pages.full_path IS 'Materialized path from root (e.g., /category/sub-page)';


--
-- Name: COLUMN pages.depth; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pages.depth IS 'Depth in hierarchy (0 = root, 1 = child, etc.)';


--
-- Name: COLUMN pages.template; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pages.template IS 'Page template slug (validated against page_templates.slug). Defaults to ''default'' if not specified.';


--
-- Name: COLUMN pages.title; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pages.title IS 'Page title (used in navigation and SEO)';


--
-- Name: COLUMN pages.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pages.description IS 'Page description (used for meta description)';


--
-- Name: COLUMN pages.content; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pages.content IS 'Page content in Markdown format';


--
-- Name: COLUMN pages.meta_title; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pages.meta_title IS 'Custom SEO title (falls back to title if NULL)';


--
-- Name: COLUMN pages.meta_keywords; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pages.meta_keywords IS 'SEO keywords array';


--
-- Name: COLUMN pages.og_image; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pages.og_image IS 'Open Graph image URL for social sharing';


--
-- Name: COLUMN pages.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pages.status IS 'Publication status: draft, published, archived';


--
-- Name: COLUMN pages.published_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pages.published_at IS 'Timestamp when page was published';


--
-- Name: COLUMN pages.metadata; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pages.metadata IS 'Template-specific metadata in JSONB format.

Structure:
{
  "seo": {
    "og": {
      "title": "Open Graph title",
      "description": "Open Graph description",
      "type": "article|website",
      "url": "https://example.com/page",
      "site_name": "Site Name",
      "locale": "en_US",
      "image": {
        "url": "https://example.com/image.jpg",
        "width": 1200,
        "height": 630,
        "alt": "Image description"
      }
    },
    "twitter": {
      "card": "summary_large_image|summary",
      "site": "@username",
      "creator": "@username",
      "title": "Twitter card title",
      "description": "Twitter card description",
      "image": "https://example.com/image.jpg"
    },
    "schema": {
      "@context": "https://schema.org",
      "@type": "Article|HowTo|FAQPage|LocalBusiness|...",
      "headline": "Article headline",
      "description": "Article description",
      "author": {...},
      "publisher": {...},
      "datePublished": "2025-11-08",
      "dateModified": "2025-11-08",
      "image": "https://example.com/image.jpg"
    }
  },
  "template": {
    // Template-specific data (layout, columns, etc.)
  }
}';


--
-- Name: COLUMN pages.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pages.created_at IS 'Timestamp when page was created';


--
-- Name: COLUMN pages.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pages.updated_at IS 'Timestamp when page was last updated';


--
-- Name: COLUMN pages.created_by; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pages.created_by IS 'User who created the page';


--
-- Name: COLUMN pages.updated_by; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pages.updated_by IS 'User who last updated the page';


--
-- Name: COLUMN pages.deleted_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pages.deleted_at IS 'Timestamp when page was soft deleted (NULL if active)';


--
-- Name: COLUMN pages.canonical_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pages.canonical_url IS 'Canonical URL for this page (prevents duplicate content penalties)';


--
-- Name: COLUMN pages.meta_robots; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pages.meta_robots IS 'Robots meta directives (e.g., index, follow, noindex, nofollow, noarchive, nosnippet)';


--
-- Name: COLUMN pages.focus_keyword; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pages.focus_keyword IS 'Primary SEO keyword/keyphrase for this page';


--
-- Name: COLUMN pages.sitemap_priority; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pages.sitemap_priority IS 'XML sitemap priority (0.0 to 1.0, where 1.0 is highest priority)';


--
-- Name: COLUMN pages.sitemap_changefreq; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pages.sitemap_changefreq IS 'XML sitemap change frequency (always, hourly, daily, weekly, monthly, yearly, never)';


--
-- Name: COLUMN pages.redirect_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pages.redirect_url IS 'Redirect URL if this page should redirect to another location';


--
-- Name: COLUMN pages.redirect_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pages.redirect_type IS 'HTTP redirect status code (301 = permanent, 302 = temporary, 307 = temporary preserve method, 308 = permanent preserve method)';


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    contractor_id uuid NOT NULL,
    google_review_id text NOT NULL,
    review_url text,
    reviewer_id text,
    reviewer_url text,
    reviewer_name text NOT NULL,
    reviewer_photo_url text,
    reviewer_review_count integer DEFAULT 0,
    is_local_guide boolean DEFAULT false,
    review_text text,
    review_text_translated text,
    stars integer NOT NULL,
    likes_count integer DEFAULT 0,
    published_at timestamp with time zone,
    published_at_relative text,
    review_origin text DEFAULT 'Google'::text,
    original_language text,
    owner_response_text text,
    owner_response_date timestamp with time zone,
    review_context jsonb DEFAULT '{}'::jsonb,
    detailed_rating jsonb DEFAULT '{}'::jsonb,
    review_image_urls text[] DEFAULT '{}'::text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    downloaded_reviewer_photo_url text,
    CONSTRAINT reviews_stars_check CHECK (((stars >= 1) AND (stars <= 5)))
);


--
-- Name: TABLE reviews; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.reviews IS 'Google reviews imported from Apify JSON exports';


--
-- Name: COLUMN reviews.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reviews.id IS 'Unique identifier for the review';


--
-- Name: COLUMN reviews.contractor_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reviews.contractor_id IS 'FK to contractor this review belongs to';


--
-- Name: COLUMN reviews.google_review_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reviews.google_review_id IS 'Google review ID for deduplication';


--
-- Name: COLUMN reviews.review_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reviews.review_url IS 'Direct link to Google review';


--
-- Name: COLUMN reviews.reviewer_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reviews.reviewer_id IS 'Google reviewer account ID';


--
-- Name: COLUMN reviews.reviewer_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reviews.reviewer_url IS 'Link to reviewer Google Maps profile';


--
-- Name: COLUMN reviews.reviewer_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reviews.reviewer_name IS 'Display name of reviewer';


--
-- Name: COLUMN reviews.reviewer_photo_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reviews.reviewer_photo_url IS 'Reviewer profile photo URL';


--
-- Name: COLUMN reviews.reviewer_review_count; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reviews.reviewer_review_count IS 'Number of reviews by this reviewer';


--
-- Name: COLUMN reviews.is_local_guide; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reviews.is_local_guide IS 'Whether reviewer is a Google Local Guide';


--
-- Name: COLUMN reviews.review_text; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reviews.review_text IS 'Review text content';


--
-- Name: COLUMN reviews.review_text_translated; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reviews.review_text_translated IS 'Translated review text if applicable';


--
-- Name: COLUMN reviews.stars; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reviews.stars IS 'Star rating (1-5)';


--
-- Name: COLUMN reviews.likes_count; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reviews.likes_count IS 'Number of helpful votes on review';


--
-- Name: COLUMN reviews.published_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reviews.published_at IS 'When review was originally published';


--
-- Name: COLUMN reviews.published_at_relative; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reviews.published_at_relative IS 'Relative time string (e.g., "a year ago")';


--
-- Name: COLUMN reviews.review_origin; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reviews.review_origin IS 'Source of review (default: Google)';


--
-- Name: COLUMN reviews.original_language; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reviews.original_language IS 'ISO language code of original review';


--
-- Name: COLUMN reviews.owner_response_text; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reviews.owner_response_text IS 'Business owner response text';


--
-- Name: COLUMN reviews.owner_response_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reviews.owner_response_date IS 'When owner responded';


--
-- Name: COLUMN reviews.review_context; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reviews.review_context IS 'JSONB: positive attributes, categories';


--
-- Name: COLUMN reviews.detailed_rating; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reviews.detailed_rating IS 'JSONB: sub-ratings if available';


--
-- Name: COLUMN reviews.review_image_urls; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reviews.review_image_urls IS 'Array of image URLs attached to review';


--
-- Name: COLUMN reviews.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reviews.created_at IS 'When review was imported into system';


--
-- Name: COLUMN reviews.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reviews.updated_at IS 'When review was last updated';


--
-- Name: COLUMN reviews.downloaded_reviewer_photo_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.reviews.downloaded_reviewer_photo_url IS 'Storage path for downloaded reviewer profile photo. NULL = not yet downloaded or failed. Original URL preserved in reviewer_photo_url.';


--
-- Name: service_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    icon text,
    display_order integer DEFAULT 0 NOT NULL,
    is_enabled boolean DEFAULT true NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone,
    CONSTRAINT valid_service_type_slug_format CHECK ((slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'::text))
);


--
-- Name: TABLE service_types; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.service_types IS 'Concrete service categories for contractor classification';


--
-- Name: system_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    log_type text NOT NULL,
    category text NOT NULL,
    action text NOT NULL,
    message text,
    level text DEFAULT 'info'::text NOT NULL,
    entity_type text,
    entity_id uuid,
    actor_type text,
    actor_id uuid,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    archived_at timestamp with time zone,
    CONSTRAINT system_logs_actor_type_check CHECK ((actor_type = ANY (ARRAY['user'::text, 'system'::text, 'job'::text]))),
    CONSTRAINT system_logs_level_check CHECK ((level = ANY (ARRAY['debug'::text, 'info'::text, 'warn'::text, 'error'::text]))),
    CONSTRAINT system_logs_log_type_check CHECK ((log_type = ANY (ARRAY['activity'::text, 'audit'::text, 'error'::text])))
);


--
-- Name: TABLE system_logs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.system_logs IS 'Centralized logging for jobs, user actions, and system events. Supports indefinite retention with archival.';


--
-- Name: COLUMN system_logs.log_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.system_logs.log_type IS 'Type: activity (system events), audit (user actions), error (failures)';


--
-- Name: COLUMN system_logs.category; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.system_logs.category IS 'Category grouping (e.g., job, auth, cms, contractor)';


--
-- Name: COLUMN system_logs.action; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.system_logs.action IS 'Specific action (e.g., job_started, job_completed, page_created)';


--
-- Name: COLUMN system_logs.message; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.system_logs.message IS 'Human-readable log message';


--
-- Name: COLUMN system_logs.level; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.system_logs.level IS 'Log level: debug, info, warn, error';


--
-- Name: COLUMN system_logs.entity_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.system_logs.entity_type IS 'Type of related entity (e.g., background_job, page, contractor)';


--
-- Name: COLUMN system_logs.entity_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.system_logs.entity_id IS 'UUID of the related entity';


--
-- Name: COLUMN system_logs.actor_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.system_logs.actor_type IS 'Who caused this: user, system, or job';


--
-- Name: COLUMN system_logs.actor_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.system_logs.actor_id IS 'ID of actor (user_id for user, job_id for job, null for system)';


--
-- Name: COLUMN system_logs.metadata; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.system_logs.metadata IS 'Additional context data (JSONB)';


--
-- Name: COLUMN system_logs.archived_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.system_logs.archived_at IS 'When log was archived (null = active, for future retention)';


--
-- Name: zip_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.zip_codes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    zip character varying(10) NOT NULL,
    city_name character varying(255) NOT NULL,
    state_code character varying(2) NOT NULL,
    state_name character varying(100) NOT NULL,
    lat numeric(10,7) NOT NULL,
    lng numeric(10,7) NOT NULL,
    coordinates public.geography(Point,4326),
    population integer DEFAULT 0,
    city_id uuid,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE zip_codes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.zip_codes IS 'US ZIP codes with geographic coordinates for location-based search and autocomplete';


--
-- Name: COLUMN zip_codes.city_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.zip_codes.city_id IS 'Optional link to cities table for ZIP codes that match a city in our database';


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


--
-- Name: messages_2025_12_15; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_12_15 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_12_16; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_12_16 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_12_17; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_12_17 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_12_18; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_12_18 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_12_19; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_12_19 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_12_20; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_12_20 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_12_21; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_12_21 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: -
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_analytics (
    name text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: buckets_vectors; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_vectors (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'VECTOR'::storage.buckettype NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: iceberg_namespaces; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.iceberg_namespaces (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_name text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    catalog_id uuid NOT NULL
);


--
-- Name: iceberg_tables; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.iceberg_tables (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    namespace_id uuid NOT NULL,
    bucket_name text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    location text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    remote_table_id text,
    shard_key text,
    shard_id text,
    catalog_id uuid NOT NULL
);


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: objects; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb,
    level integer
);


--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: prefixes; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.prefixes (
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    level integer GENERATED ALWAYS AS (storage.get_level(name)) STORED NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: vector_indexes; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.vector_indexes (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    bucket_id text NOT NULL,
    data_type text NOT NULL,
    dimension integer NOT NULL,
    distance_metric text NOT NULL,
    metadata_configuration jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: hooks; Type: TABLE; Schema: supabase_functions; Owner: -
--

CREATE TABLE supabase_functions.hooks (
    id bigint NOT NULL,
    hook_table_id integer NOT NULL,
    hook_name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    request_id bigint
);


--
-- Name: TABLE hooks; Type: COMMENT; Schema: supabase_functions; Owner: -
--

COMMENT ON TABLE supabase_functions.hooks IS 'Supabase Functions Hooks: Audit trail for triggered hooks.';


--
-- Name: hooks_id_seq; Type: SEQUENCE; Schema: supabase_functions; Owner: -
--

CREATE SEQUENCE supabase_functions.hooks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: hooks_id_seq; Type: SEQUENCE OWNED BY; Schema: supabase_functions; Owner: -
--

ALTER SEQUENCE supabase_functions.hooks_id_seq OWNED BY supabase_functions.hooks.id;


--
-- Name: migrations; Type: TABLE; Schema: supabase_functions; Owner: -
--

CREATE TABLE supabase_functions.migrations (
    version text NOT NULL,
    inserted_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: supabase_migrations; Owner: -
--

CREATE TABLE supabase_migrations.schema_migrations (
    version text NOT NULL,
    statements text[],
    name text
);


--
-- Name: messages_2025_12_15; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_12_15 FOR VALUES FROM ('2025-12-15 00:00:00') TO ('2025-12-16 00:00:00');


--
-- Name: messages_2025_12_16; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_12_16 FOR VALUES FROM ('2025-12-16 00:00:00') TO ('2025-12-17 00:00:00');


--
-- Name: messages_2025_12_17; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_12_17 FOR VALUES FROM ('2025-12-17 00:00:00') TO ('2025-12-18 00:00:00');


--
-- Name: messages_2025_12_18; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_12_18 FOR VALUES FROM ('2025-12-18 00:00:00') TO ('2025-12-19 00:00:00');


--
-- Name: messages_2025_12_19; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_12_19 FOR VALUES FROM ('2025-12-19 00:00:00') TO ('2025-12-20 00:00:00');


--
-- Name: messages_2025_12_20; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_12_20 FOR VALUES FROM ('2025-12-20 00:00:00') TO ('2025-12-21 00:00:00');


--
-- Name: messages_2025_12_21; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_12_21 FOR VALUES FROM ('2025-12-21 00:00:00') TO ('2025-12-22 00:00:00');


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: hooks id; Type: DEFAULT; Schema: supabase_functions; Owner: -
--

ALTER TABLE ONLY supabase_functions.hooks ALTER COLUMN id SET DEFAULT nextval('supabase_functions.hooks_id_seq'::regclass);


--
-- Name: extensions extensions_pkey; Type: CONSTRAINT; Schema: _realtime; Owner: -
--

ALTER TABLE ONLY _realtime.extensions
    ADD CONSTRAINT extensions_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: _realtime; Owner: -
--

ALTER TABLE ONLY _realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: _realtime; Owner: -
--

ALTER TABLE ONLY _realtime.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_client_states oauth_client_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_client_states
    ADD CONSTRAINT oauth_client_states_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: ai_article_evals ai_article_evals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_article_evals
    ADD CONSTRAINT ai_article_evals_pkey PRIMARY KEY (id);


--
-- Name: ai_article_job_steps ai_article_job_steps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_article_job_steps
    ADD CONSTRAINT ai_article_job_steps_pkey PRIMARY KEY (id);


--
-- Name: ai_article_jobs ai_article_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_article_jobs
    ADD CONSTRAINT ai_article_jobs_pkey PRIMARY KEY (id);


--
-- Name: ai_golden_examples ai_golden_examples_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_golden_examples
    ADD CONSTRAINT ai_golden_examples_pkey PRIMARY KEY (id);


--
-- Name: ai_personas ai_personas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_personas
    ADD CONSTRAINT ai_personas_pkey PRIMARY KEY (id);


--
-- Name: ai_prompt_versions ai_prompt_versions_persona_id_version_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_prompt_versions
    ADD CONSTRAINT ai_prompt_versions_persona_id_version_key UNIQUE (persona_id, version);


--
-- Name: ai_prompt_versions ai_prompt_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_prompt_versions
    ADD CONSTRAINT ai_prompt_versions_pkey PRIMARY KEY (id);


--
-- Name: background_jobs background_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.background_jobs
    ADD CONSTRAINT background_jobs_pkey PRIMARY KEY (id);


--
-- Name: business_claims business_claims_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_claims
    ADD CONSTRAINT business_claims_pkey PRIMARY KEY (id);


--
-- Name: cities cities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_pkey PRIMARY KEY (id);


--
-- Name: contractor_service_types contractor_service_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contractor_service_types
    ADD CONSTRAINT contractor_service_types_pkey PRIMARY KEY (id);


--
-- Name: contractor_service_types contractor_service_types_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contractor_service_types
    ADD CONSTRAINT contractor_service_types_unique UNIQUE (contractor_id, service_type_id);


--
-- Name: contractors contractors_google_place_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contractors
    ADD CONSTRAINT contractors_google_place_id_key UNIQUE (google_place_id);


--
-- Name: contractors contractors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contractors
    ADD CONSTRAINT contractors_pkey PRIMARY KEY (id);


--
-- Name: import_jobs import_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.import_jobs
    ADD CONSTRAINT import_jobs_pkey PRIMARY KEY (id);


--
-- Name: menu_items menu_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_pkey PRIMARY KEY (id);


--
-- Name: menus menus_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_pkey PRIMARY KEY (id);


--
-- Name: page_templates page_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_templates
    ADD CONSTRAINT page_templates_pkey PRIMARY KEY (id);


--
-- Name: page_templates page_templates_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_templates
    ADD CONSTRAINT page_templates_slug_key UNIQUE (slug);


--
-- Name: pages pages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: service_types service_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_types
    ADD CONSTRAINT service_types_pkey PRIMARY KEY (id);


--
-- Name: service_types service_types_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_types
    ADD CONSTRAINT service_types_slug_key UNIQUE (slug);


--
-- Name: system_logs system_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_logs
    ADD CONSTRAINT system_logs_pkey PRIMARY KEY (id);


--
-- Name: cities unique_city_slug_per_state; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT unique_city_slug_per_state UNIQUE (slug, state_code);


--
-- Name: contractors unique_contractor_slug_per_city; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contractors
    ADD CONSTRAINT unique_contractor_slug_per_city UNIQUE (city_id, slug);


--
-- Name: pages unique_full_path; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT unique_full_path UNIQUE (full_path);


--
-- Name: reviews unique_google_review; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT unique_google_review UNIQUE (contractor_id, google_review_id);


--
-- Name: menu_items unique_order_per_parent; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT unique_order_per_parent UNIQUE (menu_id, parent_id, display_order);


--
-- Name: pages unique_slug_per_parent; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT unique_slug_per_parent UNIQUE (parent_id, slug);


--
-- Name: account_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);


--
-- Name: zip_codes zip_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zip_codes
    ADD CONSTRAINT zip_codes_pkey PRIMARY KEY (id);


--
-- Name: zip_codes zip_codes_zip_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zip_codes
    ADD CONSTRAINT zip_codes_zip_unique UNIQUE (zip);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_12_15 messages_2025_12_15_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_12_15
    ADD CONSTRAINT messages_2025_12_15_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_12_16 messages_2025_12_16_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_12_16
    ADD CONSTRAINT messages_2025_12_16_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_12_17 messages_2025_12_17_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_12_17
    ADD CONSTRAINT messages_2025_12_17_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_12_18 messages_2025_12_18_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_12_18
    ADD CONSTRAINT messages_2025_12_18_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_12_19 messages_2025_12_19_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_12_19
    ADD CONSTRAINT messages_2025_12_19_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_12_20 messages_2025_12_20_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_12_20
    ADD CONSTRAINT messages_2025_12_20_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_12_21 messages_2025_12_21_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_12_21
    ADD CONSTRAINT messages_2025_12_21_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: buckets_vectors buckets_vectors_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_vectors
    ADD CONSTRAINT buckets_vectors_pkey PRIMARY KEY (id);


--
-- Name: iceberg_namespaces iceberg_namespaces_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.iceberg_namespaces
    ADD CONSTRAINT iceberg_namespaces_pkey PRIMARY KEY (id);


--
-- Name: iceberg_tables iceberg_tables_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.iceberg_tables
    ADD CONSTRAINT iceberg_tables_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: prefixes prefixes_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT prefixes_pkey PRIMARY KEY (bucket_id, level, name);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: vector_indexes vector_indexes_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_pkey PRIMARY KEY (id);


--
-- Name: hooks hooks_pkey; Type: CONSTRAINT; Schema: supabase_functions; Owner: -
--

ALTER TABLE ONLY supabase_functions.hooks
    ADD CONSTRAINT hooks_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: supabase_functions; Owner: -
--

ALTER TABLE ONLY supabase_functions.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (version);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: extensions_tenant_external_id_index; Type: INDEX; Schema: _realtime; Owner: -
--

CREATE INDEX extensions_tenant_external_id_index ON _realtime.extensions USING btree (tenant_external_id);


--
-- Name: extensions_tenant_external_id_type_index; Type: INDEX; Schema: _realtime; Owner: -
--

CREATE UNIQUE INDEX extensions_tenant_external_id_type_index ON _realtime.extensions USING btree (tenant_external_id, type);


--
-- Name: tenants_external_id_index; Type: INDEX; Schema: _realtime; Owner: -
--

CREATE UNIQUE INDEX tenants_external_id_index ON _realtime.tenants USING btree (external_id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_oauth_client_states_created_at; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_oauth_client_states_created_at ON auth.oauth_client_states USING btree (created_at);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: idx_ai_article_evals_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_article_evals_created_at ON public.ai_article_evals USING btree (created_at);


--
-- Name: idx_ai_article_evals_eval_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_article_evals_eval_type ON public.ai_article_evals USING btree (eval_type);


--
-- Name: idx_ai_article_evals_job_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_article_evals_job_id ON public.ai_article_evals USING btree (job_id);


--
-- Name: idx_ai_article_evals_overall_score; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_article_evals_overall_score ON public.ai_article_evals USING btree (overall_score);


--
-- Name: idx_ai_article_jobs_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_article_jobs_created_by ON public.ai_article_jobs USING btree (created_by);


--
-- Name: idx_ai_article_jobs_keyword; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_article_jobs_keyword ON public.ai_article_jobs USING btree (keyword);


--
-- Name: idx_ai_article_jobs_priority_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_article_jobs_priority_created ON public.ai_article_jobs USING btree (priority DESC, created_at) WHERE (status = 'pending'::text);


--
-- Name: idx_ai_article_jobs_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_article_jobs_status ON public.ai_article_jobs USING btree (status) WHERE (status = ANY (ARRAY['pending'::text, 'processing'::text]));


--
-- Name: idx_ai_golden_examples_agent_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_golden_examples_agent_type ON public.ai_golden_examples USING btree (agent_type) WHERE ((deleted_at IS NULL) AND (is_active = true));


--
-- Name: idx_ai_golden_examples_quality; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_golden_examples_quality ON public.ai_golden_examples USING btree (quality_score DESC) WHERE ((deleted_at IS NULL) AND (is_active = true));


--
-- Name: idx_ai_golden_examples_tags; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_golden_examples_tags ON public.ai_golden_examples USING gin (tags) WHERE (deleted_at IS NULL);


--
-- Name: idx_ai_job_steps_agent_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_job_steps_agent_type ON public.ai_article_job_steps USING btree (job_id, agent_type);


--
-- Name: idx_ai_job_steps_job_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_job_steps_job_id ON public.ai_article_job_steps USING btree (job_id);


--
-- Name: idx_ai_job_steps_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_job_steps_status ON public.ai_article_job_steps USING btree (status) WHERE (status = ANY (ARRAY['pending'::text, 'running'::text]));


--
-- Name: idx_ai_personas_agent_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_personas_agent_type ON public.ai_personas USING btree (agent_type) WHERE (deleted_at IS NULL);


--
-- Name: idx_ai_personas_is_default; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_personas_is_default ON public.ai_personas USING btree (agent_type, is_default) WHERE ((deleted_at IS NULL) AND (is_default = true));


--
-- Name: idx_ai_prompt_versions_persona; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_prompt_versions_persona ON public.ai_prompt_versions USING btree (persona_id);


--
-- Name: idx_ai_prompt_versions_primary; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_prompt_versions_primary ON public.ai_prompt_versions USING btree (persona_id, is_primary) WHERE (is_primary = true);


--
-- Name: idx_ai_prompt_versions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_prompt_versions_status ON public.ai_prompt_versions USING btree (status) WHERE (status = 'active'::text);


--
-- Name: idx_background_jobs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_background_jobs_created_at ON public.background_jobs USING btree (created_at DESC);


--
-- Name: idx_background_jobs_pending; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_background_jobs_pending ON public.background_jobs USING btree (job_type, created_at) WHERE (status = 'pending'::text);


--
-- Name: idx_background_jobs_processing; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_background_jobs_processing ON public.background_jobs USING btree (started_at) WHERE (status = 'processing'::text);


--
-- Name: idx_background_jobs_scheduled_for; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_background_jobs_scheduled_for ON public.background_jobs USING btree (scheduled_for) WHERE (status = 'pending'::text);


--
-- Name: idx_background_jobs_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_background_jobs_status ON public.background_jobs USING btree (status, created_at DESC);


--
-- Name: idx_business_claims_claimant_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_business_claims_claimant_email ON public.business_claims USING btree (claimant_email);


--
-- Name: idx_business_claims_contractor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_business_claims_contractor_id ON public.business_claims USING btree (contractor_id);


--
-- Name: idx_business_claims_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_business_claims_status ON public.business_claims USING btree (status);


--
-- Name: idx_cities_coordinates; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cities_coordinates ON public.cities USING gist (coordinates);


--
-- Name: idx_cities_metadata; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cities_metadata ON public.cities USING gin (metadata);


--
-- Name: idx_cities_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cities_name ON public.cities USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: idx_cities_slug_state; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cities_slug_state ON public.cities USING btree (slug, state_code) WHERE (deleted_at IS NULL);


--
-- Name: idx_contractor_service_types_contractor; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contractor_service_types_contractor ON public.contractor_service_types USING btree (contractor_id);


--
-- Name: idx_contractor_service_types_service; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contractor_service_types_service ON public.contractor_service_types USING btree (service_type_id);


--
-- Name: idx_contractors_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contractors_active ON public.contractors USING btree (city_id, company_name) WHERE ((deleted_at IS NULL) AND (status = 'active'::text));


--
-- Name: idx_contractors_city_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contractors_city_id ON public.contractors USING btree (city_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_contractors_city_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contractors_city_slug ON public.contractors USING btree (city_id, slug) WHERE (deleted_at IS NULL);


--
-- Name: idx_contractors_coordinates; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contractors_coordinates ON public.contractors USING gist (coordinates);


--
-- Name: idx_contractors_google_place_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_contractors_google_place_id ON public.contractors USING btree (google_place_id) WHERE ((google_place_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: idx_contractors_is_claimed; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contractors_is_claimed ON public.contractors USING btree (is_claimed);


--
-- Name: idx_contractors_metadata; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contractors_metadata ON public.contractors USING gin (metadata);


--
-- Name: idx_contractors_pending_images; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contractors_pending_images ON public.contractors USING btree (images_processed) WHERE ((deleted_at IS NULL) AND (images_processed = false));


--
-- Name: idx_contractors_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contractors_status ON public.contractors USING btree (status) WHERE (deleted_at IS NULL);


--
-- Name: idx_import_jobs_completed_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_import_jobs_completed_at ON public.import_jobs USING btree (completed_at) WHERE (status = 'completed'::text);


--
-- Name: idx_import_jobs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_import_jobs_created_at ON public.import_jobs USING btree (created_at DESC);


--
-- Name: idx_import_jobs_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_import_jobs_status ON public.import_jobs USING btree (status) WHERE (status = ANY (ARRAY['pending'::text, 'processing'::text]));


--
-- Name: idx_menu_items_link_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_menu_items_link_type ON public.menu_items USING btree (link_type) WHERE (deleted_at IS NULL);


--
-- Name: idx_menu_items_menu_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_menu_items_menu_id ON public.menu_items USING btree (menu_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_menu_items_metadata; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_menu_items_metadata ON public.menu_items USING gin (metadata);


--
-- Name: idx_menu_items_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_menu_items_order ON public.menu_items USING btree (menu_id, parent_id, display_order) WHERE (deleted_at IS NULL);


--
-- Name: idx_menu_items_page_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_menu_items_page_id ON public.menu_items USING btree (page_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_menu_items_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_menu_items_parent_id ON public.menu_items USING btree (parent_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_menus_footer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_menus_footer ON public.menus USING btree (show_in_footer, display_order) WHERE ((deleted_at IS NULL) AND (is_enabled = true));


--
-- Name: idx_menus_header; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_menus_header ON public.menus USING btree (show_in_header, display_order) WHERE ((deleted_at IS NULL) AND (is_enabled = true));


--
-- Name: idx_menus_metadata; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_menus_metadata ON public.menus USING gin (metadata);


--
-- Name: idx_menus_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_menus_slug ON public.menus USING btree (slug) WHERE (deleted_at IS NULL);


--
-- Name: idx_one_active_job_per_type; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_one_active_job_per_type ON public.background_jobs USING btree (job_type) WHERE (status = ANY (ARRAY['pending'::text, 'processing'::text]));


--
-- Name: INDEX idx_one_active_job_per_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_one_active_job_per_type IS 'Enforces that only one job of each type can be pending or processing at a time. Prevents race conditions in job creation.';


--
-- Name: idx_page_templates_display_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_page_templates_display_order ON public.page_templates USING btree (display_order) WHERE (deleted_at IS NULL);


--
-- Name: idx_page_templates_enabled; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_page_templates_enabled ON public.page_templates USING btree (is_enabled) WHERE (deleted_at IS NULL);


--
-- Name: idx_page_templates_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_page_templates_slug ON public.page_templates USING btree (slug) WHERE (deleted_at IS NULL);


--
-- Name: idx_pages_canonical_url; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pages_canonical_url ON public.pages USING btree (canonical_url) WHERE ((canonical_url IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: idx_pages_depth; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pages_depth ON public.pages USING btree (depth) WHERE (deleted_at IS NULL);


--
-- Name: idx_pages_focus_keyword; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pages_focus_keyword ON public.pages USING btree (focus_keyword) WHERE ((focus_keyword IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: idx_pages_full_path; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pages_full_path ON public.pages USING btree (full_path) WHERE (deleted_at IS NULL);


--
-- Name: idx_pages_metadata; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pages_metadata ON public.pages USING gin (metadata);


--
-- Name: idx_pages_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pages_parent_id ON public.pages USING btree (parent_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_pages_redirect_url; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pages_redirect_url ON public.pages USING btree (redirect_url) WHERE ((redirect_url IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: idx_pages_sitemap; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pages_sitemap ON public.pages USING btree (sitemap_priority DESC, sitemap_changefreq) WHERE ((status = 'published'::text) AND (deleted_at IS NULL));


--
-- Name: idx_pages_slug_parent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pages_slug_parent ON public.pages USING btree (slug, parent_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_pages_status_published; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pages_status_published ON public.pages USING btree (status, published_at) WHERE ((deleted_at IS NULL) AND (status = 'published'::text));


--
-- Name: idx_pages_template; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pages_template ON public.pages USING btree (template) WHERE (deleted_at IS NULL);


--
-- Name: idx_reviews_contractor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_contractor_id ON public.reviews USING btree (contractor_id);


--
-- Name: idx_reviews_contractor_published; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_contractor_published ON public.reviews USING btree (contractor_id, published_at DESC NULLS LAST);


--
-- Name: idx_reviews_published_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_published_at ON public.reviews USING btree (published_at DESC NULLS LAST);


--
-- Name: idx_reviews_stars; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_stars ON public.reviews USING btree (stars);


--
-- Name: idx_service_types_enabled; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_service_types_enabled ON public.service_types USING btree (display_order) WHERE ((deleted_at IS NULL) AND (is_enabled = true));


--
-- Name: idx_service_types_metadata; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_service_types_metadata ON public.service_types USING gin (metadata);


--
-- Name: idx_service_types_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_service_types_slug ON public.service_types USING btree (slug) WHERE (deleted_at IS NULL);


--
-- Name: idx_system_logs_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_system_logs_active ON public.system_logs USING btree (created_at DESC) WHERE (archived_at IS NULL);


--
-- Name: idx_system_logs_category_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_system_logs_category_action ON public.system_logs USING btree (category, action, created_at DESC);


--
-- Name: idx_system_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_system_logs_created_at ON public.system_logs USING btree (created_at DESC);


--
-- Name: idx_system_logs_entity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_system_logs_entity ON public.system_logs USING btree (entity_type, entity_id, created_at DESC) WHERE (entity_id IS NOT NULL);


--
-- Name: idx_system_logs_errors; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_system_logs_errors ON public.system_logs USING btree (created_at DESC) WHERE (level = 'error'::text);


--
-- Name: idx_zip_codes_city_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_zip_codes_city_id ON public.zip_codes USING btree (city_id);


--
-- Name: idx_zip_codes_city_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_zip_codes_city_name ON public.zip_codes USING btree (city_name);


--
-- Name: idx_zip_codes_city_name_trgm; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_zip_codes_city_name_trgm ON public.zip_codes USING gin (city_name public.gin_trgm_ops);


--
-- Name: idx_zip_codes_coordinates; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_zip_codes_coordinates ON public.zip_codes USING gist (coordinates);


--
-- Name: idx_zip_codes_state_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_zip_codes_state_code ON public.zip_codes USING btree (state_code);


--
-- Name: idx_zip_codes_zip; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_zip_codes_zip ON public.zip_codes USING btree (zip);


--
-- Name: menus_slug_unique_when_not_deleted; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX menus_slug_unique_when_not_deleted ON public.menus USING btree (slug) WHERE (deleted_at IS NULL);


--
-- Name: INDEX menus_slug_unique_when_not_deleted; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.menus_slug_unique_when_not_deleted IS 'Ensures slug uniqueness only for active (non-deleted) menus, allowing slug reuse after soft delete';


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2025_12_15_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2025_12_15_inserted_at_topic_idx ON realtime.messages_2025_12_15 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2025_12_16_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2025_12_16_inserted_at_topic_idx ON realtime.messages_2025_12_16 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2025_12_17_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2025_12_17_inserted_at_topic_idx ON realtime.messages_2025_12_17 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2025_12_18_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2025_12_18_inserted_at_topic_idx ON realtime.messages_2025_12_18 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2025_12_19_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2025_12_19_inserted_at_topic_idx ON realtime.messages_2025_12_19 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2025_12_20_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2025_12_20_inserted_at_topic_idx ON realtime.messages_2025_12_20 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2025_12_21_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2025_12_21_inserted_at_topic_idx ON realtime.messages_2025_12_21 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: -
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: buckets_analytics_unique_name_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: idx_iceberg_namespaces_bucket_id; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX idx_iceberg_namespaces_bucket_id ON storage.iceberg_namespaces USING btree (catalog_id, name);


--
-- Name: idx_iceberg_tables_location; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX idx_iceberg_tables_location ON storage.iceberg_tables USING btree (location);


--
-- Name: idx_iceberg_tables_namespace_id; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX idx_iceberg_tables_namespace_id ON storage.iceberg_tables USING btree (catalog_id, namespace_id, name);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_name_bucket_level_unique; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX idx_name_bucket_level_unique ON storage.objects USING btree (name COLLATE "C", bucket_id, level);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_lower_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_lower_name ON storage.objects USING btree ((path_tokens[level]), lower(name) text_pattern_ops, bucket_id, level);


--
-- Name: idx_prefixes_lower_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_prefixes_lower_name ON storage.prefixes USING btree (bucket_id, level, ((string_to_array(name, '/'::text))[level]), lower(name) text_pattern_ops);


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: objects_bucket_id_level_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX objects_bucket_id_level_idx ON storage.objects USING btree (bucket_id, level, name COLLATE "C");


--
-- Name: vector_indexes_name_bucket_id_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id);


--
-- Name: supabase_functions_hooks_h_table_id_h_name_idx; Type: INDEX; Schema: supabase_functions; Owner: -
--

CREATE INDEX supabase_functions_hooks_h_table_id_h_name_idx ON supabase_functions.hooks USING btree (hook_table_id, hook_name);


--
-- Name: supabase_functions_hooks_request_id_idx; Type: INDEX; Schema: supabase_functions; Owner: -
--

CREATE INDEX supabase_functions_hooks_request_id_idx ON supabase_functions.hooks USING btree (request_id);


--
-- Name: messages_2025_12_15_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_12_15_inserted_at_topic_idx;


--
-- Name: messages_2025_12_15_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_12_15_pkey;


--
-- Name: messages_2025_12_16_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_12_16_inserted_at_topic_idx;


--
-- Name: messages_2025_12_16_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_12_16_pkey;


--
-- Name: messages_2025_12_17_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_12_17_inserted_at_topic_idx;


--
-- Name: messages_2025_12_17_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_12_17_pkey;


--
-- Name: messages_2025_12_18_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_12_18_inserted_at_topic_idx;


--
-- Name: messages_2025_12_18_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_12_18_pkey;


--
-- Name: messages_2025_12_19_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_12_19_inserted_at_topic_idx;


--
-- Name: messages_2025_12_19_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_12_19_pkey;


--
-- Name: messages_2025_12_20_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_12_20_inserted_at_topic_idx;


--
-- Name: messages_2025_12_20_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_12_20_pkey;


--
-- Name: messages_2025_12_21_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_12_21_inserted_at_topic_idx;


--
-- Name: messages_2025_12_21_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_12_21_pkey;


--
-- Name: page_templates page_templates_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER page_templates_updated_at BEFORE UPDATE ON public.page_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: pages pages_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER pages_updated_at BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: TRIGGER pages_updated_at ON pages; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TRIGGER pages_updated_at ON public.pages IS 'Automatically updates updated_at timestamp before each update';


--
-- Name: ai_article_evals set_ai_article_evals_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_ai_article_evals_updated_at BEFORE UPDATE ON public.ai_article_evals FOR EACH ROW EXECUTE FUNCTION public.update_ai_article_evals_updated_at();


--
-- Name: ai_article_job_steps set_ai_article_job_steps_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_ai_article_job_steps_updated_at BEFORE UPDATE ON public.ai_article_job_steps FOR EACH ROW EXECUTE FUNCTION public.update_ai_article_job_steps_updated_at();


--
-- Name: ai_article_jobs set_ai_article_jobs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_ai_article_jobs_updated_at BEFORE UPDATE ON public.ai_article_jobs FOR EACH ROW EXECUTE FUNCTION public.update_ai_article_jobs_updated_at();


--
-- Name: ai_golden_examples set_ai_golden_examples_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_ai_golden_examples_updated_at BEFORE UPDATE ON public.ai_golden_examples FOR EACH ROW EXECUTE FUNCTION public.update_ai_golden_examples_updated_at();


--
-- Name: ai_personas set_ai_personas_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_ai_personas_updated_at BEFORE UPDATE ON public.ai_personas FOR EACH ROW EXECUTE FUNCTION public.update_ai_personas_updated_at();


--
-- Name: ai_prompt_versions set_ai_prompt_versions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_ai_prompt_versions_updated_at BEFORE UPDATE ON public.ai_prompt_versions FOR EACH ROW EXECUTE FUNCTION public.update_ai_prompt_versions_updated_at();


--
-- Name: background_jobs trigger_background_jobs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_background_jobs_updated_at BEFORE UPDATE ON public.background_jobs FOR EACH ROW EXECUTE FUNCTION public.update_background_jobs_updated_at();


--
-- Name: cities trigger_cities_update_coordinates; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_cities_update_coordinates BEFORE INSERT OR UPDATE OF lat, lng ON public.cities FOR EACH ROW EXECUTE FUNCTION public.update_coordinates_from_latlng();


--
-- Name: cities trigger_cities_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_cities_updated_at BEFORE UPDATE ON public.cities FOR EACH ROW EXECUTE FUNCTION public.update_cities_updated_at();


--
-- Name: contractors trigger_contractors_update_coordinates; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_contractors_update_coordinates BEFORE INSERT OR UPDATE OF lat, lng ON public.contractors FOR EACH ROW EXECUTE FUNCTION public.update_coordinates_from_latlng();


--
-- Name: contractors trigger_contractors_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_contractors_updated_at BEFORE UPDATE ON public.contractors FOR EACH ROW EXECUTE FUNCTION public.update_contractors_updated_at();


--
-- Name: import_jobs trigger_import_jobs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_import_jobs_updated_at BEFORE UPDATE ON public.import_jobs FOR EACH ROW EXECUTE FUNCTION public.update_import_jobs_updated_at();


--
-- Name: menu_items trigger_menu_items_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.update_menu_items_updated_at();


--
-- Name: menus trigger_menus_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_menus_updated_at BEFORE UPDATE ON public.menus FOR EACH ROW EXECUTE FUNCTION public.update_menus_updated_at();


--
-- Name: reviews trigger_reviews_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_reviews_updated_at();


--
-- Name: service_types trigger_service_types_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_service_types_updated_at BEFORE UPDATE ON public.service_types FOR EACH ROW EXECUTE FUNCTION public.update_service_types_updated_at();


--
-- Name: business_claims update_business_claims_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_business_claims_updated_at BEFORE UPDATE ON public.business_claims FOR EACH ROW EXECUTE FUNCTION public.update_contractors_updated_at();


--
-- Name: account_profiles user_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER user_profiles_updated_at BEFORE UPDATE ON public.account_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: -
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: objects objects_delete_delete_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects objects_insert_create_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();


--
-- Name: objects objects_update_create_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();


--
-- Name: prefixes prefixes_create_hierarchy; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();


--
-- Name: prefixes prefixes_delete_hierarchy; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: extensions extensions_tenant_external_id_fkey; Type: FK CONSTRAINT; Schema: _realtime; Owner: -
--

ALTER TABLE ONLY _realtime.extensions
    ADD CONSTRAINT extensions_tenant_external_id_fkey FOREIGN KEY (tenant_external_id) REFERENCES _realtime.tenants(external_id) ON DELETE CASCADE;


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: ai_article_evals ai_article_evals_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_article_evals
    ADD CONSTRAINT ai_article_evals_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.ai_article_jobs(id) ON DELETE CASCADE;


--
-- Name: ai_article_evals ai_article_evals_rated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_article_evals
    ADD CONSTRAINT ai_article_evals_rated_by_fkey FOREIGN KEY (rated_by) REFERENCES auth.users(id);


--
-- Name: ai_article_evals ai_article_evals_step_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_article_evals
    ADD CONSTRAINT ai_article_evals_step_id_fkey FOREIGN KEY (step_id) REFERENCES public.ai_article_job_steps(id) ON DELETE SET NULL;


--
-- Name: ai_article_job_steps ai_article_job_steps_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_article_job_steps
    ADD CONSTRAINT ai_article_job_steps_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.ai_article_jobs(id) ON DELETE CASCADE;


--
-- Name: ai_article_job_steps ai_article_job_steps_persona_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_article_job_steps
    ADD CONSTRAINT ai_article_job_steps_persona_id_fkey FOREIGN KEY (persona_id) REFERENCES public.ai_personas(id);


--
-- Name: ai_article_jobs ai_article_jobs_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_article_jobs
    ADD CONSTRAINT ai_article_jobs_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: ai_article_jobs ai_article_jobs_page_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_article_jobs
    ADD CONSTRAINT ai_article_jobs_page_id_fkey FOREIGN KEY (page_id) REFERENCES public.pages(id);


--
-- Name: ai_golden_examples ai_golden_examples_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_golden_examples
    ADD CONSTRAINT ai_golden_examples_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: ai_golden_examples ai_golden_examples_source_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_golden_examples
    ADD CONSTRAINT ai_golden_examples_source_job_id_fkey FOREIGN KEY (source_job_id) REFERENCES public.ai_article_jobs(id) ON DELETE SET NULL;


--
-- Name: ai_golden_examples ai_golden_examples_source_step_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_golden_examples
    ADD CONSTRAINT ai_golden_examples_source_step_id_fkey FOREIGN KEY (source_step_id) REFERENCES public.ai_article_job_steps(id) ON DELETE SET NULL;


--
-- Name: ai_personas ai_personas_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_personas
    ADD CONSTRAINT ai_personas_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: ai_personas ai_personas_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_personas
    ADD CONSTRAINT ai_personas_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id);


--
-- Name: ai_prompt_versions ai_prompt_versions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_prompt_versions
    ADD CONSTRAINT ai_prompt_versions_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: ai_prompt_versions ai_prompt_versions_persona_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_prompt_versions
    ADD CONSTRAINT ai_prompt_versions_persona_id_fkey FOREIGN KEY (persona_id) REFERENCES public.ai_personas(id) ON DELETE CASCADE;


--
-- Name: background_jobs background_jobs_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.background_jobs
    ADD CONSTRAINT background_jobs_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: business_claims business_claims_claimant_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_claims
    ADD CONSTRAINT business_claims_claimant_user_id_fkey FOREIGN KEY (claimant_user_id) REFERENCES auth.users(id);


--
-- Name: business_claims business_claims_contractor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_claims
    ADD CONSTRAINT business_claims_contractor_id_fkey FOREIGN KEY (contractor_id) REFERENCES public.contractors(id) ON DELETE CASCADE;


--
-- Name: business_claims business_claims_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_claims
    ADD CONSTRAINT business_claims_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id);


--
-- Name: contractor_service_types contractor_service_types_contractor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contractor_service_types
    ADD CONSTRAINT contractor_service_types_contractor_id_fkey FOREIGN KEY (contractor_id) REFERENCES public.contractors(id) ON DELETE CASCADE;


--
-- Name: contractor_service_types contractor_service_types_service_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contractor_service_types
    ADD CONSTRAINT contractor_service_types_service_type_id_fkey FOREIGN KEY (service_type_id) REFERENCES public.service_types(id) ON DELETE CASCADE;


--
-- Name: contractors contractors_city_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contractors
    ADD CONSTRAINT contractors_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id) ON DELETE SET NULL;


--
-- Name: contractors contractors_claimed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contractors
    ADD CONSTRAINT contractors_claimed_by_fkey FOREIGN KEY (claimed_by) REFERENCES auth.users(id);


--
-- Name: menu_items menu_items_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: menu_items menu_items_menu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_menu_id_fkey FOREIGN KEY (menu_id) REFERENCES public.menus(id) ON DELETE CASCADE;


--
-- Name: menu_items menu_items_page_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_page_id_fkey FOREIGN KEY (page_id) REFERENCES public.pages(id) ON DELETE SET NULL;


--
-- Name: menu_items menu_items_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.menu_items(id) ON DELETE CASCADE;


--
-- Name: menu_items menu_items_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id);


--
-- Name: menus menus_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: menus menus_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id);


--
-- Name: page_templates page_templates_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_templates
    ADD CONSTRAINT page_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: page_templates page_templates_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_templates
    ADD CONSTRAINT page_templates_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id);


--
-- Name: pages pages_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: pages pages_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: pages pages_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id);


--
-- Name: reviews reviews_contractor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_contractor_id_fkey FOREIGN KEY (contractor_id) REFERENCES public.contractors(id) ON DELETE CASCADE;


--
-- Name: account_profiles user_profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_profiles
    ADD CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: zip_codes zip_codes_city_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zip_codes
    ADD CONSTRAINT zip_codes_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id) ON DELETE SET NULL;


--
-- Name: iceberg_namespaces iceberg_namespaces_catalog_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.iceberg_namespaces
    ADD CONSTRAINT iceberg_namespaces_catalog_id_fkey FOREIGN KEY (catalog_id) REFERENCES storage.buckets_analytics(id) ON DELETE CASCADE;


--
-- Name: iceberg_tables iceberg_tables_catalog_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.iceberg_tables
    ADD CONSTRAINT iceberg_tables_catalog_id_fkey FOREIGN KEY (catalog_id) REFERENCES storage.buckets_analytics(id) ON DELETE CASCADE;


--
-- Name: iceberg_tables iceberg_tables_namespace_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.iceberg_tables
    ADD CONSTRAINT iceberg_tables_namespace_id_fkey FOREIGN KEY (namespace_id) REFERENCES storage.iceberg_namespaces(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: prefixes prefixes_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT "prefixes_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: vector_indexes vector_indexes_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_article_evals Admin full access to ai_article_evals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin full access to ai_article_evals" ON public.ai_article_evals TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.is_admin = true))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.is_admin = true)))));


--
-- Name: ai_article_job_steps Admin full access to ai_article_job_steps; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin full access to ai_article_job_steps" ON public.ai_article_job_steps TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.is_admin = true))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.is_admin = true)))));


--
-- Name: ai_article_jobs Admin full access to ai_article_jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin full access to ai_article_jobs" ON public.ai_article_jobs TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.is_admin = true))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.is_admin = true)))));


--
-- Name: ai_golden_examples Admin full access to ai_golden_examples; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin full access to ai_golden_examples" ON public.ai_golden_examples TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.is_admin = true))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.is_admin = true)))));


--
-- Name: ai_personas Admin full access to ai_personas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin full access to ai_personas" ON public.ai_personas TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.is_admin = true))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.is_admin = true)))));


--
-- Name: ai_prompt_versions Admin full access to ai_prompt_versions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin full access to ai_prompt_versions" ON public.ai_prompt_versions TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.is_admin = true))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.is_admin = true)))));


--
-- Name: background_jobs Admin users can create background jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin users can create background jobs" ON public.background_jobs FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.account_type = 'admin'::text)))));


--
-- Name: import_jobs Admin users can create import jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin users can create import jobs" ON public.import_jobs FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.account_type = 'admin'::text)))));


--
-- Name: system_logs Admin users can create system logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin users can create system logs" ON public.system_logs FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.account_type = 'admin'::text)))));


--
-- Name: background_jobs Admin users can delete background jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin users can delete background jobs" ON public.background_jobs FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.account_type = 'admin'::text)))));


--
-- Name: import_jobs Admin users can delete import jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin users can delete import jobs" ON public.import_jobs FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.account_type = 'admin'::text)))));


--
-- Name: background_jobs Admin users can read background jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin users can read background jobs" ON public.background_jobs FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.account_type = 'admin'::text)))));


--
-- Name: import_jobs Admin users can read import jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin users can read import jobs" ON public.import_jobs FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.account_type = 'admin'::text)))));


--
-- Name: system_logs Admin users can read system logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin users can read system logs" ON public.system_logs FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.account_type = 'admin'::text)))));


--
-- Name: background_jobs Admin users can update background jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin users can update background jobs" ON public.background_jobs FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.account_type = 'admin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.account_type = 'admin'::text)))));


--
-- Name: import_jobs Admin users can update import jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin users can update import jobs" ON public.import_jobs FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.account_type = 'admin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.account_type = 'admin'::text)))));


--
-- Name: pages Admins can create pages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can create pages" ON public.pages FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.is_admin = true)))));


--
-- Name: pages Admins can delete pages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete pages" ON public.pages FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.is_admin = true)))));


--
-- Name: business_claims Admins can manage all claims; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all claims" ON public.business_claims TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.account_type = 'admin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.account_type = 'admin'::text)))));


--
-- Name: pages Admins can read all pages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can read all pages" ON public.pages FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.is_admin = true)))));


--
-- Name: pages Admins can update pages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update pages" ON public.pages FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.is_admin = true))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.is_admin = true)))));


--
-- Name: cities Admins have full access to cities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins have full access to cities" ON public.cities USING ((EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.is_admin = true)))));


--
-- Name: contractors Admins have full access to contractors; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins have full access to contractors" ON public.contractors USING ((EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.is_admin = true)))));


--
-- Name: menu_items Admins have full access to menu items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins have full access to menu items" ON public.menu_items USING ((EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.is_admin = true)))));


--
-- Name: menus Admins have full access to menus; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins have full access to menus" ON public.menus USING ((EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.is_admin = true)))));


--
-- Name: reviews Admins have full access to reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins have full access to reviews" ON public.reviews USING ((EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.is_admin = true)))));


--
-- Name: service_types Admins have full access to service types; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins have full access to service types" ON public.service_types USING ((EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.is_admin = true)))));


--
-- Name: page_templates Admins have full access to templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins have full access to templates" ON public.page_templates USING ((EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.is_admin = true)))));


--
-- Name: business_claims Anyone can submit a claim; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can submit a claim" ON public.business_claims FOR INSERT TO authenticated, anon WITH CHECK (true);


--
-- Name: contractors Owners can update their claimed contractors; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners can update their claimed contractors" ON public.contractors FOR UPDATE USING (((claimed_by = auth.uid()) AND (is_claimed = true))) WITH CHECK (((claimed_by = auth.uid()) AND (is_claimed = true)));


--
-- Name: contractors Owners can view their claimed contractors; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners can view their claimed contractors" ON public.contractors FOR SELECT USING (((claimed_by = auth.uid()) AND (is_claimed = true)));


--
-- Name: contractors Public can view active contractors; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view active contractors" ON public.contractors FOR SELECT USING (((deleted_at IS NULL) AND (status = 'active'::text)));


--
-- Name: cities Public can view cities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view cities" ON public.cities FOR SELECT USING ((deleted_at IS NULL));


--
-- Name: menu_items Public can view enabled menu items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view enabled menu items" ON public.menu_items FOR SELECT USING (((deleted_at IS NULL) AND (is_enabled = true) AND (EXISTS ( SELECT 1
   FROM public.menus
  WHERE ((menus.id = menu_items.menu_id) AND (menus.deleted_at IS NULL) AND (menus.is_enabled = true))))));


--
-- Name: menus Public can view enabled menus; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view enabled menus" ON public.menus FOR SELECT USING (((deleted_at IS NULL) AND (is_enabled = true)));


--
-- Name: service_types Public can view enabled service types; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view enabled service types" ON public.service_types FOR SELECT USING (((deleted_at IS NULL) AND (is_enabled = true)));


--
-- Name: page_templates Public can view enabled templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view enabled templates" ON public.page_templates FOR SELECT USING (((deleted_at IS NULL) AND (is_enabled = true)));


--
-- Name: reviews Public can view reviews for active contractors; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view reviews for active contractors" ON public.reviews FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.contractors c
  WHERE ((c.id = reviews.contractor_id) AND (c.status = 'active'::text) AND (c.deleted_at IS NULL)))));


--
-- Name: pages Public users can view published pages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public users can view published pages" ON public.pages FOR SELECT USING (((status = 'published'::text) AND (deleted_at IS NULL)));


--
-- Name: account_profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.account_profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: business_claims Users can view their own claims; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own claims" ON public.business_claims FOR SELECT TO authenticated USING (((claimant_user_id = auth.uid()) OR (claimant_email = auth.email())));


--
-- Name: account_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.account_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_article_evals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_article_evals ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_article_job_steps; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_article_job_steps ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_article_jobs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_article_jobs ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_golden_examples; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_golden_examples ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_personas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_personas ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_prompt_versions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_prompt_versions ENABLE ROW LEVEL SECURITY;

--
-- Name: background_jobs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.background_jobs ENABLE ROW LEVEL SECURITY;

--
-- Name: business_claims; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.business_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: cities; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

--
-- Name: contractor_service_types; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.contractor_service_types ENABLE ROW LEVEL SECURITY;

--
-- Name: contractor_service_types contractor_service_types_admin_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY contractor_service_types_admin_delete ON public.contractor_service_types FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.is_admin = true)))));


--
-- Name: contractor_service_types contractor_service_types_admin_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY contractor_service_types_admin_insert ON public.contractor_service_types FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.is_admin = true)))));


--
-- Name: contractor_service_types contractor_service_types_admin_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY contractor_service_types_admin_update ON public.contractor_service_types FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.is_admin = true)))));


--
-- Name: contractor_service_types contractor_service_types_owner_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY contractor_service_types_owner_delete ON public.contractor_service_types FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.contractors
  WHERE ((contractors.id = contractor_service_types.contractor_id) AND (contractors.claimed_by = auth.uid()) AND (contractors.is_claimed = true)))));


--
-- Name: POLICY contractor_service_types_owner_delete ON contractor_service_types; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON POLICY contractor_service_types_owner_delete ON public.contractor_service_types IS 'Owners can remove service types from their claimed contractors';


--
-- Name: contractor_service_types contractor_service_types_owner_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY contractor_service_types_owner_insert ON public.contractor_service_types FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.contractors
  WHERE ((contractors.id = contractor_service_types.contractor_id) AND (contractors.claimed_by = auth.uid()) AND (contractors.is_claimed = true)))));


--
-- Name: POLICY contractor_service_types_owner_insert ON contractor_service_types; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON POLICY contractor_service_types_owner_insert ON public.contractor_service_types IS 'Owners can add service types to their claimed contractors';


--
-- Name: contractor_service_types contractor_service_types_public_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY contractor_service_types_public_read ON public.contractor_service_types FOR SELECT USING (true);


--
-- Name: contractors; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.contractors ENABLE ROW LEVEL SECURITY;

--
-- Name: import_jobs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.import_jobs ENABLE ROW LEVEL SECURITY;

--
-- Name: menu_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

--
-- Name: menus; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;

--
-- Name: page_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.page_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: pages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

--
-- Name: reviews; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

--
-- Name: service_types; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.service_types ENABLE ROW LEVEL SECURITY;

--
-- Name: system_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: objects Admins can delete contractor images; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Admins can delete contractor images" ON storage.objects FOR DELETE USING (((bucket_id = 'contractors'::text) AND (EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.account_type = 'admin'::text))))));


--
-- Name: objects Admins can delete images; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Admins can delete images" ON storage.objects FOR DELETE USING (((bucket_id = 'images'::text) AND ((auth.role() = 'service_role'::text) OR (EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.account_type = 'admin'::text)))))));


--
-- Name: objects Admins can update contractor images; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Admins can update contractor images" ON storage.objects FOR UPDATE USING (((bucket_id = 'contractors'::text) AND (EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.account_type = 'admin'::text))))));


--
-- Name: objects Admins can upload images; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Admins can upload images" ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'images'::text) AND ((auth.role() = 'service_role'::text) OR (EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.account_type = 'admin'::text)))))));


--
-- Name: objects Allow contractor image uploads; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Allow contractor image uploads" ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'contractors'::text) AND ((auth.role() = 'service_role'::text) OR (EXISTS ( SELECT 1
   FROM public.account_profiles
  WHERE ((account_profiles.id = auth.uid()) AND (account_profiles.account_type = 'admin'::text)))))));


--
-- Name: POLICY "Allow contractor image uploads" ON objects; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON POLICY "Allow contractor image uploads" ON storage.objects IS 'Allows service role and authenticated admins to upload images to contractors bucket';


--
-- Name: objects Public can view images; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Public can view images" ON storage.objects FOR SELECT USING ((bucket_id = 'images'::text));


--
-- Name: objects Public read access for contractor images; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Public read access for contractor images" ON storage.objects FOR SELECT USING ((bucket_id = 'contractors'::text));


--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_vectors; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_vectors ENABLE ROW LEVEL SECURITY;

--
-- Name: iceberg_namespaces; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.iceberg_namespaces ENABLE ROW LEVEL SECURITY;

--
-- Name: iceberg_tables; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.iceberg_tables ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: prefixes; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.prefixes ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: vector_indexes; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.vector_indexes ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


--
-- PostgreSQL database dump complete
--

\unrestrict 74KtJ8knOII5RCgXwgVtjhdoAmvmlZ351NiF5PvorfGFszDLpPYDHo1JdBYNIX6

