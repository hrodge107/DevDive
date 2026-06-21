### [VIOLATION-001] RLS Recursion & Missing Profiles Joins
- **Principle:** Layered Separation & Correctness
- **Location:** `supabase/migrations/20260621212350_add_groups_feature.sql`
- **Severity:** High
- **Problem:** 1) RLS circular references caused recursion error `42P17`. 2) Foreign keys pointing to `auth.users(id)` instead of `public.profiles(id)` broke PostgREST relational joins.
- **Fix:** 1) Replaced policies with SECURITY DEFINER helpers. 2) Altered `group_members.user_id` and `group_submissions.user_id` to reference `public.profiles(id)`.

**Summary:** Resolved RLS recursion and fixed foreign keys to restore PostgREST profile joins.

