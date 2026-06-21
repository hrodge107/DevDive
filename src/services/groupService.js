import { supabase } from '../lib/supabaseClient';

/**
 * Helper to get the current user's access token for API calls.
 * All group API routes require Authorization: Bearer <token>.
 */
async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Not authenticated. Please sign in.');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  };
}

/**
 * Helper for consistent error handling from API responses.
 */
async function handleResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    const message = data?.error?.message || data?.message || 'Request failed';
    throw new Error(message);
  }
  return data;
}

// ============================================================================
// Groups CRUD
// ============================================================================

export const createGroup = async (name, description) => {
  const headers = await getAuthHeaders();
  const response = await fetch('/api/groups', {
    method: 'POST',
    headers,
    body: JSON.stringify({ name, description }),
  });
  return handleResponse(response);
};

export const fetchGroups = async () => {
  const headers = await getAuthHeaders();
  const response = await fetch('/api/groups', { headers });
  return handleResponse(response);
};

export const fetchGroup = async (groupId) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`/api/groups/${groupId}`, { headers });
  return handleResponse(response);
};

export const deleteGroup = async (groupId) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`/api/groups/${groupId}`, {
    method: 'DELETE',
    headers,
  });
  return handleResponse(response);
};

// ============================================================================
// Membership
// ============================================================================

export const joinGroupByCode = async (joinCode) => {
  const headers = await getAuthHeaders();
  const response = await fetch('/api/groups/join', {
    method: 'POST',
    headers,
    body: JSON.stringify({ join_code: joinCode }),
  });
  return handleResponse(response);
};

export const fetchMembers = async (groupId) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`/api/groups/${groupId}/members`, { headers });
  return handleResponse(response);
};

export const updateMemberStatus = async (groupId, userId, status) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`/api/groups/${groupId}/members/${userId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status }),
  });
  return handleResponse(response);
};

export const removeMember = async (groupId, userId) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`/api/groups/${groupId}/members/${userId}`, {
    method: 'DELETE',
    headers,
  });
  return handleResponse(response);
};

// ============================================================================
// Group Exercises
// ============================================================================

export const createExercise = async (groupId, exerciseData) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`/api/groups/${groupId}/exercises`, {
    method: 'POST',
    headers,
    body: JSON.stringify(exerciseData),
  });
  return handleResponse(response);
};

export const fetchExercises = async (groupId) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`/api/groups/${groupId}/exercises`, { headers });
  return handleResponse(response);
};

export const fetchExercise = async (groupId, exId) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`/api/groups/${groupId}/exercises/${exId}`, { headers });
  return handleResponse(response);
};

export const updateExercise = async (groupId, exId, updates) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`/api/groups/${groupId}/exercises/${exId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(updates),
  });
  return handleResponse(response);
};

export const deleteExercise = async (groupId, exId) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`/api/groups/${groupId}/exercises/${exId}`, {
    method: 'DELETE',
    headers,
  });
  return handleResponse(response);
};

// ============================================================================
// Submissions
// ============================================================================

export const submitExercise = async (groupId, exId, code) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`/api/groups/${groupId}/exercises/${exId}/submit`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ code, captureScreens: ['desktop'] }),
  });
  return handleResponse(response);
};

export const fetchGroupSubmissions = async (groupId) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`/api/groups/${groupId}/submissions`, { headers });
  return handleResponse(response);
};

export const fetchUserSubmission = async (groupId, exId) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`/api/groups/${groupId}/exercises/${exId}/submission`, { headers });
  return handleResponse(response);
};

// ============================================================================
// Report
// ============================================================================

export const fetchReport = async (groupId) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`/api/groups/${groupId}/report`, { headers });
  return handleResponse(response);
};
