// ═══════════════════════════════════════════════════════════
// Japão Express — Auth State (localStorage)
// Firebase pode ser plugado aqui quando as credenciais
// estiverem configuradas em js/firebase-config.js
// ═══════════════════════════════════════════════════════════

const USER_KEY = 'je_user';

// ── Leitura / escrita ────────────────────────────────────

function getUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)); }
  catch { return null; }
}

function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  updateAuthUI();
}

function logout() {
  localStorage.removeItem(USER_KEY);
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

  // Link "Entrar" vira "Sair" quando logado
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

  // Botão "Cadastrar" some quando logado
  document.querySelectorAll('[data-auth-cadastrar]').forEach(el => {
    el.style.display = user ? 'none' : '';
  });

  // Ícone de perfil: ativo quando logado
  document.querySelectorAll('[data-auth-perfil]').forEach(el => {
    if (user) {
      el.classList.add('text-[#9B59B6]');
      el.classList.remove('text-[#3D1A78]');
    } else {
      el.classList.remove('text-[#9B59B6]');
      el.classList.add('text-[#3D1A78]');
    }
  });

  // Nome do usuário
  document.querySelectorAll('[data-user-name]').forEach(el => {
    el.textContent = user?.name || '';
  });

  // Elementos visíveis apenas quando logado
  document.querySelectorAll('[data-auth-show]').forEach(el => {
    el.style.display = user ? '' : 'none';
  });

  // Elementos visíveis apenas quando deslogado
  document.querySelectorAll('[data-auth-hide]').forEach(el => {
    el.style.display = user ? 'none' : '';
  });
}

// ── Init ──────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', updateAuthUI);
