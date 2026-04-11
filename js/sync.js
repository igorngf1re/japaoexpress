// ═══════════════════════════════════════════════════════════
// Japão Express — Sincronização Firestore em Tempo Real
// Firestore é a fonte única da verdade quando o usuário está
// logado. Mudanças em qualquer dispositivo chegam em tempo real.
// ═══════════════════════════════════════════════════════════

function _db() {
  try {
    if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
      return firebase.firestore();
    }
  } catch {}
  return null;
}

// ── Listener em tempo real ────────────────────────────────
let _unsubSync = null;
let _firstSnap = true;

// Suprime snapshots da nuvem por N ms após uma escrita local,
// evitando que dados antigos sobrescrevam mudanças em trânsito.
// Ex: remover item do carrinho → gravamos no Firestore → snapshot
// volta com dado NOVO (item removido). Sem a supressão, o snapshot
// chega durante os ~400ms do debounce e reverte a remoção.
let _ignoreSnapUntil = 0;

/**
 * Inicia o listener em tempo real no documento do usuário.
 * Qualquer mudança no Firestore (de qualquer dispositivo)
 * atualiza o localStorage e a UI instantaneamente.
 */
function startRealtimeSync(uid) {
  stopRealtimeSync();
  _firstSnap = true;
  const db = _db();
  if (!db || !uid) return;

  _unsubSync = db.collection('users').doc(uid).onSnapshot(function(snap) {
    if (!snap.exists) {
      // Primeiro login: sobe dados locais para a nuvem
      _firstSnap = false;
      _writeToFirestore(uid);
      return;
    }

    const data      = snap.data();
    const cloudCart = Array.isArray(data.cart) ? data.cart : [];
    const cloudFavs = Array.isArray(data.favs) ? data.favs : [];

    if (_firstSnap) {
      _firstSnap = false;
      // Primeiro snap após login: mescla itens locais pré-login com a nuvem
      // (ex: usuário adicionou ao carrinho antes de logar)
      const localCart  = _localCart();
      const localFavs  = _localFavs();
      const mergedCart = _mergeCartAdditive(cloudCart, localCart);
      const mergedFavs = [...new Set([...cloudFavs, ...localFavs])];

      localStorage.setItem('je_cart', JSON.stringify(mergedCart));
      localStorage.setItem('je_favs', JSON.stringify(mergedFavs));

      // Se havia itens extras no local, sobe a versão mesclada
      const cartChanged = mergedCart.length > cloudCart.length;
      const favsChanged = mergedFavs.length > cloudFavs.length;
      if (cartChanged || favsChanged) {
        _writeToFirestore(uid);
      }
    } else {
      // Snapshots subsequentes: nuvem é autoritativa —
      // MAS não sobrescreve se há escrita local recente em andamento
      // (janela de 3s após qualquer escrita local)
      if (Date.now() > _ignoreSnapUntil) {
        localStorage.setItem('je_cart', JSON.stringify(cloudCart));
        localStorage.setItem('je_favs', JSON.stringify(cloudFavs));
      }
    }

    // Perfil: atualiza da nuvem somente fora da janela de supressão
    if (data.profile && Date.now() > _ignoreSnapUntil) {
      const localUser = _localUser() || {};
      localStorage.setItem('je_user', JSON.stringify({
        ...data.profile,
        // Preserva campos locais que não vêm do Firestore ou podem ser mais recentes
        cpf:   localUser.cpf   || '',
        uid,
        email: localUser.email || data.profile.email || '',
      }));
    }

    // Propaga mudanças para a UI
    window.dispatchEvent(new CustomEvent('je:cartUpdated'));
    window.dispatchEvent(new CustomEvent('je:syncUpdated'));
    if (typeof updateAllBadges === 'function') updateAllBadges();
    if (typeof updateFavIcons  === 'function') updateFavIcons();
    if (typeof updateAuthUI    === 'function') updateAuthUI();

  }, function(err) {
    console.warn('[JE Sync] onSnapshot falhou:', err);
  });
}

/**
 * Para o listener em tempo real (chamado no logout).
 */
function stopRealtimeSync() {
  if (_unsubSync) {
    _unsubSync();
    _unsubSync = null;
  }
}

// ── Debounce: agrupa escritas consecutivas em uma só ──────
let _syncTimer = null;

function scheduleSyncToCloud() {
  const user = _localUser();
  if (!user?.uid) return;
  clearTimeout(_syncTimer);
  _syncTimer = setTimeout(() => {
    _syncTimer = null;
    // Suprime snapshots por 3s após a escrita local para evitar
    // que dados antigos da nuvem sobrescrevam mudanças em trânsito
    _ignoreSnapUntil = Date.now() + 3000;
    _writeToFirestore(user.uid);
  }, 400); // 400ms: rápido o suficiente para parecer instantâneo
}

// ── Escreve carrinho + favs + perfil no Firestore ─────────
async function _writeToFirestore(uid) {
  const db = _db();
  if (!db || !uid) return;
  try {
    const cart = _localCart();
    const favs = _localFavs();
    const user = _localUser() || {};

    await db.collection('users').doc(uid).set({
      cart,
      favs,
      profile: {
        name:      user.name      || '',
        phone:     user.phone     || '',
        birthdate: user.birthdate || '',
        email:     user.email     || '',
        address:   user.address   || {},
      },
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  } catch (e) {
    console.warn('[JE Sync] Escrita no Firestore falhou:', e);
  }
}

// ── Mescla dois arrays de carrinho (só aditivo, para primeiro login) ──
function _mergeCartAdditive(cloud, local) {
  const map = {};
  for (const item of cloud) map[item.id] = { ...item };
  for (const item of local) {
    if (map[item.id]) {
      map[item.id].qty = Math.max(map[item.id].qty || 1, item.qty || 1);
    } else {
      map[item.id] = { ...item };
    }
  }
  return Object.values(map);
}

// ── Helpers locais ────────────────────────────────────────
function _localCart() {
  try { return JSON.parse(localStorage.getItem('je_cart') || '[]'); } catch { return []; }
}
function _localFavs() {
  try { return JSON.parse(localStorage.getItem('je_favs') || '[]'); } catch { return []; }
}
function _localUser() {
  try { return JSON.parse(localStorage.getItem('je_user')); } catch { return null; }
}
