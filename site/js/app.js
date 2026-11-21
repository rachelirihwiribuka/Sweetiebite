// Public website: menu, booking form, contact details.
(function () {
  var S = window.SITE, A = window.API, el = A.el, $ = function (s) { return document.querySelector(s); };

  // ---- fill in the details from config.js ----
  document.title = S.name + ' - Restaurant';
  $('#brand').textContent = S.name; $('#foot-name').textContent = S.name;
  $('#tagline').textContent = S.tagline; $('#about').textContent = S.about;
  $('#addr').textContent = S.address; $('#map').href = S.mapLink || '#'; if (!S.mapLink) $('#map').hidden = true;
  $('#tel').textContent = S.phone; $('#tel').href = 'tel:' + S.phone.replace(/[^\d+]/g, '');
  $('#mail').textContent = S.email; $('#mail').href = 'mailto:' + S.email;
  $('#year').textContent = new Date().getFullYear();
  S.hours.forEach(function (h) { $('#hours').appendChild(el('tr', {}, [el('td', { text: h[0] }), el('td', { text: h[1] })])); });
  if (S.whatsapp) { var w = $('#wa'); w.href = 'https://wa.me/' + S.whatsapp + '?text=' + encodeURIComponent('Hello ' + S.name + ', '); w.hidden = false; }
  $('#call').href = $('#tel').href;

  // ---- menu ----
  var items = [], cat = 'All';
  function drawMenu() {
    var box = $('#menu-list'); box.textContent = '';
    var show = items.filter(function (i) { return cat === 'All' || i.category === cat; });
    if (!show.length) { box.appendChild(el('p', { class: 'muted', text: 'Nothing here yet.' })); return; }
    show.forEach(function (i) {
      var card = el('article', { class: 'dish' });
      if (i.image_url) { var im = el('img', { src: i.image_url, alt: i.name, loading: 'lazy' }); im.onerror = function () { im.remove(); }; card.appendChild(im); }
      card.appendChild(el('div', { class: 'dish-body' }, [el('div', { class: 'dish-top' }, [el('h3', { text: i.name }), el('span', { class: 'price', text: A.money(i.price) })]), el('p', { text: i.description || '' }), el('span', { class: 'tag', text: i.category })]));
      box.appendChild(card);
    });
  }
  function drawTabs() {
    var cats = ['All']; items.forEach(function (i) { if (cats.indexOf(i.category) < 0) cats.push(i.category); });
    var t = $('#tabs'); t.textContent = '';
    cats.forEach(function (c) { var b = el('button', { type: 'button', class: 'chip' + (c === cat ? ' on' : ''), text: c }); b.onclick = function () { cat = c; drawTabs(); drawMenu(); }; t.appendChild(b); });
  }
  async function loadMenu() {
    var box = $('#menu-list');
    if (!A.ready()) { box.textContent = ''; box.appendChild(el('p', { class: 'note', text: 'Almost ready: open site/js/config.js and paste your Supabase URL and anon key.' })); return; }
    try { items = await A.rest('GET', 'menu_items?select=*&available=eq.true&order=category.asc,sort_order.asc,name.asc'); drawTabs(); drawMenu(); }
    catch (e) { box.textContent = ''; box.appendChild(el('p', { class: 'note', text: 'The menu could not be loaded right now. Please call us on ' + S.phone + '.' })); }
  }

  // ---- booking ----
  var f = $('#book'), msg = $('#book-msg'), pad = function (n) { return ('0' + n).slice(-2); }, iso = function (x) { return x.getFullYear() + '-' + pad(x.getMonth() + 1) + '-' + pad(x.getDate()); };
  (function setup() {
    var d = new Date(); f.date.min = iso(d); f.date.max = iso(new Date(d.getTime() + 180 * 864e5));
    var from = S.bookingFrom.split(':').map(Number), to = S.bookingTo.split(':').map(Number);
    for (var m = from[0] * 60 + from[1]; m <= to[0] * 60 + to[1]; m += 30) { var v = pad(Math.floor(m / 60)) + ':' + pad(m % 60); f.time.appendChild(el('option', { value: v, text: v })); }
    for (var g = 1; g <= S.maxGuests; g++) f.guests.appendChild(el('option', { value: g, text: g + (g === 1 ? ' guest' : ' guests') }));
  })();
  function defaults() { f.date.value = iso(new Date()); f.guests.value = '2'; var has = Array.prototype.some.call(f.time.options, function (o) { return o.value === '19:00'; }); f.time.value = has ? '19:00' : f.time.options[0].value; }
  defaults();
  function say(text, ok) { msg.textContent = text; msg.className = 'msg ' + (ok ? 'ok' : 'bad'); msg.hidden = false; }
  f.onsubmit = async function (ev) {
    ev.preventDefault(); msg.hidden = true;
    if (f.website.value) return say('Thank you! We will call you to confirm.', true);   // hidden field: only robots fill it in
    var name = f.name.value.trim(), phone = f.phone.value.trim();
    if (!name) return say('Please write your name.', false);
    if (phone.replace(/\D/g, '').length < 7) return say('Please write a phone number we can call.', false);
    if (f.date.value < f.date.min) return say('Please choose today or a later date.', false);
    if (!A.ready()) return say('Booking is not switched on yet (the site owner must finish the Supabase setup).', false);
    var btn = f.querySelector('button[type=submit]'); btn.disabled = true;
    try {
      await A.rest('POST', 'reservations', { name: name, phone: phone, guests: Number(f.guests.value), reserve_date: f.date.value, reserve_time: f.time.value, notes: f.notes.value.trim() }, undefined, 'return=minimal');
      f.reset(); defaults(); say('Thank you ' + name + '! We received your booking request and will call you to confirm.', true);
    } catch (e) { say('Sorry, we could not send your booking. Please call us on ' + S.phone + '.', false); }
    btn.disabled = false;
  };

  loadMenu();
})();
