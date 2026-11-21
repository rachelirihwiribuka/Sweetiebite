// Owner page: sign in, manage the menu, handle bookings.
(function () {
  var S = window.SITE, A = window.API, el = A.el, $ = function (s) { return document.querySelector(s); };
  var KEY = 'rest_admin_session', session = null, menu = [], bookings = [];
  $('#brand').textContent = S.name + ' - Admin';

  // ---- session (kept only while this browser tab is open) ----
  function save(s) { session = s; try { sessionStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  function load() { try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function done(d) { return { access: d.access_token, refresh: d.refresh_token, expires: Date.now() + (d.expires_in || 3600) * 1000 - 30000, email: d.user && d.user.email }; }
  async function token() {
    if (!session) throw new Error('signed out');
    if (Date.now() > session.expires) { try { save(Object.assign(done(await A.auth('token?grant_type=refresh_token', { refresh_token: session.refresh })), {})); } catch (e) { signOut(); throw e; } }
    return session.access;
  }
  async function db(method, path, body, prefer) {
    try { return await A.rest(method, path, body, await token(), prefer); }
    catch (e) { if (e.status === 401) { signOut(); } throw e; }
  }
  function show(on) { $('#login-box').hidden = on; $('#app').hidden = !on; $('#out').hidden = !on; $('#who').textContent = on && session ? session.email || '' : ''; }
  function signOut() { session = null; try { sessionStorage.removeItem(KEY); } catch (e) {} show(false); }
  function say(t, ok) { var m = $('#msg'); m.textContent = t; m.className = 'msg ' + (ok ? 'ok' : 'bad'); m.hidden = false; clearTimeout(say.t); say.t = setTimeout(function () { m.hidden = true; }, 4000); }

  $('#login').onsubmit = async function (e) {
    e.preventDefault(); var m = $('#login-msg'); m.hidden = true;
    if (!A.ready()) { m.textContent = 'Finish the setup first: put your Supabase URL and anon key in site/js/config.js.'; m.hidden = false; return; }
    try { var d = await A.auth('token?grant_type=password', { email: this.email.value.trim(), password: this.password.value }); save(done(d)); this.password.value = ''; start(); }
    catch (err) { m.textContent = err.status === 400 ? 'Wrong email or password.' : 'Could not sign in: ' + err.message; m.hidden = false; }
  };
  $('#out').onclick = signOut;

  // ---- tabs ----
  $('#tabs').onclick = function (e) { var b = e.target.closest('button'); if (!b) return; $$('#tabs .chip').forEach(function (x) { x.classList.toggle('on', x === b); }); $('#res').hidden = b.dataset.t !== 'res'; $('#menu').hidden = b.dataset.t !== 'menu'; };
  function $$(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }

  // ---- bookings ----
  var today = function () { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); };
  async function loadBookings() {
    bookings = await db('GET', 'reservations?select=*&order=reserve_date.asc,reserve_time.asc&limit=1000');
    var n = bookings.filter(function (b) { return b.status === 'new' && b.reserve_date >= today(); }).length, c = $('#newcount'); c.textContent = n; c.hidden = !n; drawBookings();
  }
  function drawBookings() {
    var f = $('#rf').value, t = today(), rows = bookings.filter(function (b) { return f === 'all' ? true : f === 'new' ? b.status === 'new' : (b.reserve_date >= t && b.status !== 'cancelled'); });
    var body = $('#rt tbody'); body.textContent = ''; $('#rcount').textContent = rows.length + (rows.length === 1 ? ' booking' : ' bookings');
    if (!rows.length) body.appendChild(el('tr', {}, [el('td', { colspan: 7, class: 'muted', text: 'No bookings here.' })]));
    rows.forEach(function (b) {
      var act = el('td', { class: 'actions' });
      if (b.status !== 'confirmed') act.appendChild(btn('Confirm', function () { setStatus(b, 'confirmed'); }, 'primary'));
      if (b.status !== 'cancelled') act.appendChild(btn('Cancel', function () { setStatus(b, 'cancelled'); }));
      act.appendChild(btn('Delete', function () { if (confirm('Delete this booking for ' + b.name + '?')) db('DELETE', 'reservations?id=eq.' + b.id, undefined, 'return=minimal').then(loadBookings).catch(fail); }, 'danger'));
      body.appendChild(el('tr', {}, [el('td', { text: b.reserve_date + ' ' + String(b.reserve_time).slice(0, 5) }), el('td', { text: b.name }), el('td', {}, [el('a', { href: 'tel:' + b.phone.replace(/[^\d+]/g, ''), text: b.phone })]), el('td', { text: String(b.guests) }), el('td', { text: b.notes || '' }), el('td', {}, [el('span', { class: 'pill ' + b.status, text: b.status === 'new' ? 'waiting' : b.status })]), act]));
    });
  }
  function btn(text, fn, cls) { var b = el('button', { type: 'button', class: 'btn small ' + (cls || ''), text: text }); b.onclick = fn; b.style.marginLeft = '6px'; return b; }
  function fail(e) { say('Could not save: ' + e.message, false); }
  function setStatus(b, st) { db('PATCH', 'reservations?id=eq.' + b.id, { status: st }, 'return=minimal').then(function () { say('Booking ' + st + '.', true); return loadBookings(); }).catch(fail); }
  $('#rf').onchange = drawBookings;

  // ---- menu ----
  async function loadMenu() { menu = await db('GET', 'menu_items?select=*&order=category.asc,sort_order.asc,name.asc'); drawMenu(); }
  function drawMenu() {
    var body = $('#mt tbody'); body.textContent = ''; var cats = {};
    if (!menu.length) body.appendChild(el('tr', {}, [el('td', { colspan: 5, class: 'muted', text: 'No dishes yet. Press "Add a dish".' })]));
    menu.forEach(function (i) {
      cats[i.category] = 1; var act = el('td', { class: 'actions' });
      act.appendChild(btn(i.available ? 'Switch off' : 'Switch on', function () { db('PATCH', 'menu_items?id=eq.' + i.id, { available: !i.available }, 'return=minimal').then(loadMenu).catch(fail); }));
      act.appendChild(btn('Edit', function () { edit(i); }));
      act.appendChild(btn('Delete', function () { if (confirm('Delete "' + i.name + '" from the menu?')) db('DELETE', 'menu_items?id=eq.' + i.id, undefined, 'return=minimal').then(function () { say('Deleted.', true); return loadMenu(); }).catch(fail); }, 'danger'));
      var tr = el('tr', i.available ? {} : { class: 'off' }, [el('td', {}, [el('strong', { text: i.name }), el('div', { class: 'muted', text: i.description || '' })]), el('td', { text: i.category }), el('td', { text: A.money(i.price) }), el('td', { text: i.available ? 'Yes' : 'No (hidden)' }), act]);
      body.appendChild(tr);
    });
    var dl = $('#cats'); dl.textContent = ''; Object.keys(cats).forEach(function (c) { dl.appendChild(el('option', { value: c })); });
  }
  var editing = null, dlg = $('#dlg'), df = $('#df');
  function edit(i) {
    editing = i || null; $('#dt').textContent = i ? 'Edit dish' : 'Add a dish'; $('#dmsg').hidden = true; df.reset();
    df.name.value = i ? i.name : ''; df.category.value = i ? i.category : ''; df.description.value = i ? i.description : ''; df.price.value = i ? i.price : ''; df.sort_order.value = i ? i.sort_order : 0; df.image_url.value = i && i.image_url ? i.image_url : ''; df.available.checked = i ? !!i.available : true;
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  }
  $('#add').onclick = function () { edit(null); };
  $('#save').onclick = async function (e) {
    e.preventDefault(); var m = $('#dmsg'); m.hidden = true;
    var row = { name: df.name.value.trim(), category: df.category.value.trim(), description: df.description.value.trim(), price: Number(df.price.value), sort_order: Math.round(Number(df.sort_order.value) || 0), image_url: df.image_url.value.trim() || null, available: df.available.checked };
    if (!row.name || !row.category) { m.textContent = 'Write the dish name and its category.'; m.hidden = false; return; }
    if (!(row.price >= 0) || df.price.value === '') { m.textContent = 'Write the price as a number.'; m.hidden = false; return; }
    try { if (editing) await db('PATCH', 'menu_items?id=eq.' + editing.id, row, 'return=minimal'); else await db('POST', 'menu_items', row, 'return=minimal'); dlg.close(); say('Saved.', true); await loadMenu(); }
    catch (err) { m.textContent = 'Could not save: ' + err.message; m.hidden = false; }
  };

  async function start() { show(true); try { await Promise.all([loadBookings(), loadMenu()]); } catch (e) { if (session) say('Could not load: ' + e.message, false); } }
  session = load(); if (session) start(); else show(false);
})();
