(function () {
  var CSS_STRING = [
    '#sidebarOverlay{position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,0);pointer-events:none;transition:background .3s}',
    '#sidebarOverlay.open{background:rgba(0,0,0,.45);pointer-events:all}',
    '#sidebarPanel{position:absolute;left:0;top:0;height:100%;width:285px;background:#FDFAF2;transform:translateX(-100%);transition:transform .32s cubic-bezier(.4,0,.2,1);box-shadow:4px 0 32px rgba(44,22,84,.2);display:flex;flex-direction:column;overflow-y:auto}',
    '#sidebarOverlay.open #sidebarPanel{transform:translateX(0)}',
    '.je-si{display:flex;align-items:center;gap:12px;padding:13px 20px;color:#2C1654;font-weight:700;font-size:15px;text-decoration:none;border-radius:10px;margin:2px 10px;transition:background .15s,color .15s;cursor:pointer}',
    '.je-si:hover{background:#F0E8FF;color:#9B59B6}',
    '.je-si .icon{width:22px;text-align:center;font-size:17px}',
    '.je-sdiv{height:1px;background:#E8DCFF;margin:8px 18px}',
    '.je-scats{padding:0 10px 4px}',
    '.je-scat{display:block;padding:7px 14px 7px 52px;font-size:13px;font-weight:600;color:#5D3890;text-decoration:none;border-radius:8px;transition:background .15s}',
    '.je-scat:hover{background:#F0E8FF}',
  ].join('');

  var SIDEBAR_HTML = '<div id="sidebarOverlay" onclick="closeSidebar()">' +
    '<aside id="sidebarPanel" onclick="event.stopPropagation()">' +
      '<div style="display:flex;align-items:center;justify-content:center;padding:18px 20px;border-bottom:1px solid #EDE0FF;position:relative">' +
        '<a href="/" onclick="closeSidebar()">' +
          '<img src="logo.png" onerror="this.onerror=null;this.src=\'https://i.imgur.com/lxyYcwX.png\'" alt="Japão Express" style="height:80px;object-fit:contain;display:block">' +
        '</a>' +
        '<button onclick="closeSidebar()" style="position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#9B59B6;font-size:26px;font-weight:900;line-height:1">&times;</button>' +
      '</div>' +
      '<div style="padding:12px 14px 4px">' +
        '<form onsubmit="event.preventDefault();var q=this.querySelector(\'input\').value.trim();if(q){closeSidebar();window.location=\'produtos.html?search=\'+encodeURIComponent(q);}" style="position:relative">' +
          '<i class="fa-solid fa-magnifying-glass" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:#9B59B6;font-size:12px;pointer-events:none"></i>' +
          '<input type="text" placeholder="Buscar produtos..." style="width:100%;padding:8px 12px 8px 30px;border-radius:20px;border:2px solid #E8DCFF;font-family:Nunito,sans-serif;font-size:13px;font-weight:600;color:#2C1654;background:#F7F3FF;outline:none;box-sizing:border-box">' +
        '</form>' +
      '</div>' +
      '<nav style="flex:1;padding:8px 0">' +
        '<a href="produtos.html" class="je-si" onclick="closeSidebar()"><span class="icon"><i class="fa-solid fa-store"></i></span> Produtos</a>' +
        '<div class="je-si" onclick="toggleSidebarCats(this)" style="justify-content:space-between;user-select:none">' +
          '<div style="display:flex;align-items:center;gap:12px"><span class="icon"><i class="fa-solid fa-tags"></i></span> Categorias</div>' +
          '<i class="fa-solid fa-chevron-down" id="je-catChevron" style="font-size:11px;transition:transform .2s"></i>' +
        '</div>' +
        '<div id="je-sidebarCats" class="je-scats" style="display:none">' +
          '<a href="produtos.html?cat=cosmeticos"  class="je-scat" onclick="closeSidebar()">\uD83D\uDC84 Cosméticos & Skincare</a>' +
          '<a href="produtos.html?cat=maquiagem"   class="je-scat" onclick="closeSidebar()">\uD83D\uDC8B Maquiagem</a>' +
          '<a href="produtos.html?cat=cabelos"     class="je-scat" onclick="closeSidebar()">\uD83D\uDC86 Cabelos</a>' +
          '<a href="produtos.html?cat=fragrancias" class="je-scat" onclick="closeSidebar()">\uD83C\uDF38 Fragrâncias</a>' +
          '<a href="produtos.html?cat=higiene"     class="je-scat" onclick="closeSidebar()">\uD83D\uDC8A Higiene & Saúde</a>' +
          '<a href="produtos.html?cat=doces"       class="je-scat" onclick="closeSidebar()">\uD83C\uDF61 Doces & Snacks</a>' +
          '<a href="produtos.html?cat=alimentacao" class="je-scat" onclick="closeSidebar()">\uD83C\uDF5C Alimentação</a>' +
          '<a href="produtos.html?cat=games"       class="je-scat" onclick="closeSidebar()">\uD83C\uDFAE Games</a>' +
          '<a href="produtos.html?cat=coleciona"   class="je-scat" onclick="closeSidebar()">\uD83E\uDDF8 Colecionáveis</a>' +
          '<a href="produtos.html?cat=papelaria"   class="je-scat" onclick="closeSidebar()">\u270F\uFE0F Papelaria</a>' +
          '<a href="produtos.html?cat=cultura"     class="je-scat" onclick="closeSidebar()">\uD83C\uDEE9 Cultura Japonesa</a>' +
        '</div>' +
        '<div class="je-sdiv"></div>' +
        '<button class="je-si" data-currency-toggle onclick="typeof toggleCurrency===\'function\'&&toggleCurrency()" style="width:calc(100% - 20px);background:none;border:none;text-align:left">' +
          '<span class="icon">\uD83D\uDCB4</span> Moeda' +
          '<span style="margin-left:auto;font-size:11px;font-weight:900;color:#9B59B6" id="sbCurrLabel">BRL</span>' +
        '</button>' +
        '<a href="carrinho.html" class="je-si" onclick="closeSidebar()">' +
          '<span class="icon"><i class="fa-solid fa-bag-shopping"></i></span> Carrinho' +
          '<span id="sb-cart-badge" style="margin-left:auto;background:#9B59B6;color:white;font-size:10px;font-weight:900;border-radius:999px;width:20px;height:20px;display:none;align-items:center;justify-content:center">0</span>' +
        '</a>' +
        '<a href="favoritos.html"   class="je-si" onclick="closeSidebar()"><span class="icon"><i class="fa-regular fa-heart"></i></span> Favoritos</a>' +
        '<a href="meus-pedidos.html" class="je-si" onclick="closeSidebar()"><span class="icon"><i class="fa-solid fa-receipt"></i></span> Meus Pedidos</a>' +
        '<a href="perfil.html"      class="je-si" onclick="closeSidebar()"><span class="icon"><i class="fa-regular fa-circle-user"></i></span> Minha Conta</a>' +
        '<div class="je-sdiv"></div>' +
        '<a href="/#como-funciona" class="je-si" onclick="closeSidebar()"><span class="icon"><i class="fa-solid fa-circle-question"></i></span> Como Funciona</a>' +
        '<a href="contato.html" class="je-si" onclick="closeSidebar()"><span class="icon"><i class="fa-solid fa-envelope"></i></span> Contato</a>' +
      '</nav>' +
      '<div style="padding:16px 20px;border-top:1px solid #EDE0FF;font-size:12px;color:#9B8FBB;font-weight:600">\u00A9 2026 Japão Express \uD83C\uDF38</div>' +
    '</aside>' +
  '</div>';

  var HEADER_HTML = '' +
    '<!-- col esquerda: hamburguer -->' +
    '<div style="display:flex;align-items:center">' +
      '<button onclick="openSidebar()" aria-label="Menu" style="display:flex;flex-direction:column;gap:5px;padding:8px 10px;border-radius:12px;background:none;border:none;cursor:pointer" onmouseover="this.style.background=\'#F5F0FF\'" onmouseout="this.style.background=\'none\'">' +
        '<span style="display:block;width:24px;height:2.5px;background:#2C1654;border-radius:2px"></span>' +
        '<span style="display:block;width:24px;height:2.5px;background:#2C1654;border-radius:2px"></span>' +
        '<span style="display:block;width:16px;height:2.5px;background:#2C1654;border-radius:2px"></span>' +
      '</button>' +
    '</div>' +
    '<!-- col centro: logo -->' +
    '<div style="display:flex;justify-content:center">' +
      '<a href="/">' +
        '<img src="logo.png" onerror="this.onerror=null;this.src=\'https://i.imgur.com/lxyYcwX.png\'" alt="Japão Express" style="height:96px;object-fit:contain;filter:drop-shadow(0 1px 3px rgba(0,0,0,.1))">' +
      '</a>' +
    '</div>' +
    '<!-- col direita: perfil + carrinho -->' +
    '<div style="display:flex;align-items:center;justify-content:flex-end;gap:12px">' +
      '<a href="perfil.html" data-auth-perfil style="color:#3D1A78;text-decoration:none" title="Minha Conta">' +
        '<i class="fa-regular fa-circle-user" style="font-size:22px"></i>' +
      '</a>' +
      '<a href="carrinho.html" style="position:relative;color:#3D1A78;text-decoration:none" title="Carrinho">' +
        '<i class="fa-solid fa-bag-shopping" style="font-size:20px"></i>' +
        '<span data-cart-badge style="position:absolute;top:-7px;right:-7px;background:#9B59B6;color:white;font-size:9px;font-weight:900;border-radius:999px;width:15px;height:15px;display:none;align-items:center;justify-content:center;line-height:1"></span>' +
      '</a>' +
    '</div>';

  window.openSidebar = function () {
    var ov = document.getElementById('sidebarOverlay');
    if (ov) ov.classList.add('open');
  };

  window.closeSidebar = function () {
    var ov = document.getElementById('sidebarOverlay');
    if (ov) ov.classList.remove('open');
  };

  window.toggleSidebarCats = function () {
    var cats = document.getElementById('je-sidebarCats');
    var chev = document.getElementById('je-catChevron');
    if (!cats) return;
    var open = cats.style.display === 'none' || cats.style.display === '';
    cats.style.display = open ? 'block' : 'none';
    if (chev) chev.style.transform = open ? 'rotate(180deg)' : '';
  };

  function _inject() {
    // Inject CSS
    var style = document.createElement('style');
    style.textContent = CSS_STRING;
    document.head.appendChild(style);

    // Inject sidebar only if not already present
    if (!document.getElementById('sidebarOverlay')) {
      var tmp = document.createElement('template');
      tmp.innerHTML = SIDEBAR_HTML.trim();
      document.body.insertBefore(tmp.content.firstChild, document.body.firstChild);
    }

    // Replace header content (only if not already processed)
    var header = document.querySelector('header');
    if (header && !header.getAttribute('data-je-done')) {
      header.setAttribute('data-je-done', '1');
      header.innerHTML = HEADER_HTML;
      header.style.cssText = 'display:grid;align-items:center;padding:10px 16px;border-bottom:1px solid #EDE0FF;gap:8px;grid-template-columns:1fr auto 1fr';
    }

    // Botão flutuante de moeda (canto inferior esquerdo)
    if (!document.getElementById('je-currency-float')) {
      var floatBtn = document.createElement('button');
      floatBtn.id = 'je-currency-float';
      floatBtn.setAttribute('data-currency-toggle', '');
      floatBtn.title = 'Alternar moeda';
      floatBtn.onclick = function() { typeof toggleCurrency === 'function' && toggleCurrency(); };
      floatBtn.style.cssText = 'position:fixed;bottom:24px;left:20px;z-index:998;display:flex;align-items:center;gap:6px;background:#2C1654;color:white;font-family:Nunito,sans-serif;font-weight:900;font-size:11px;padding:9px 16px;border-radius:999px;border:none;cursor:pointer;letter-spacing:.05em;box-shadow:0 4px 16px rgba(44,22,84,.35);transition:transform .15s';
      floatBtn.innerHTML = '<span>\uD83C\uDDE7\uD83C\uDDF7</span><span data-currency-toggle-label>BRL</span>';
      floatBtn.onmouseover = function() { this.style.transform = 'scale(1.06)'; };
      floatBtn.onmouseout  = function() { this.style.transform = ''; };
      document.body.appendChild(floatBtn);
    }

    // Atualiza badge do carrinho assim que o header existir
    // (cart.js pode ainda não ter carregado, então tentamos novamente)
    _syncBadge();
    _syncCurrency();
  }

  function _syncBadge() {
    if (typeof getCartCount === 'function') {
      var count = getCartCount();
      document.querySelectorAll('[data-cart-badge]').forEach(function(el) {
        el.textContent = count;
        el.style.display = count > 0 ? 'flex' : 'none';
      });
    }
  }

  function _syncCurrency() {
    if (typeof updateToggleBtn === 'function') {
      updateToggleBtn();
    } else {
      // currency.js ainda não carregou — atualiza o label com o valor do localStorage
      try {
        var cur = localStorage.getItem('je_currency') || 'BRL';
        var icons = { BRL: '🇧🇷', JPY: '🇯🇵', USD: '🇺🇸' };
        document.querySelectorAll('[data-currency-toggle]').forEach(function(el) {
          var lbl = el.querySelector('[data-currency-toggle-label]');
          if (lbl) {
            el.querySelector('span:first-child').textContent = icons[cur] || '🇧🇷';
            lbl.textContent = cur;
          } else {
            el.innerHTML = '<span>' + (icons[cur] || '🇧🇷') + '</span> ' + cur;
          }
        });
        var sb = document.getElementById('sbCurrLabel');
        if (sb) sb.textContent = cur;
      } catch(e) {}
    }
  }

  // Após todos os scripts carregarem, re-sincroniza badge e moeda
  window.addEventListener('load', function() {
    _syncBadge();
    _syncCurrency();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _inject);
  } else {
    _inject();
  }

  // ── Cookie Consent Banner (LGPD) ──────────────────────────────────
  (function () {
    var CONSENT_KEY = 'je_cookie_consent';

    function _showBanner() {
      if (localStorage.getItem(CONSENT_KEY)) return; // already chosen

      var banner = document.createElement('div');
      banner.id = 'je-cookie-banner';
      banner.style.cssText = [
        'position:fixed',
        'bottom:0',
        'left:0',
        'right:0',
        'z-index:9999',
        'background:#2C1654',
        'color:#fff',
        'font-family:Nunito,sans-serif',
        'font-size:13px',
        'font-weight:600',
        'padding:14px 20px',
        'display:flex',
        'align-items:center',
        'justify-content:space-between',
        'flex-wrap:wrap',
        'gap:12px',
        'box-shadow:0 -4px 24px rgba(44,22,84,.35)',
      ].join(';');

      banner.innerHTML =
        '<span style="flex:1;min-width:220px;line-height:1.5">' +
          'Usamos cookies para melhorar sua experiência. Ao continuar, você concorda com nossa ' +
          '<a href="politicas.html" style="color:#D7B8FF;text-decoration:underline">Política de Cookies</a>.' +
        '</span>' +
        '<div style="display:flex;gap:10px;flex-shrink:0">' +
          '<button id="je-cookie-essential" style="background:none;border:2px solid #9B59B6;color:#D7B8FF;font-family:Nunito,sans-serif;font-weight:900;font-size:12px;letter-spacing:.05em;padding:7px 16px;border-radius:10px;cursor:pointer">Apenas Essenciais</button>' +
          '<button id="je-cookie-accept" style="background:#9B59B6;border:none;color:#fff;font-family:Nunito,sans-serif;font-weight:900;font-size:12px;letter-spacing:.05em;padding:7px 16px;border-radius:10px;cursor:pointer">Aceitar Todos</button>' +
        '</div>';

      document.body.appendChild(banner);

      document.getElementById('je-cookie-accept').addEventListener('click', function () {
        localStorage.setItem(CONSENT_KEY, 'all');
        banner.remove();
      });
      document.getElementById('je-cookie-essential').addEventListener('click', function () {
        localStorage.setItem(CONSENT_KEY, 'essential');
        banner.remove();
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', _showBanner);
    } else {
      _showBanner();
    }
  })();
})();
