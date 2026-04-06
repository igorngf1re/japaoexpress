// ═══════════════════════════════════════════════════════════
// Japão Express — Sincronização Firestore
// Persiste carrinho + favoritos + perfil por conta de usuário,
// sincronizando entre todos os dispositivos em tempo real.
// ═══════════════════════════════════════════════════════════

// ── Acessa instância do Firestore (compat SDK) ────────────
function _db() {
  try {
    if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
      return firebase.firestore();
    }
  } catch {}
  return null;
}

// ── Debounce: agrupa escritas consecutivas em uma só ──────
let _syncTimer = null;

function scheduleSyncToCloud() {
  const user = _localUser();
  if (!user?.uid) return; // não sincroniza sem UID
  clearTimeout(_syncTimer);
  _syncTimer = setTimeout(() => _writeToFirestore(user.uid), 1200);
}

// ── Escreve carrinho + favs + perfil no Firestore ─────────
async function _writeToFirestore(uid) {
  const db = _db();
  if (!db || !uid) return;
  try {
    const cart    = _localCart();
    const favs    = _localFavs();
    const user    = _localUser() || {};

    await db.collection('users').doc(uid).set({
      cart,
      favs,
      profile: {
        name:      user.name      || '',
        phone:     user.phone     || '',
        birthdate: user.birthdate || '',
        email:     user.email     || '',
      },
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  } catch (e) {
    console.warn('[JE Sync] Escrita no Firestore falhou:', e);
  }
}

// ── Lê do Firestore e mescla com localStorage ─────────────
async function syncFromFirestore(uid) {
  const db = _db();
  if (!db || !uid) return;
  try {
    const snap = await db.collection('users').doc(uid).get();

    if (!snap.exists) {
      // Primeiro login: sobe o que está no dispositivo para a nuvem
      await _writeToFirestore(uid);
      return;
    }

    const data = snap.data();

    // ── Carrinho: mescla local + nuvem ────────────────────
    const localCart  = _localCart();
    const cloudCart  = data.cart || [];
    const mergedCart = _mergeCart(cloudCart, localCart);
    localStorage.setItem('je_cart', JSON.stringify(mergedCart));

    // ── Favoritos: união de todos os dois ─────────────────
    const localFavs  = _localFavs();
    const cloudFavs  = data.favs || [];
    const mergedFavs = [...new Set([...cloudFavs, ...localFavs])];
    localStorage.setItem('je_favs', JSON.stringify(mergedFavs));

    // ── Perfil: nuvem preenche campos que o local não tem ─
    if (data.profile) {
      const localUser = _localUser() || {};
      const merged = {
        ...data.profile,    // base da nuvem
        ...localUser,       // local tem prioridade (edições recentes neste dispositivo)
        uid,
      };
      localStorage.setItem('je_user', JSON.stringify(merged));
    }

    // Sobe a versão mesclada para a nuvem (mantém tudo em sincronia)
    await _writeToFirestore(uid);

    // Propaga mudanças para a UI
    window.dispatchEvent(new CustomEvent('je:cartUpdated'));
    if (typeof updateAllBadges === 'function') updateAllBadges();
    if (typeof updateFavIcons  === 'function') updateFavIcons();
    if (typeof updateAuthUI    === 'function') updateAuthUI();

  } catch (e) {
    console.warn('[JE Sync] Leitura do Firestore falhou:', e);
  }
}

// ── Mescla dois arrays de carrinho pelo campo id ──────────
// cloud = base confiável (outros dispositivos)
// local = edições recentes deste dispositivo
function _mergeCart(cloud, local) {
  const map = {};
  for (const item of cloud) map[item.id] = { ...item };
  for (const item of local) {
    if (map[item.id]) {
      // Toma a maior quantidade entre nuvem e local
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
