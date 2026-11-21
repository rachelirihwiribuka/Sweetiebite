// Tiny helper for talking to Supabase with plain fetch (no libraries needed).
(function () {
  var S = window.SITE;
  function ready() { return S && S.supabaseUrl && S.supabaseUrl.indexOf('YOUR-PROJECT') < 0 && S.supabaseAnonKey && S.supabaseAnonKey.indexOf('YOUR-ANON') < 0; }
  function headers(token, extra) {
    var h = { apikey: S.supabaseAnonKey, Authorization: 'Bearer ' + (token || S.supabaseAnonKey), 'Content-Type': 'application/json' };
    for (var k in (extra || {})) h[k] = extra[k];
    return h;
  }
  /** path example: 'menu_items?select=*&order=sort_order'. Returns parsed JSON (or null when there is no body). */
  async function rest(method, path, body, token, prefer) {
    var res = await fetch(S.supabaseUrl + '/rest/v1/' + path, { method: method, headers: headers(token, prefer ? { Prefer: prefer } : null), body: body === undefined ? undefined : JSON.stringify(body) });
    var text = await res.text(), data = null; try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
    if (!res.ok) { var err = new Error((data && (data.message || data.error_description || data.msg)) || ('Request failed (' + res.status + ')')); err.status = res.status; throw err; }
    return data;
  }
  async function auth(path, body) {
    var res = await fetch(S.supabaseUrl + '/auth/v1/' + path, { method: 'POST', headers: headers(null), body: JSON.stringify(body) });
    var data = await res.json().catch(function () { return {}; });
    if (!res.ok) { var err = new Error(data.error_description || data.msg || data.message || 'Sign-in failed'); err.status = res.status; throw err; }
    return data;
  }
  function money(n) { return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number(n) || 0) + ' ' + (S.currency || ''); }
  function el(tag, attrs, kids) {
    var e = document.createElement(tag); for (var k in (attrs || {})) { if (k === 'text') e.textContent = attrs[k]; else if (k === 'class') e.className = attrs[k]; else e.setAttribute(k, attrs[k]); }
    (kids || []).forEach(function (c) { e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); }); return e;
  }
  window.API = { ready: ready, rest: rest, auth: auth, money: money, el: el };
})();
