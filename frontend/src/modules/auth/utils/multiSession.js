// Multi-session manager: allows each browser tab to maintain an independent auth session
// even if the user opens multiple tabs with different accounts.

const SESSIONS_KEY = 'mtg_sessions'; // localStorage map of sessionId -> { token, user, updatedAt }
const TAB_SESSION_ID_KEY = 'tabSessionId'; // sessionStorage key for current tab's session id

function loadAllSessions() {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
}

function saveAllSessions(map, id) {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(map));
    localStorage.setItem('authToken', map[id].token);
    localStorage.setItem('user', JSON.stringify(map[id].user));
  } catch {
    // ignore
  }
}

export function getOrCreateTabSessionId() {
  let id = sessionStorage.getItem(TAB_SESSION_ID_KEY);
  if (!id) {
    id = 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(TAB_SESSION_ID_KEY, id);
  }
  return id;
}

export function getActiveSession() {
  const id = getOrCreateTabSessionId();
  const all = loadAllSessions();
  return { id, data: all[id] };
}

export function setActiveSession(token, user) {
  const id = getOrCreateTabSessionId();
  const all = loadAllSessions();
  all[id] = { token, user, updatedAt: new Date().toISOString() };
  saveAllSessions(all, id);
  // also maintain backwards compatibility for old logic (optional)
  sessionStorage.setItem('authToken', token);
  sessionStorage.setItem('user', JSON.stringify(user));
}

export function clearActiveSession() {
  const id = getOrCreateTabSessionId();
  const all = loadAllSessions();
  delete all[id];
  saveAllSessions(all, id);
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('user');
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
}

export function listSessions() {
  const all = loadAllSessions();
  return Object.entries(all).map(([id, sess]) => ({ id, ...sess }));
}

export function switchToSession(sessionId) {
  const all = loadAllSessions();
  if (!all[sessionId]) return false;
  sessionStorage.setItem(TAB_SESSION_ID_KEY, sessionId);
  const { token, user } = all[sessionId];
  sessionStorage.setItem('authToken', token);
  sessionStorage.setItem('user', JSON.stringify(user));
  return true;
}

export function purgeStaleSessions(maxAgeHours = 48) {
  const all = loadAllSessions();
  const now = Date.now();
  let changed = false;
  for (const [id, sess] of Object.entries(all)) {
    const ts = Date.parse(sess.updatedAt || 0);
    if (!isFinite(ts) || (now - ts) > maxAgeHours * 3600 * 1000) {
      delete all[id];
      changed = true;
    }
  }
  if (changed) saveAllSessions(all);
}