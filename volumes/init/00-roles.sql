-- 00-roles.sql: Initialize Supabase Roles & Extensions
-- Reference: https://supabase.com/docs/guides/self-hosting/docker

-- 1. Create Roles
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticator') THEN
    CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD 'postgres';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_admin') THEN
    CREATE ROLE supabase_admin LOGIN PASSWORD 'postgres' SUPERUSER;
  END IF;
END
$$;

-- 2. Grant Role Memberships
GRANT anon TO authenticator;
GRANT authenticated TO authenticator;
GRANT service_role TO authenticator;
GRANT supabase_admin TO postgres; 

-- 3. Create Schemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS storage;
CREATE SCHEMA IF NOT EXISTS real_time;

-- 4. Enable Extensions (Must be done by Superuser/supabase_admin)
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

-- 5. Grant Usage on Schemas
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;
GRANT USAGE ON SCHEMA auth TO supabase_admin;

-- 6. Set Default Privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role, supabase_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role, supabase_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role, supabase_admin;

-- 7. Grant permissions on existing public objects
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role, supabase_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role, supabase_admin;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role, supabase_admin;
