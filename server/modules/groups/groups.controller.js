import { supabase as serviceClient } from '../../lib/supabase.js';
import { assembleDocument, normalizeCaptureScreens } from '../../utils/helpers.js';
import { enqueueScreenshot } from '../browser/playwright.service.js';
import { evaluateSubmission } from '../ai/gemini.service.js';

// ============================================================================
// Helper: Generate 6-digit numeric join code
// ============================================================================
function generateJoinCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ============================================================================
// Groups CRUD
// ============================================================================

/**
 * POST /api/groups
 * Create a new group. Generates join_code server-side.
 * Inserts owner as active member automatically.
 */
export const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    if (!name || !name.trim()) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Group name is required.' }
      });
    }

    const joinCode = generateJoinCode();

    // Insert the group (RLS: owner_id = auth.uid())
    const { data: group, error: groupError } = await req.supabase
      .from('groups')
      .insert({
        owner_id: userId,
        name: name.trim(),
        description: description?.trim() || null,
        join_code: joinCode,
      })
      .select()
      .single();

    if (groupError) {
      // Handle UNIQUE constraint violation on join_code
      if (groupError.code === '23505') {
        return res.status(409).json({
          error: { code: 'CONFLICT', message: 'Join code collision. Please try again.' }
        });
      }
      throw groupError;
    }

    // Insert owner as active member
    const { error: memberError } = await req.supabase
      .from('group_members')
      .insert({
        group_id: group.id,
        user_id: userId,
        status: 'active',
      });

    if (memberError) throw memberError;

    res.status(201).json(group);
  } catch (err) {
    console.error('createGroup error:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create group.' }
    });
  }
};

/**
 * GET /api/groups
 * List all groups the current user belongs to (as owner or active member).
 */
export const listGroups = async (req, res) => {
  try {
    // RLS ensures only groups where user is owner or active member are returned
    const { data: groups, error } = await req.supabase
      .from('groups')
      .select('*, group_members(count)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform count from Supabase aggregate format
    const result = groups.map(g => ({
      ...g,
      member_count: g.group_members?.[0]?.count || 0,
      group_members: undefined,
    }));

    res.json(result);
  } catch (err) {
    console.error('listGroups error:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch groups.' }
    });
  }
};

/**
 * GET /api/groups/:groupId
 * Get single group details. RLS guards: owner or active member.
 */
export const getGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const { data: group, error } = await req.supabase
      .from('groups')
      .select('*, group_members(count)')
      .eq('id', groupId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: { code: 'NOT_FOUND', message: 'Group not found or access denied.' }
        });
      }
      throw error;
    }

    res.json({
      ...group,
      member_count: group.group_members?.[0]?.count || 0,
      group_members: undefined,
    });
  } catch (err) {
    console.error('getGroup error:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch group.' }
    });
  }
};

/**
 * DELETE /api/groups/:groupId
 * Delete group. RLS guards: owner only. FK cascades handle cleanup.
 */
export const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const { error } = await req.supabase
      .from('groups')
      .delete()
      .eq('id', groupId);

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(403).json({
          error: { code: 'FORBIDDEN', message: 'Only the group owner can delete this group.' }
        });
      }
      throw error;
    }

    res.json({ message: 'Group deleted successfully.' });
  } catch (err) {
    console.error('deleteGroup error:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete group.' }
    });
  }
};

// ============================================================================
// Membership
// ============================================================================

/**
 * POST /api/groups/join
 * Join a group by code. Creates pending membership.
 */
export const joinGroup = async (req, res) => {
  try {
    const { join_code } = req.body;
    const userId = req.user.id;

    if (!join_code) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Join code is required.' }
      });
    }

    // Find the group by join_code — use service client since user may not be a member yet
    const { data: group, error: findError } = await serviceClient
      .from('groups')
      .select('id, owner_id')
      .eq('join_code', String(join_code).trim())
      .single();

    if (findError || !group) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'No group found with that join code.' }
      });
    }

    // Prevent owner from joining their own group
    if (group.owner_id === userId) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'You are already the owner of this group.' }
      });
    }

    // Insert pending membership (RLS allows self-insert with status=pending)
    const { data: membership, error: insertError } = await req.supabase
      .from('group_members')
      .insert({
        group_id: group.id,
        user_id: userId,
        status: 'pending',
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        return res.status(409).json({
          error: { code: 'CONFLICT', message: 'You have already requested to join this group.' }
        });
      }
      throw insertError;
    }

    res.status(201).json({ message: 'Join request sent. Waiting for owner approval.', membership });
  } catch (err) {
    console.error('joinGroup error:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to join group.' }
    });
  }
};

