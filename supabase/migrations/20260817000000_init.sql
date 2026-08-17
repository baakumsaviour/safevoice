-- SafeVoice consolidated schema v2
-- Replaces db/schema.sql, db/add_ai_handoff.sql, db/setup_realtime_and_storage.sql
-- Idempotent where practical; designed for `supabase db push` / `supabase db reset`.

-- =========================================================================
-- Tables
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('victim', 'caseworker', 'admin', 'analyst')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  phone_number TEXT
);

CREATE TABLE IF NOT EXISTS public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  victim_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  case_number TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed', 'archived')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  incident_date DATE,
  incident_location TEXT,
  incident_location_geo JSONB,
  narrative_encrypted TEXT,
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  case_type TEXT NOT NULL DEFAULT 'general_abuse'
    CHECK (case_type IN ('domestic_violence', 'child_abuse', 'sexual_assault', 'gbv', 'harassment', 'general_abuse', 'other')),
  consent_given BOOLEAN DEFAULT false,
  follow_up_consent BOOLEAN DEFAULT false,
  created_by_user_id UUID NOT NULL REFERENCES public.users(id),
  closed_at TIMESTAMPTZ,
  evidence_expires_at TIMESTAMPTZ,
  ai_active BOOLEAN NOT NULL DEFAULT true
);

-- sender_id is NULL for AI-generated messages.
CREATE TABLE IF NOT EXISTS public.case_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.users(id),
  message_encrypted TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  read_at TIMESTAMPTZ,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('victim', 'caseworker', 'ai')),
  CONSTRAINT ai_messages_have_null_sender CHECK (sender_role <> 'ai' OR sender_id IS NULL)
);

CREATE TABLE IF NOT EXISTS public.case_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(id),
  note_encrypted TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_private BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES public.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_locked BOOLEAN DEFAULT false,
  metadata_encrypted TEXT
);

CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.users(id),
  action TEXT NOT NULL,
  description TEXT,
  timestamp TIMESTAMPTZ DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  phone_number TEXT,
  website TEXT,
  is_available_offline BOOLEAN DEFAULT true,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =========================================================================
-- Helper: current user's role (avoids repeating the subselect; SECURITY
-- DEFINER so it can read public.users regardless of RLS on that table)
-- =========================================================================

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

-- =========================================================================
-- Integrity triggers
-- =========================================================================

-- Users may never change their own role (service-role writes, where
-- auth.uid() is NULL, are exempt — that's how admin invitations work).
CREATE OR REPLACE FUNCTION public.prevent_role_self_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND auth.uid() = OLD.id THEN
    RAISE EXCEPTION 'role changes are not permitted';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_self_change ON public.users;
CREATE TRIGGER trg_prevent_role_self_change
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_self_change();

-- Case identity fields are immutable for authenticated (non-service) writers.
CREATE OR REPLACE FUNCTION public.prevent_case_identity_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND (
       NEW.victim_id IS DISTINCT FROM OLD.victim_id OR
       NEW.created_by_user_id IS DISTINCT FROM OLD.created_by_user_id OR
       NEW.case_number IS DISTINCT FROM OLD.case_number
     ) THEN
    RAISE EXCEPTION 'case identity fields are immutable';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_case_identity_change ON public.cases;
CREATE TRIGGER trg_prevent_case_identity_change
  BEFORE UPDATE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.prevent_case_identity_change();

-- updated_at maintenance
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_cases_updated_at ON public.cases;
CREATE TRIGGER trg_cases_updated_at BEFORE UPDATE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_case_notes_updated_at ON public.case_notes;
CREATE TRIGGER trg_case_notes_updated_at BEFORE UPDATE ON public.case_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================================
-- Row Level Security
-- =========================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- ---- users ----
DROP POLICY IF EXISTS "users_select_own" ON public.users;
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Allow a signed-in user to create their own profile row (signup / anonymous
-- reporting). Role is constrained to 'victim'; staff rows are created via the
-- service role only.
DROP POLICY IF EXISTS "users_insert_self_victim" ON public.users;
CREATE POLICY "users_insert_self_victim" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id AND role = 'victim');

-- ---- cases ----
DROP POLICY IF EXISTS "cases_select_victim" ON public.cases;
CREATE POLICY "cases_select_victim" ON public.cases
  FOR SELECT USING (victim_id = auth.uid() OR created_by_user_id = auth.uid());

DROP POLICY IF EXISTS "cases_select_caseworker" ON public.cases;
CREATE POLICY "cases_select_caseworker" ON public.cases
  FOR SELECT USING (
    assigned_to = auth.uid() AND public.current_user_role() IN ('caseworker', 'admin', 'analyst')
  );

DROP POLICY IF EXISTS "cases_select_admin" ON public.cases;
CREATE POLICY "cases_select_admin" ON public.cases
  FOR SELECT USING (public.current_user_role() IN ('admin', 'analyst'));

-- Victims create their own cases; staff can also create.
DROP POLICY IF EXISTS "cases_insert_caseworker" ON public.cases;
DROP POLICY IF EXISTS "cases_insert" ON public.cases;
CREATE POLICY "cases_insert" ON public.cases
  FOR INSERT WITH CHECK (
    (victim_id = auth.uid() AND created_by_user_id = auth.uid())
    OR public.current_user_role() IN ('caseworker', 'admin')
  );

DROP POLICY IF EXISTS "cases_update_assigned" ON public.cases;
CREATE POLICY "cases_update_assigned" ON public.cases
  FOR UPDATE
  USING (assigned_to = auth.uid() OR public.current_user_role() = 'admin')
  WITH CHECK (assigned_to = auth.uid() OR public.current_user_role() = 'admin');

