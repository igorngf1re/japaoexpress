// ═══════════════════════════════════════════════════════════
// Japão Express — Auth (Firebase + localStorage fallback)
// Firebase usado quando firebaseConfig.js estiver preenchido.
// ═══════════════════════════════════════════════════════════

const USER_KEY = 'je_user';

// Detecta se Firebase está inicializado
function _hasFirebase() {
  try { return typeof firebase !== 'undefined' && firebase.apps.length > 0; }
  catch { return false; }
}

// ── Leitura / escrita localStorage (cache + fallback) ─────

function getUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)); }
  catch { return null; }
}

function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  updateAuthUI();
}

function _clearUser() {
  localStorage.removeItem(USER_KEY);
}

// ── Firebase Auth ─────────────────────────────────────────

/**
 * Login com email/senha.
 * Retorna Promise<user> ou lança erro.
 */
async function firebaseLogin(email, password) {
  const cred = await firebase.auth().signInWithEmailAndPassword(email, password);
  const u = cred.user;
  setUser({ uid: u.uid, email: u.email, name: u.displayName || email.split('@')[0] });
  return u;
}

/**
 * Cadastro com email/senha + nome.
 * Retorna Promise<user> ou lança erro.
 */
async function firebaseRegister(email, password, name) {
  const cred = await firebase.auth().createUserWithEmailAndPassword(email, password);
  await cred.user.updateProfile({ displayName: name });
  setUser({ uid: cred.user.uid, email, name });
  return cred.user;
}

/**
 * Logout Firebase + limpa localStorage.
 */
async function logout() {
  if (typeof stopRealtimeSync === 'function') stopRealtimeSync();
  if (_hasFirebase()) {
    try { await firebase.auth().signOut(); } catch {}
  }
  _clearUser();
  updateAuthUI();
  window.location.href = 'index.html';
}

// Redireciona para login se não autenticado
function requireAuth() {
  if (!getUser()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// ── Atualiza UI com base no estado de auth ────────────────

function updateAuthUI() {
  const user = getUser();

  document.querySelectorAll('[data-auth-entrar]').forEach(el => {
    if (user) {
      el.textContent = 'Sair';
      el.href = '#';
      el.onclick = (e) => { e.preventDefault(); logout(); };
    } else {
      el.textContent = 'Entrar';
      el.href = 'login.html';
      el.onclick = null;
    }
  });

  document.querySelectorAll('[data-auth-cadastrar]').forEach(el => {
    el.style.display = user ? 'none' : '';
  });

  document.querySelectorAll('[data-auth-perfil]').forEach(el => {
    if (user) {
      el.classList.add('text-[#9B59B6]');
      el.classList.remove('text-[#3D1A78]');
    } else {
      el.classList.remove('text-[#9B59B6]');
      el.classList.add('text-[#3D1A78]');
    }
  });

  document.querySelectorAll('[data-user-name]').forEach(el => {
    el.textContent = user?.name || '';
  });

  document.querySelectorAll('[data-auth-show]').forEach(el => {
    el.style.display = user ? '' : 'none';
  });

  document.querySelectorAll('[data-auth-hide]').forEach(el => {
    el.style.display = user ? 'none' : '';
  });
}

// ── Sync Firebase → localStorage quando página carrega ────

document.addEventListener('DOMContentLoaded', () => {
  if (_hasFirebase()) {
    firebase.auth().onAuthStateChanged(u => {
      if (u) {
        // Mescla com dados locais já salvos (phone, birthdate, etc.)
        // para não apagar informações que o usuário editou no perfil
        const existing = getUser() || {};
        setUser({
          ...existing,
          uid:   u.uid,
          email: u.email,
          // existing.name tem prioridade: preserva o nome editado no perfil.
          // Só usa displayName do Firebase Auth se não houver nome salvo localmente.
          name:  existing.name || u.displayName || u.email.split('@')[0],
        });
        // Inicia listener em tempo real: qualquer mudança no Firestore
        // (de qualquer dispositivo) atualiza este dispositivo instantaneamente
        if (typeof startRealtimeSync === 'function') {
          startRealtimeSync(u.uid);
        }
      } else {
        // Deslogado no Firebase → limpa localStorage
        _clearUser();
        updateAuthUI();
      }
    });
  } else {
    // Sem Firebase: usa localStorage puro
    updateAuthUI();
  }
});
