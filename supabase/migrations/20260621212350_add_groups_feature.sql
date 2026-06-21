-- ============================================================================
-- Migration: Groups & Workspace Feature
-- Created: 2026-06-21
-- Description: Adds Collaboration Layer (groups, memberships, group exercises,
--              and group submissions) alongside the existing Identity/Content/
--              State layers. No existing tables are modified.
-- ============================================================================

-- ============================================================================
-- 1. TABLES (in dependency order)
-- ============================================================================

-- 1a. Groups
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  join_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1b. Group Members
CREATE TABLE public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'removed')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- 1c. Group Exercises
CREATE TABLE public.group_exercises (
  id BIGSERIAL PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  task_description TEXT NOT NULL,
  starter_files JSONB NOT NULL DEFAULT '[]'::jsonb,
  ai_rubric JSONB NOT NULL DEFAULT '{}'::jsonb,
  deadline TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1d. Group Submissions
CREATE TABLE public.group_submissions (
  id BIGSERIAL PRIMARY KEY,
  exercise_id BIGINT NOT NULL REFERENCES public.group_exercises(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  submitted_files JSONB NOT NULL DEFAULT '{}'::jsonb,
  score INT CHECK (score >= 0 AND score <= 100),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(exercise_id, user_id)
);

-- ============================================================================
-- 2. INDEXES
-- ============================================================================

CREATE INDEX idx_group_members_group_user ON public.group_members(group_id, user_id);
CREATE INDEX idx_group_members_user ON public.group_members(user_id);
CREATE INDEX idx_group_exercises_group ON public.group_exercises(group_id);
CREATE INDEX idx_group_exercises_deadline ON public.group_exercises(deadline);
CREATE INDEX idx_group_submissions_exercise_user ON public.group_submissions(exercise_id, user_id);
CREATE INDEX idx_group_submissions_user ON public.group_submissions(user_id);

-- ============================================================================
-- 3. TRIGGER: Auto-update updated_at on group_exercises
-- ============================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_group_exercises_updated_at
  BEFORE UPDATE ON public.group_exercises
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all four tables
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_submissions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. HELPER FUNCTIONS FOR RLS (Security Definer to prevent recursion loops)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_group_owner(group_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.groups
    WHERE id = group_uuid AND owner_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.is_group_member(group_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = group_uuid AND user_id = user_uuid AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------------------------------------
-- 5a. public.groups policies
-- --------------------------------------------------------------------------

-- SELECT: owner OR active member
CREATE POLICY groups_select_policy
  ON public.groups
  FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid()
    OR public.is_group_member(id, auth.uid())
  );

-- INSERT: owner is authenticated
CREATE POLICY groups_insert_policy
  ON public.groups
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- UPDATE: owner only
CREATE POLICY groups_update_policy
  ON public.groups
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- DELETE: owner only
CREATE POLICY groups_delete_policy
  ON public.groups
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- --------------------------------------------------------------------------
-- 5b. public.group_members policies
-- --------------------------------------------------------------------------

-- SELECT: owner of the group, active members of the group, or the user themselves
CREATE POLICY group_members_select_policy
  ON public.group_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_group_member(group_id, auth.uid())
    OR public.is_group_owner(group_id, auth.uid())
  );

-- INSERT: owner of the group, or user themselves if joining as pending
CREATE POLICY group_members_insert_policy
  ON public.group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (user_id = auth.uid() AND status = 'pending')
    OR public.is_group_owner(group_id, auth.uid())
  );

-- UPDATE: owner of the group only (to approve/reject status)
CREATE POLICY group_members_update_policy
  ON public.group_members
  FOR UPDATE
  TO authenticated
  USING (public.is_group_owner(group_id, auth.uid()))
  WITH CHECK (public.is_group_owner(group_id, auth.uid()));

-- DELETE: owner of the group, or the user themselves leaving
CREATE POLICY group_members_delete_policy
  ON public.group_members
  FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_group_owner(group_id, auth.uid())
  );

-- --------------------------------------------------------------------------
-- 5c. public.group_exercises policies
-- --------------------------------------------------------------------------

-- SELECT: owner of the group, or active member of the group
CREATE POLICY group_exercises_select_policy
  ON public.group_exercises
  FOR SELECT
  TO authenticated
  USING (
    public.is_group_owner(group_id, auth.uid())
    OR public.is_group_member(group_id, auth.uid())
  );

-- INSERT: owner only
CREATE POLICY group_exercises_insert_policy
  ON public.group_exercises
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_group_owner(group_id, auth.uid()));

-- UPDATE: owner only
CREATE POLICY group_exercises_update_policy
  ON public.group_exercises
  FOR UPDATE
  TO authenticated
  USING (public.is_group_owner(group_id, auth.uid()))
  WITH CHECK (public.is_group_owner(group_id, auth.uid()));

-- DELETE: owner only
CREATE POLICY group_exercises_delete_policy
  ON public.group_exercises
  FOR DELETE
  TO authenticated
  USING (public.is_group_owner(group_id, auth.uid()));

-- --------------------------------------------------------------------------
-- 5d. public.group_submissions policies
-- --------------------------------------------------------------------------

-- SELECT: submitting user, or owner of the group
CREATE POLICY group_submissions_select_policy
  ON public.group_submissions
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_group_owner(group_id, auth.uid())
  );

-- INSERT: active members can submit their own work
CREATE POLICY group_submissions_insert_policy
  ON public.group_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND public.is_group_member(group_id, auth.uid())
  );


-- No UPDATE policy: submissions are immutable once created
-- No DELETE policy: submissions cannot be removed by users
