-- SafeVoice Database Schema
-- Run this in your Supabase dashboard

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('victim', 'caseworker', 'admin', 'analyst')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  phone_number TEXT
);

-- Cases table
CREATE TABLE IF NOT EXISTS public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  victim_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  case_number TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed', 'archived')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  incident_date DATE,
  incident_location TEXT,
  incident_location_geo JSONB,
  narrative_encrypted TEXT,
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  case_type TEXT,
  consent_given BOOLEAN DEFAULT false,
  follow_up_consent BOOLEAN DEFAULT false,
  created_by_user_id UUID NOT NULL REFERENCES public.users(id),
  closed_at TIMESTAMP WITH TIME ZONE,
  evidence_expires_at TIMESTAMP WITH TIME ZONE
);

-- Case Messages table (secure messaging between victim and caseworker)
CREATE TABLE IF NOT EXISTS public.case_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id),
  message_encrypted TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('victim', 'caseworker'))
);

-- Case Notes table (internal notes by caseworkers)
CREATE TABLE IF NOT EXISTS public.case_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(id),
  note_encrypted TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_private BOOLEAN DEFAULT false
);

-- Evidence table (uploaded files)
CREATE TABLE IF NOT EXISTS public.evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES public.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_locked BOOLEAN DEFAULT false,
  metadata_encrypted TEXT
);

-- Audit Log table (security and compliance)
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES public.users(id),
  action TEXT NOT NULL,
  description TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Resources table (offline-first support)
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  phone_number TEXT,
  website TEXT,
  is_available_offline BOOLEAN DEFAULT true,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Users: Can only see their own profile
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Cases: Victims see own, Caseworkers see assigned, Admins see all
CREATE POLICY "cases_select_victim" ON public.cases
  FOR SELECT USING (
    victim_id = auth.uid() OR
    created_by_user_id = auth.uid()
  );

CREATE POLICY "cases_select_caseworker" ON public.cases
  FOR SELECT USING (
    assigned_to = auth.uid() AND
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('caseworker', 'admin', 'analyst')
  );

CREATE POLICY "cases_select_admin" ON public.cases
  FOR SELECT USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'analyst')
  );

CREATE POLICY "cases_insert_caseworker" ON public.cases
  FOR INSERT WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('caseworker', 'admin')
  );

CREATE POLICY "cases_update_assigned" ON public.cases
  FOR UPDATE USING (
    assigned_to = auth.uid() OR
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin')
  );

-- Case Messages: Only involved parties
CREATE POLICY "messages_select" ON public.case_messages
  FOR SELECT USING (
    sender_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = case_id AND (
        c.victim_id = auth.uid() OR
        c.assigned_to = auth.uid() OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
      )
    )
  );

CREATE POLICY "messages_insert" ON public.case_messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Case Notes: Only caseworkers and admins
CREATE POLICY "notes_select_caseworker" ON public.case_notes
  FOR SELECT USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('caseworker', 'admin') OR
    author_id = auth.uid()
  );

CREATE POLICY "notes_insert" ON public.case_notes
  FOR INSERT WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('caseworker', 'admin')
  );

-- Evidence: Authorized access only
CREATE POLICY "evidence_select" ON public.evidence
  FOR SELECT USING (
    uploaded_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = case_id AND (
        c.victim_id = auth.uid() OR
        c.assigned_to = auth.uid() OR
        (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin')
      )
    )
  );

CREATE POLICY "evidence_insert" ON public.evidence
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = case_id AND (
        c.victim_id = auth.uid() OR
        c.assigned_to = auth.uid() OR
        (SELECT role FROM public.users WHERE id = auth.uid()) IN ('caseworker', 'admin')
      )
    )
  );

-- Audit Log: Admin and self-view only
CREATE POLICY "audit_select_admin" ON public.audit_log
  FOR SELECT USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin') OR
    user_id = auth.uid()
  );

CREATE POLICY "audit_insert_always" ON public.audit_log
  FOR INSERT WITH CHECK (true);

-- Resources: Public read
CREATE POLICY "resources_select_public" ON public.resources
  FOR SELECT USING (true);

CREATE POLICY "resources_insert_admin" ON public.resources
  FOR INSERT WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cases_status ON public.cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_assigned_to ON public.cases(assigned_to);
CREATE INDEX IF NOT EXISTS idx_cases_created_by ON public.cases(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_cases_priority ON public.cases(priority);
CREATE INDEX IF NOT EXISTS idx_cases_incident_date ON public.cases(incident_date);
CREATE INDEX IF NOT EXISTS idx_case_messages_case_id ON public.case_messages(case_id);
CREATE INDEX IF NOT EXISTS idx_case_notes_case_id ON public.case_notes(case_id);
CREATE INDEX IF NOT EXISTS idx_evidence_case_id ON public.evidence(case_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_case_id ON public.audit_log(case_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON public.audit_log(timestamp);
