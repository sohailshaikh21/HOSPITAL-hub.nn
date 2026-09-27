/**
 * HospitalityHub B2B Resource Exchange — Full-Stack Server
 * 
 * Powered by Express and Supabase (PostgreSQL + Auth).
 * Features:
 * - Real JWT authentication & authorization
 * - Strict server-side MMR boundary validation
 * - Row-level resource ownership checks (auth.uid())
 * - Participant-scoped booking requests & calendar updates
 * - Clear 503 fallback when Supabase credentials are not configured
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

import supabase from './supabaseClient.js';
import {
  supabaseAdmin,
  isConfigured,
  supabaseUrl,
  getUserFromAuthHeader
} from './supabaseAdmin.js';
import { isValidMMRLocation } from './mmrLocations.js';
import {
  profileToClient,
  profileToDb,
  resourceToClient,
  resourceToDb,
  requestToClient,
  requestToDb
} from './mappers.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Serve static frontend files from workspace root
app.use(express.static(path.join(__dirname, '..')));

// Helper: Guard middleware to check if Supabase is configured
function requireSupabase(req, res, next) {
  if (!isConfigured || !supabaseAdmin) {
    return res.status(503).json({
      error: 'Supabase backend is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.'
    });
  }
  next();
}

// ==========================================
// 1. HEALTH & SYSTEM INFO API
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'HospitalityHub B2B Marketplace REST API',
    database: isConfigured ? 'Supabase (Postgres + Auth)' : 'Supabase Not Configured (Set .env)',
    supabaseConnected: isConfigured,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('resources')
      .select('id, title, category, price_per_day')
      .limit(5);

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.json({
      success: true,
      message: 'Supabase se data fetch ho gaya!',
      count: data.length,
      data: data
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. AUTHENTICATION & USER APIS
// ==========================================

// Register New Enterprise User
app.post('/api/auth/register', requireSupabase, async (req, res) => {
  try {
    const {
      email,
      password,
      businessName,
      businessType,
      role,
      accountType,
      location,
      contactPhone,
      contactPerson
    } = req.body;

    // 1. Validation
    if (!email || !password || !businessName) {
      return res.status(400).json({ error: 'Email, password, and businessName are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    // 2. Strict MMR Location Verification (Server-Side)
    const loc = location || 'Lower Parel, Mumbai';
    if (!isValidMMRLocation(loc)) {
      return res.status(400).json({
        error: `Location "${loc}" is outside the Mumbai Metropolitan Region (MMR). Registration is restricted to valid MMR zones only.`
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const userRole = role || (accountType === 'provider' ? 'Provider' : 'Seeker');
    const userAcctType = accountType || (userRole.toLowerCase().includes('provider') ? 'provider' : 'seeker');

    // 3. Create user in Supabase Auth via Admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        business_name: businessName.trim(),
        business_type: businessType || 'Hotel & Resort',
        role: userRole,
        account_type: userAcctType,
        location: loc,
        contact_phone: contactPhone || '',
        contact_person: contactPerson || businessName.trim()
      }
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const userId = authData.user.id;

    // 4. Ensure profile row in public.profiles table
    const profilePayload = {
      id: userId,
      email: cleanEmail,
      business_name: businessName.trim(),
      business_type: businessType || 'Hotel & Resort',
      role: userRole,
      account_type: userAcctType,
      location: loc,
      contact_phone: contactPhone || '',
      contact_person: contactPerson || businessName.trim(),
      verification_status: userAcctType === 'provider' ? 'Not Submitted' : 'Verified',
      verified: userAcctType !== 'provider',
      rating: 5.0,
      reviews_count: 0
    };

    const { data: profileRow, error: profError } = await supabaseAdmin
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'id' })
      .select()
      .single();

    if (profError) {
      console.warn('Profile upsert warning:', profError.message);
    }

    // 5. Generate session token for immediate client authentication
    // Try signInWithPassword to get a real access_token
    let token = `jwt-${userId}-${Date.now()}`;
    const anonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    try {
      const clientAuth = createClient(supabaseUrl, anonKey);
      const { data: loginSession } = await clientAuth.auth.signInWithPassword({
        email: cleanEmail,
        password: password
      });
      if (loginSession && loginSession.session) {
        token = loginSession.session.access_token;
      }
    } catch (e) {}

    const clientUser = profileToClient(profileRow || profilePayload, cleanEmail);
    clientUser.token = token;

    return res.status(201).json({
      success: true,
      user: clientUser,
      token,
      message: 'Enterprise account registered successfully.'
    });
  } catch (err) {
    console.error('Registration exception:', err);
    return res.status(500).json({ error: err.message || 'Server error during registration.' });
  }
});

// Login Enterprise User
app.post('/api/auth/login', requireSupabase, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const anonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    const clientAuth = createClient(supabaseUrl, anonKey);

    // 1. Authenticate with Supabase Auth (Strict: No fake auto-provisioning)
    const { data: authData, error: authError } = await clientAuth.auth.signInWithPassword({
      email: cleanEmail,
      password: password
    });

    if (authError || !authData.user) {
      return res.status(401).json({ error: authError ? authError.message : 'Invalid login credentials.' });
    }

    const user = authData.user;
    const token = authData.session ? authData.session.access_token : `jwt-${user.id}`;

    // 2. Fetch User Profile from Postgres
    const { data: profileRow } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const clientUser = profileToClient(profileRow, cleanEmail) || {
      id: user.id,
      email: cleanEmail,
      businessName: user.user_metadata?.business_name || cleanEmail.split('@')[0],
      role: user.user_metadata?.role || 'Seeker',
      accountType: user.user_metadata?.account_type || 'seeker',
      location: user.user_metadata?.location || 'Lower Parel, Mumbai',
      verified: true
    };

    clientUser.token = token;

    return res.json({
      success: true,
      user: clientUser,
      token,
      message: 'Logged in successfully.'
    });
  } catch (err) {
    console.error('Login exception:', err);
    return res.status(500).json({ error: err.message || 'Server error during authentication.' });
  }
});

// Update Profile (Requires Bearer Token)
app.put('/api/auth/profile', requireSupabase, async (req, res) => {
  try {
    const user = await getUserFromAuthHeader(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Valid bearer token required.' });
    }

    const updates = profileToDb(req.body);

    const { data: updatedRow, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({
      success: true,
      user: profileToClient(updatedRow, user.email),
      message: 'Profile updated successfully.'
    });
  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. COMMERCIAL RESOURCES APIS
// ==========================================

// Get All Public Resources
app.get('/api/resources', requireSupabase, async (req, res) => {
  try {
    const { data: rows, error } = await supabaseAdmin
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const clientResources = (rows || []).map(resourceToClient);
    return res.json(clientResources);
  } catch (err) {
    console.error('Get resources error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Create Resource (Requires Bearer Token)
app.post('/api/resources', requireSupabase, async (req, res) => {
  try {
    const user = await getUserFromAuthHeader(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Provider bearer token required to list assets.' });
    }

    const payload = req.body;
    if (!payload.title || !payload.category || !payload.pricePerDay) {
      return res.status(400).json({ error: 'Title, category, and pricePerDay are required.' });
    }

    const loc = payload.location || 'Lower Parel, Mumbai';
    if (!isValidMMRLocation(loc)) {
      return res.status(400).json({ error: `Location "${loc}" is outside authorized MMR planning zones.` });
    }

    const dbRow = resourceToDb(payload, user.id, user.email);

    const { data: created, error } = await supabaseAdmin
      .from('resources')
      .insert(dbRow)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({
      success: true,
      resource: resourceToClient(created),
      message: 'Commercial resource created successfully.'
    });
  } catch (err) {
    console.error('Create resource error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Update Resource (Ownership Verified: caller must be resource owner)
app.put('/api/resources/:id', requireSupabase, async (req, res) => {
  try {
    const user = await getUserFromAuthHeader(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Bearer token required.' });
    }

    const { id } = req.params;

    // 1. Fetch existing resource to verify ownership
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('resources')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !existing) {
      return res.status(404).json({ error: 'Resource listing not found.' });
    }

    // 2. Strict Ownership Check
    if (existing.owner_id && existing.owner_id !== user.id) {
      return res.status(403).json({ error: 'Forbidden: You can only edit your own resource listings.' });
    }

    const updates = resourceToDb(req.body, user.id, user.email);
    delete updates.id; // Do not overwrite ID

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('resources')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateErr) {
      return res.status(400).json({ error: updateErr.message });
    }

    return res.json({
      success: true,
      resource: resourceToClient(updated),
      message: 'Resource updated successfully.'
    });
  } catch (err) {
    console.error('Update resource error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Delete Resource (Ownership Verified)
app.delete('/api/resources/:id', requireSupabase, async (req, res) => {
  try {
    const user = await getUserFromAuthHeader(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Bearer token required.' });
    }

    const { id } = req.params;

    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('resources')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !existing) {
      return res.status(404).json({ error: 'Resource listing not found.' });
    }

    if (existing.owner_id && existing.owner_id !== user.id) {
      return res.status(403).json({ error: 'Forbidden: You can only delete your own resource listings.' });
    }

    const { error: delErr } = await supabaseAdmin
      .from('resources')
      .delete()
      .eq('id', id);

    if (delErr) {
      return res.status(400).json({ error: delErr.message });
    }

    return res.json({ success: true, message: 'Resource listing deleted successfully.' });
  } catch (err) {
    console.error('Delete resource error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. BOOKING REQUESTS & WORKFLOW APIS
// ==========================================

// Get Requests (Scoped to authenticated user as seeker or provider)
app.get('/api/requests', requireSupabase, async (req, res) => {
  try {
    const user = await getUserFromAuthHeader(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Bearer token required.' });
    }

    const { data: rows, error } = await supabaseAdmin
      .from('requests')
      .select('*')
      .or(`seeker_id.eq.${user.id},provider_id.eq.${user.id},seeker_email.eq.${user.email},provider_email.eq.${user.email}`)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const clientRequests = (rows || []).map(requestToClient);
    return res.json(clientRequests);
  } catch (err) {
    console.error('Get requests error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Create Booking Request (Requires Bearer Token)
app.post('/api/requests', requireSupabase, async (req, res) => {
  try {
    const user = await getUserFromAuthHeader(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Bearer token required.' });
    }

    const payload = req.body;
    const assetId = payload.assetId || payload.resourceId;
    if (!assetId || !payload.startDate || !payload.endDate) {
      return res.status(400).json({ error: 'Asset ID, startDate, and endDate are required.' });
    }

    // Try to resolve provider_id from resources table
    let providerId = payload.providerId || null;
    const { data: assetRow } = await supabaseAdmin
      .from('resources')
      .select('owner_id, owner_email')
      .eq('id', assetId)
      .single();

    if (assetRow && assetRow.owner_id) {
      providerId = assetRow.owner_id;
    }

    payload.providerId = providerId;
    const dbRow = requestToDb(payload, user.id, user.email);

    const { data: created, error } = await supabaseAdmin
      .from('requests')
      .insert(dbRow)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Lock calendar on resource
    try {
      await supabaseAdmin
        .from('resources')
        .update({ availability_status: 'Locked' })
        .eq('id', assetId);
    } catch (e) {}

    return res.status(201).json({
      success: true,
      request: requestToClient(created),
      message: 'Booking request created and calendar locked.'
    });
  } catch (err) {
    console.error('Create request error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Update Request Status (Accept, Reject, Cancel, Negotiate)
app.patch('/api/requests/:id', requireSupabase, async (req, res) => {
  try {
    const user = await getUserFromAuthHeader(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Bearer token required.' });
    }

    const { id } = req.params;
    const { status, negotiationOffer, notes, auditStatus } = req.body;

    const { data: targetReq, error: fetchErr } = await supabaseAdmin
      .from('requests')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !targetReq) {
      return res.status(404).json({ error: 'Booking request not found.' });
    }

    // Participant verification
    const isParticipant =
      targetReq.seeker_id === user.id ||
      targetReq.provider_id === user.id ||
      targetReq.seeker_email.toLowerCase() === user.email.toLowerCase() ||
      targetReq.provider_email.toLowerCase() === user.email.toLowerCase();

    if (!isParticipant) {
      return res.status(403).json({ error: 'Forbidden: You are not a participant in this booking.' });
    }

    const updateFields = { updated_at: new Date().toISOString() };
    if (status) updateFields.status = status;
    if (negotiationOffer !== undefined) updateFields.negotiation_offer = negotiationOffer;
    if (notes !== undefined) updateFields.notes = notes;
    if (auditStatus !== undefined) updateFields.audit_status = auditStatus;

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('requests')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();

    if (updateErr) {
      return res.status(400).json({ error: updateErr.message });
    }

    // Synchronize asset calendar availability
    if (status === 'Approved' || status === 'Confirmed') {
      await supabaseAdmin
        .from('resources')
        .update({ availability_status: 'Pre-booked' })
        .eq('id', targetReq.asset_id);
    } else if (status === 'Rejected' || status === 'Cancelled' || status === 'Completed') {
      await supabaseAdmin
        .from('resources')
        .update({ availability_status: 'Available' })
        .eq('id', targetReq.asset_id);
    }

    return res.json({
      success: true,
      request: requestToClient(updated),
      message: `Booking request updated to ${status}.`
    });
  } catch (err) {
    console.error('Update request error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Catch-all to serve index.html for SPA routing
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(__dirname, '..', 'index.html'));
  }
  next();
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 HospitalityHub Full-Stack Server running on port ${PORT}`);
  console.log(`📡 Database status: ${isConfigured ? 'Supabase (Postgres + Auth) Connected' : '⚠️ Supabase Not Configured (Set .env)'}`);
  console.log(`🌐 Live REST API & Web UI accessible at http://localhost:${PORT}`);
});