/**
 * GET /api/groups/:groupId/members
 * List members with status. RLS guards: owner sees all; members see themselves.
 */
export const listMembers = async (req, res) => {
  try {
    const { groupId } = req.params;

    const { data: members, error } = await req.supabase
      .from('group_members')
      .select('id, group_id, user_id, status, joined_at, profiles:user_id(username, email)')
      .eq('group_id', groupId)
      .order('joined_at', { ascending: true });

    if (error) throw error;

    res.json(members);
  } catch (err) {
    console.error('listMembers error:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch members.' }
    });
  }
};

/**
 * PATCH /api/groups/:groupId/members/:userId
 * Update member status (active/removed). RLS guards: owner only.
 */
export const updateMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const { status } = req.body;

    if (!status || !['active', 'removed'].includes(status)) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Status must be "active" or "removed".' }
      });
    }

    const { data: member, error } = await req.supabase
      .from('group_members')
      .update({ status })
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: { code: 'NOT_FOUND', message: 'Member not found or access denied.' }
        });
      }
      throw error;
    }

    res.json(member);
  } catch (err) {
    console.error('updateMember error:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update member.' }
    });
  }
};

/**
 * DELETE /api/groups/:groupId/members/:userId
 * Remove member. RLS guards: owner can remove any; member can remove self.
 */
export const removeMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;

    const { error } = await req.supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ message: 'Member removed successfully.' });
  } catch (err) {
    console.error('removeMember error:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to remove member.' }
    });
  }
};

// ============================================================================
// Group Exercises
// ============================================================================

/**
 * POST /api/groups/:groupId/exercises
 * Create a group exercise. RLS guards: owner only.
 * ai_rubric is written via service client to avoid RLS column issues.
 */
export const createExercise = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;
    const { title, task_description, starter_files, ai_rubric, deadline } = req.body;

    if (!title?.trim() || !task_description?.trim() || !deadline) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Title, task_description, and deadline are required.' }
      });
    }

    // Use service client to insert (includes ai_rubric which is sensitive)
    // But first verify ownership via the user's RLS client
    const { data: group, error: groupError } = await req.supabase
      .from('groups')
      .select('id, owner_id')
      .eq('id', groupId)
      .single();

    if (groupError || !group) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Group not found or access denied.' }
      });
    }

    if (group.owner_id !== userId) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Only the group owner can create exercises.' }
      });
    }

    const { data: exercise, error } = await serviceClient
      .from('group_exercises')
      .insert({
        group_id: groupId,
        created_by: userId,
        title: title.trim(),
        task_description: task_description.trim(),
        starter_files: starter_files || [],
        ai_rubric: ai_rubric || {},
        deadline,
      })
      .select('id, group_id, created_by, title, task_description, starter_files, deadline, created_at, updated_at')
      .single();

    if (error) throw error;

    res.status(201).json(exercise);
  } catch (err) {
    console.error('createExercise error:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create exercise.' }
    });
  }
};

/**
 * GET /api/groups/:groupId/exercises
 * List exercises. Excludes ai_rubric. RLS guards: active member or owner.
 */
export const listExercises = async (req, res) => {
  try {
    const { groupId } = req.params;

    const { data: exercises, error } = await req.supabase
      .from('group_exercises')
      .select('id, group_id, created_by, title, task_description, starter_files, deadline, created_at, updated_at')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(exercises);
  } catch (err) {
    console.error('listExercises error:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch exercises.' }
    });
  }
};

/**
 * GET /api/groups/:groupId/exercises/:exId
 * Get single exercise detail. Excludes ai_rubric. RLS guards: active member or owner.
 */