-- ---- case_messages ----
DROP POLICY IF EXISTS "messages_select" ON public.case_messages;
CREATE POLICY "messages_select" ON public.case_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = case_id AND (
        c.victim_id = auth.uid() OR
        c.assigned_to = auth.uid() OR
        public.current_user_role() = 'admin'
      )
    )
  );

-- Sender must be the authenticated user, must belong to the case, and the
-- claimed sender_role must match reality. AI rows are service-role only.
DROP POLICY IF EXISTS "messages_insert" ON public.case_messages;
CREATE POLICY "messages_insert" ON public.case_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND (
      (sender_role = 'victim' AND EXISTS (
        SELECT 1 FROM public.cases c WHERE c.id = case_id AND c.victim_id = auth.uid()
      ))
      OR
      (sender_role = 'caseworker' AND public.current_user_role() IN ('caseworker', 'admin') AND EXISTS (
        SELECT 1 FROM public.cases c WHERE c.id = case_id AND (c.assigned_to = auth.uid() OR public.current_user_role() = 'admin')
      ))
    )
  );

-- ---- case_notes ----
DROP POLICY IF EXISTS "notes_select_caseworker" ON public.case_notes;
CREATE POLICY "notes_select_caseworker" ON public.case_notes
  FOR SELECT USING (
    author_id = auth.uid()
    OR public.current_user_role() = 'admin'
    OR (public.current_user_role() = 'caseworker' AND EXISTS (
      SELECT 1 FROM public.cases c WHERE c.id = case_id AND c.assigned_to = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "notes_insert" ON public.case_notes;
CREATE POLICY "notes_insert" ON public.case_notes
  FOR INSERT WITH CHECK (
    author_id = auth.uid() AND public.current_user_role() IN ('caseworker', 'admin')
  );

-- ---- evidence ----
DROP POLICY IF EXISTS "evidence_select" ON public.evidence;
CREATE POLICY "evidence_select" ON public.evidence
  FOR SELECT USING (
    uploaded_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = case_id AND (
        c.victim_id = auth.uid() OR
        c.assigned_to = auth.uid() OR
        public.current_user_role() = 'admin'
      )
    )
  );

DROP POLICY IF EXISTS "evidence_insert" ON public.evidence;
CREATE POLICY "evidence_insert" ON public.evidence
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = case_id AND (
        c.victim_id = auth.uid() OR
        c.assigned_to = auth.uid() OR
        public.current_user_role() IN ('caseworker', 'admin')
      )
    )
  );

-- ---- audit_log ----
DROP POLICY IF EXISTS "audit_select_admin" ON public.audit_log;
CREATE POLICY "audit_select_admin" ON public.audit_log
  FOR SELECT USING (public.current_user_role() = 'admin' OR user_id = auth.uid());

-- No client INSERT policy: audit rows are written via the service role only,
-- so they cannot be forged from the browser.
DROP POLICY IF EXISTS "audit_insert_always" ON public.audit_log;

-- ---- resources ----
DROP POLICY IF EXISTS "resources_select_public" ON public.resources;
CREATE POLICY "resources_select_public" ON public.resources
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "resources_insert_admin" ON public.resources;
CREATE POLICY "resources_insert_admin" ON public.resources
  FOR INSERT WITH CHECK (public.current_user_role() = 'admin');

-- =========================================================================
-- Indexes
-- =========================================================================

CREATE INDEX IF NOT EXISTS idx_cases_status ON public.cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_assigned_to ON public.cases(assigned_to);
CREATE INDEX IF NOT EXISTS idx_cases_created_by ON public.cases(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_cases_victim ON public.cases(victim_id);
CREATE INDEX IF NOT EXISTS idx_cases_priority ON public.cases(priority);
CREATE INDEX IF NOT EXISTS idx_cases_incident_date ON public.cases(incident_date);
CREATE INDEX IF NOT EXISTS idx_case_messages_case_id ON public.case_messages(case_id);
CREATE INDEX IF NOT EXISTS idx_case_notes_case_id ON public.case_notes(case_id);
CREATE INDEX IF NOT EXISTS idx_evidence_case_id ON public.evidence(case_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_case_id ON public.audit_log(case_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON public.audit_log(timestamp);

-- =========================================================================
-- Realtime (never DROP the publication — additive only)
-- =========================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'case_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.case_messages;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'cases'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.cases;
  END IF;
END $$;

-- =========================================================================
-- Storage: private evidence bucket, per-case access
-- Object keys are `<case_id>/<uuid>.<ext>` — the first folder is the case id.
-- =========================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('evidence', 'evidence', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated users can upload evidence" ON storage.objects;
DROP POLICY IF EXISTS "Users can view evidence" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own evidence" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own evidence" ON storage.objects;

DROP POLICY IF EXISTS "evidence_objects_select" ON storage.objects;
CREATE POLICY "evidence_objects_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'evidence' AND EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id::text = (storage.foldername(name))[1] AND (
        c.victim_id = auth.uid() OR
        c.assigned_to = auth.uid() OR
        public.current_user_role() = 'admin'
      )
    )
  );

DROP POLICY IF EXISTS "evidence_objects_insert" ON storage.objects;
CREATE POLICY "evidence_objects_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'evidence' AND EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id::text = (storage.foldername(name))[1] AND (
        c.victim_id = auth.uid() OR
        c.assigned_to = auth.uid() OR
        public.current_user_role() IN ('caseworker', 'admin')
      )
    )
  );
-- No client UPDATE/DELETE policies: evidence is immutable from the browser.
