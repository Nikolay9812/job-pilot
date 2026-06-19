CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  current_title TEXT,
  experience_level TEXT CHECK (
    experience_level IS NULL
    OR experience_level IN ('junior', 'mid', 'senior', 'lead')
  ),
  years_experience INTEGER CHECK (
    years_experience IS NULL
    OR years_experience >= 0
  ),
  skills TEXT[] NOT NULL DEFAULT '{}',
  industries TEXT[] NOT NULL DEFAULT '{}',
  work_experience JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (
    jsonb_typeof(work_experience) = 'array'
    AND jsonb_array_length(work_experience) <= 3
  ),
  education JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (
    jsonb_typeof(education) = 'object'
  ),
  job_titles_seeking TEXT[] NOT NULL DEFAULT '{}',
  remote_preference TEXT CHECK (
    remote_preference IS NULL
    OR remote_preference IN ('remote', 'onsite', 'hybrid', 'any')
  ),
  preferred_locations TEXT[] NOT NULL DEFAULT '{}',
  salary_expectation TEXT,
  cover_letter_tone TEXT CHECK (
    cover_letter_tone IS NULL
    OR cover_letter_tone IN ('formal', 'casual', 'enthusiastic')
  ),
  linkedin_url TEXT,
  portfolio_url TEXT,
  work_authorization TEXT CHECK (
    work_authorization IS NULL
    OR work_authorization IN ('citizen', 'permanent_resident', 'visa_required')
  ),
  resume_pdf_url TEXT,
  resume_pdf_key TEXT,
  is_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'running' CHECK (
    status IN ('running', 'completed', 'failed')
  ),
  job_title_searched TEXT NOT NULL,
  location_searched TEXT,
  jobs_found INTEGER NOT NULL DEFAULT 0 CHECK (jobs_found >= 0),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (id, user_id),
  CHECK (
    completed_at IS NULL
    OR completed_at >= started_at
  )
);

CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES public.agent_runs(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('search', 'url')),
  source_url TEXT,
  external_apply_url TEXT,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  salary TEXT,
  job_type TEXT NOT NULL DEFAULT 'fulltime' CHECK (
    job_type IN ('fulltime', 'parttime', 'contract')
  ),
  about_role TEXT,
  responsibilities TEXT[] NOT NULL DEFAULT '{}',
  requirements TEXT[] NOT NULL DEFAULT '{}',
  nice_to_have TEXT[] NOT NULL DEFAULT '{}',
  benefits TEXT[] NOT NULL DEFAULT '{}',
  about_company TEXT,
  match_score INTEGER NOT NULL CHECK (
    match_score >= 0
    AND match_score <= 100
  ),
  match_reason TEXT,
  matched_skills TEXT[] NOT NULL DEFAULT '{}',
  missing_skills TEXT[] NOT NULL DEFAULT '{}',
  company_research JSONB CHECK (
    company_research IS NULL
    OR jsonb_typeof(company_research) = 'object'
  ),
  found_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (id, user_id)
);

CREATE TABLE public.agent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES public.agent_runs(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'info' CHECK (
    level IN ('info', 'success', 'warning', 'error')
  ),
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX profiles_email_idx ON public.profiles(email);
CREATE INDEX agent_runs_user_started_idx ON public.agent_runs(user_id, started_at DESC);
CREATE INDEX agent_runs_user_status_idx ON public.agent_runs(user_id, status);
CREATE INDEX jobs_user_found_idx ON public.jobs(user_id, found_at DESC);
CREATE INDEX jobs_user_match_score_idx ON public.jobs(user_id, match_score DESC);
CREATE INDEX jobs_run_id_idx ON public.jobs(run_id);
CREATE INDEX jobs_company_search_idx ON public.jobs(user_id, lower(company));
CREATE INDEX jobs_title_search_idx ON public.jobs(user_id, lower(title));
CREATE INDEX agent_logs_user_created_idx ON public.agent_logs(user_id, created_at DESC);
CREATE INDEX agent_logs_run_id_idx ON public.agent_logs(run_id);
CREATE INDEX agent_logs_job_id_idx ON public.agent_logs(job_id);

CREATE OR REPLACE FUNCTION public.prevent_column_changes()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  column_name TEXT;
BEGIN
  FOREACH column_name IN ARRAY TG_ARGV LOOP
    IF to_jsonb(NEW)->column_name IS DISTINCT FROM to_jsonb(OLD)->column_name THEN
      RAISE EXCEPTION '% cannot be changed', column_name;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_prevent_identity_changes
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_column_changes('id', 'created_at');

CREATE TRIGGER agent_runs_prevent_identity_changes
  BEFORE UPDATE ON public.agent_runs
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_column_changes('id', 'user_id', 'created_at');

CREATE TRIGGER jobs_prevent_identity_changes
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_column_changes(
    'id',
    'run_id',
    'user_id',
    'source',
    'source_url',
    'created_at'
  );

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

CREATE TRIGGER agent_runs_updated_at
  BEFORE UPDATE ON public.agent_runs
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.profiles FROM anon, authenticated;
REVOKE ALL ON public.agent_runs FROM anon, authenticated;
REVOKE ALL ON public.jobs FROM anon, authenticated;
REVOKE ALL ON public.agent_logs FROM anon, authenticated;

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.agent_runs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.jobs TO authenticated;
GRANT SELECT, INSERT ON public.agent_logs TO authenticated;

CREATE POLICY "profiles owners can read"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY "profiles owners can insert"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "profiles owners can update"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "agent_runs owners can read"
  ON public.agent_runs
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "agent_runs owners can insert"
  ON public.agent_runs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "agent_runs owners can update"
  ON public.agent_runs
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "jobs owners can read"
  ON public.jobs
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "jobs owners can insert"
  ON public.jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "jobs owners can update"
  ON public.jobs
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "agent_logs owners can read"
  ON public.agent_logs
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "agent_logs owners can insert"
  ON public.agent_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));