export const getExercise = async (req, res) => {
  try {
    const { groupId, exId } = req.params;

    const { data: exercise, error } = await req.supabase
      .from('group_exercises')
      .select('id, group_id, created_by, title, task_description, starter_files, deadline, created_at, updated_at')
      .eq('id', exId)
      .eq('group_id', groupId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: { code: 'NOT_FOUND', message: 'Exercise not found or access denied.' }
        });
      }
      throw error;
    }

    res.json(exercise);
  } catch (err) {
    console.error('getExercise error:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch exercise.' }
    });
  }
};

/**
 * PATCH /api/groups/:groupId/exercises/:exId
 * Update exercise fields including ai_rubric. Owner only.
 */
export const updateExercise = async (req, res) => {
  try {
    const { groupId, exId } = req.params;
    const userId = req.user.id;
    const { title, task_description, starter_files, ai_rubric, deadline } = req.body;

    // Verify ownership
    const { data: group, error: groupError } = await req.supabase
      .from('groups')
      .select('id, owner_id')
      .eq('id', groupId)
      .single();

    if (groupError || !group || group.owner_id !== userId) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Only the group owner can update exercises.' }
      });
    }

    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (task_description !== undefined) updates.task_description = task_description.trim();
    if (starter_files !== undefined) updates.starter_files = starter_files;
    if (ai_rubric !== undefined) updates.ai_rubric = ai_rubric;
    if (deadline !== undefined) updates.deadline = deadline;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'No fields to update.' }
      });
    }

    // Use service client since we may be updating ai_rubric
    const { data: exercise, error } = await serviceClient
      .from('group_exercises')
      .update(updates)
      .eq('id', exId)
      .eq('group_id', groupId)
      .select('id, group_id, created_by, title, task_description, starter_files, deadline, created_at, updated_at')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: { code: 'NOT_FOUND', message: 'Exercise not found.' }
        });
      }
      throw error;
    }

    res.json(exercise);
  } catch (err) {
    console.error('updateExercise error:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update exercise.' }
    });
  }
};

/**
 * DELETE /api/groups/:groupId/exercises/:exId
 * Delete exercise. RLS guards: owner only.
 */
export const deleteExercise = async (req, res) => {
  try {
    const { groupId, exId } = req.params;

    const { error } = await req.supabase
      .from('group_exercises')
      .delete()
      .eq('id', exId)
      .eq('group_id', groupId);

    if (error) throw error;

    res.json({ message: 'Exercise deleted successfully.' });
  } catch (err) {
    console.error('deleteExercise error:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete exercise.' }
    });
  }
};

// ============================================================================
// Submissions
// ============================================================================

/**
 * POST /api/groups/:groupId/exercises/:exId/submit
 * Submit code for evaluation. Active member only (not owner).
 * Evaluates via Gemini pipeline and stores score in group_submissions.
 */
