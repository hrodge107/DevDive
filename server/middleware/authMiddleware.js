import { supabase } from '../lib/supabase.js';
import { createUserClient } from '../lib/supabaseUserClient.js';

/**
 * Auth middleware for protected group routes.
 * 
 * 1. Extracts Bearer token from Authorization header
 * 2. Verifies token via supabase.auth.getUser (service role client)
 * 3. Creates per-request authenticated Supabase client (anon key + JWT)
 * 4. Attaches req.user and req.supabase to the request object
 */
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Missing or invalid Authorization header.' }
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify the token using the service role client
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token.' }
      });
    }

    // Create a per-request Supabase client that enforces RLS as this user
    req.supabase = createUserClient(token);
    req.user = { id: user.id, email: user.email };

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Authentication service error.' }
    });
  }
};