export const submitExercise = async (req, res) => {
  try {
    const { groupId, exId } = req.params;
    const userId = req.user.id;
    const { code, captureScreens } = req.body;

    if (!code || !code.html) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Missing required code payload (html).' }
      });
    }

    // Verify user is an active member (not owner)
    const { data: group, error: groupError } = await req.supabase
      .from('groups')
      .select('id, owner_id')
      .eq('id', groupId)
      .single();

    if (groupError || !group) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Group not found or access denied.' }
      });
    }

    if (group.owner_id === userId) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Group owners cannot submit exercises.' }
      });
    }

    // Check active membership
    const { data: membership, error: memberError } = await req.supabase
      .from('group_members')
      .select('status')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (memberError || !membership || membership.status !== 'active') {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Only active members can submit.' }
      });
    }

    // Fetch ai_rubric via service client (never exposed to frontend)
    const { data: exerciseData, error: exerciseError } = await serviceClient
      .from('group_exercises')
      .select('ai_rubric')
      .eq('id', exId)
      .eq('group_id', groupId)
      .single();

    if (exerciseError || !exerciseData?.ai_rubric) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Exercise rubric not found.' }
      });
    }

    const html = code.html || '';
    const css = code.css || '';
    const js = code.js || '';
    const rubric = exerciseData.ai_rubric;
    const screensToCapture = normalizeCaptureScreens(captureScreens);

    // 1. Assemble and capture screenshots
    const assembledDoc = assembleDocument(html, css, js);
    const screenshots = await enqueueScreenshot(assembledDoc, screensToCapture);

    // 2. Evaluate via Gemini
    const evaluation = await evaluateSubmission(html, css, js, rubric, screenshots);

    // 3. Calculate score
    const codePass = (evaluation.codeEvaluation || []).filter(e => e.passed).length;
    const codeTotal = rubric.codeRequirements?.length || 1;
    const visualPass = (evaluation.visualEvaluation || []).filter(e => e.passed).length;
    const visualTotal = rubric.visualRequirements?.length || 1;

    const codeScore = (codePass / codeTotal) * 50;
    const visualScore = (visualPass / visualTotal) * 50;
    const totalScore = Math.round(codeScore + visualScore);

    console.log(`✓ Group exercise evaluation: ${codePass}/${codeTotal} code, ${visualPass}/${visualTotal} visual = ${totalScore}/100`);

    // 4. Store submission (upsert based on UNIQUE(exercise_id, user_id))
    const { data: submission, error: submitError } = await req.supabase
      .from('group_submissions')
      .insert({
        exercise_id: parseInt(exId),
        user_id: userId,
        group_id: groupId,
        submitted_files: code,
        score: totalScore,
      })
      .select()
      .single();

    if (submitError) {
      if (submitError.code === '23505') {
        return res.status(409).json({
          error: { code: 'CONFLICT', message: 'You have already submitted this exercise.' }
        });
      }
      throw submitError;
    }

    // 5. Build response (same shape as /api/check for consistency)
    const codePointsPerReq = rubric.codeRequirements?.length ? 50 / rubric.codeRequirements.length : 0;
    const visualPointsPerReq = rubric.visualRequirements?.length ? 50 / rubric.visualRequirements.length : 0;
    const primaryScreenshot = screenshots.desktop || screenshots.mobile || null;

    let overallHint = evaluation.overallHint;
    if (!overallHint) {
      const failedCode = (evaluation.codeEvaluation || []).filter(e => !e.passed);
      const failedVisual = (evaluation.visualEvaluation || []).filter(e => !e.passed);
      if (totalScore >= 75) {
        overallHint = '🎉 Excellent! Your submission meets all requirements.';
      } else if (failedCode.length > 0 && failedVisual.length > 0) {
        overallHint = '💡 Review both your code structure and visual output.';
      } else if (failedCode.length > 0) {
        overallHint = '👨‍💻 Visual output looks good! Debug your code logic.';
      } else if (failedVisual.length > 0) {
        overallHint = '🎨 Code logic is solid! Focus on the visual design.';
      } else {
        overallHint = '📚 Review all requirements carefully.';
      }
    }

    res.json({
      submission,
      score: totalScore,
      isPassed: totalScore >= 75,
      screenshot: primaryScreenshot,
      overallHint,
      codeEvaluation: evaluation.codeEvaluation || [],
      visualEvaluation: evaluation.visualEvaluation || [],
      codePointsPerReq,
      visualPointsPerReq,
    });
  } catch (err) {
    console.error('submitExercise error:', err);

    let statusCode = 500;
    let message = 'Submission evaluation failed.';

    if (err.message?.includes('Screenshot') || err.message?.includes('Playwright') || err.message?.includes('timeout')) {
      statusCode = 502;
      message = 'Visual generation service unavailable or timed out.';
    } else if (err.message?.includes('AI') || err.message?.includes('Gemini')) {
      statusCode = 502;
      message = 'AI evaluation service is temporarily unavailable.';
    }

    res.status(statusCode).json({
      error: { code: 'EVALUATION_ERROR', message }
    });
  }
};

/**
 * GET /api/groups/:groupId/submissions
 * Get all submissions for the group. Owner only (via RLS).
 */
export const getGroupSubmissions = async (req, res) => {
  try {
    const { groupId } = req.params;

    const { data: submissions, error } = await req.supabase
      .from('group_submissions')
      .select('*, profiles:user_id(username, email)')
      .eq('group_id', groupId)
      .order('submitted_at', { ascending: false });

    if (error) throw error;

    res.json(submissions);
  } catch (err) {
    console.error('getGroupSubmissions error:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch submissions.' }
    });
  }
};

/**
 * GET /api/groups/:groupId/exercises/:exId/submission
 * Get current user's own submission for a specific exercise.
 */
export const getUserSubmission = async (req, res) => {
  try {
    const { groupId, exId } = req.params;
    const userId = req.user.id;

    const { data: submission, error } = await req.supabase
      .from('group_submissions')
      .select('*')
      .eq('exercise_id', exId)
      .eq('user_id', userId)
      .eq('group_id', groupId)
      .maybeSingle();

    if (error) throw error;

    res.json(submission);
  } catch (err) {
    console.error('getUserSubmission error:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch submission.' }
    });
  }
};

// ============================================================================
// Report
// ============================================================================

/**
 * GET /api/groups/:groupId/report
 * Returns structured report with 3 segments.
 * Owner only — uses service client for full data access.
 */
export const getReport = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const { data: group, error: groupError } = await req.supabase
      .from('groups')
      .select('id, owner_id')
      .eq('id', groupId)
      .single();

    if (groupError || !group || group.owner_id !== userId) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Only the group owner can view reports.' }
      });
    }

    // Fetch active members (excluding owner)
    const { data: members, error: membersError } = await serviceClient
      .from('group_members')
      .select('user_id, profiles:user_id(username, email)')
      .eq('group_id', groupId)
      .eq('status', 'active')
      .neq('user_id', userId);

    if (membersError) throw membersError;

    // Fetch all exercises for this group
    const { data: exercises, error: exError } = await serviceClient
      .from('group_exercises')
      .select('id, title, deadline')
      .eq('group_id', groupId);

    if (exError) throw exError;

    const totalTasks = exercises.length;

    if (totalTasks === 0 || members.length === 0) {
      return res.json({ not_answered: [], low_score: [], doing_well: [], total_tasks: totalTasks });
    }

    // Fetch all submissions for this group
    const { data: submissions, error: subError } = await serviceClient
      .from('group_submissions')
      .select('exercise_id, user_id, score')
      .eq('group_id', groupId);

    if (subError) throw subError;

    // Build submission lookup: { `${userId}-${exerciseId}`: score }
    const submissionMap = {};
    submissions.forEach(s => {
      submissionMap[`${s.user_id}-${s.exercise_id}`] = s.score;
    });

    // Categorize each member
    const notAnswered = [];
    const lowScore = [];
    const doingWell = [];

    for (const member of members) {
      let totalEarned = 0;
      let submittedCount = 0;
      const taskStatuses = [];

      for (const ex of exercises) {
        const key = `${member.user_id}-${ex.id}`;
        const score = submissionMap[key];

        if (score !== undefined && score !== null) {
          totalEarned += score;
          submittedCount++;
          taskStatuses.push({ exercise_id: ex.id, title: ex.title, deadline: ex.deadline, status: 'submitted', score });
        } else {
          taskStatuses.push({ exercise_id: ex.id, title: ex.title, deadline: ex.deadline, status: 'not_answered', score: null });
        }
      }

      const missingCount = totalTasks - submittedCount;
      const aggregatePercent = totalTasks > 0 ? (totalEarned / (totalTasks * 100)) * 100 : 0;

      const memberData = {
        user_id: member.user_id,
        username: member.profiles?.username || member.profiles?.email || 'Unknown',
        email: member.profiles?.email,
        submitted_count: submittedCount,
        missing_count: missingCount,
        total_earned: totalEarned,
        aggregate_percent: Math.round(aggregatePercent * 10) / 10,
        task_statuses: taskStatuses,
      };

      if (missingCount > 0) {
        notAnswered.push(memberData);
      } else if (aggregatePercent < 60) {
        lowScore.push(memberData);
      } else {
        doingWell.push(memberData);
      }
    }

    // Sort: not_answered by missing count desc, low/doing by aggregate
    notAnswered.sort((a, b) => b.missing_count - a.missing_count);
    lowScore.sort((a, b) => a.aggregate_percent - b.aggregate_percent);
    doingWell.sort((a, b) => b.aggregate_percent - a.aggregate_percent);

    res.json({ not_answered: notAnswered, low_score: lowScore, doing_well: doingWell, total_tasks: totalTasks });
  } catch (err) {
    console.error('getReport error:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate report.' }
    });
  }
};
