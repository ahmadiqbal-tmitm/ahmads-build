// Build 52 email gate (used on ahmads.build and chiefofstaff.ahmads.build).
// - Links marked data-gate="agent" ask for an email before they open or download.
// - A block marked data-gate="post" or data-gate="tutorial" stays hidden behind an email box.
// One sign-up unlocks everything on that site (remembered in this browser).
// Emails go to a Google Apps Script that can only add a row to the sign-ups sheet:
// Email | Page | Type (agent → Install agent, post → Writing access, tutorial → Tutorial for agent) | Date.
(function () {
  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbzGXS4eLlF65wU0vFgZcFcbM7FIiCT4V6RxBlN2oHfF7bhkUF7hCzXIoBeVejECRQXD/exec'; // Google Apps Script web app URL (write-only: it can add a row, nothing else)
  var KEY = 'b52-unlocked';
  var PRIVACY = 'https://ahmads.build/privacy/';

  function isUnlocked() { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } }
  function remember() { try { localStorage.setItem(KEY, '1'); } catch (e) {} }
  function isLocal() { return /^(localhost|127\.0\.0\.1)$/.test(location.hostname); }

  function send(email, source) {
    // Previews on this computer never send, so tests don't land in the sheet.
    if (isLocal()) return Promise.resolve();
    if (!ENDPOINT) return Promise.reject(new Error('not connected'));
    var body = new URLSearchParams({ email: email, source: source, page: location.origin + location.pathname });
    // Apps Script doesn't send CORS headers, so the reply can't be read; a network failure still rejects.
    return fetch(ENDPOINT, { method: 'POST', mode: 'no-cors', body: body });
  }

  var uid = 0;
  function buildForm(opts) {
    var id = 'gate-email-' + (++uid);
    var form = document.createElement('form');
    form.className = 'gate-form';
    form.noValidate = true;
    form.innerHTML =
      '<label for="' + id + '">Email</label>' +
      '<div class="gate-row">' +
        '<input id="' + id + '" name="email" type="email" autocomplete="email" inputmode="email" required aria-describedby="' + id + '-help ' + id + '-error">' +
        '<button type="submit" class="btn btn-primary">' + opts.button + '</button>' +
      '</div>' +
      '<div class="gate-trap" aria-hidden="true"><label>Website <input name="website" tabindex="-1" autocomplete="off"></label></div>' +
      '<p class="gate-error" id="' + id + '-error" role="alert"></p>' +
      '<p class="caption gate-help" id="' + id + '-help">We\'ll only use it to send you new agents and posts. Ask to be removed any time. <a href="' + PRIVACY + '">Privacy note</a></p>';

    var input = form.querySelector('input[name="email"]');
    var error = form.querySelector('.gate-error');
    var button = form.querySelector('button');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      error.textContent = '';
      input.removeAttribute('aria-invalid');
      var email = input.value.trim();
      if (!email || !input.checkValidity()) {
        error.textContent = 'Error: enter a valid email address, like name@example.com.';
        input.setAttribute('aria-invalid', 'true');
        input.focus();
        return;
      }
      if (form.website.value) { remember(); opts.onDone(); return; } // bot: skip quietly
      button.disabled = true;
      button.textContent = 'Sending…';
      send(email, opts.source).then(function () {
        remember();
        opts.onDone();
      }, function () {
        button.disabled = false;
        button.textContent = opts.button;
        error.textContent = 'Error: that didn\'t go through. Check your connection and try again.';
      });
    });
    return form;
  }

  // Agent links: Install / Download the skill
  var dialog = null, pending = null;
  function openDialog(link) {
    pending = link;
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.className = 'gate-dialog';
      dialog.setAttribute('aria-labelledby', 'gate-dialog-title');
      dialog.innerHTML =
        '<button type="button" class="gate-close" aria-label="Close">' +
          '<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M4 4l12 12M16 4L4 16" stroke="currentColor" stroke-width="2" fill="none"/></svg>' +
        '</button>' +
        '<p class="eyebrow">Free · No code</p>' +
        '<h2 id="gate-dialog-title" class="h3">Get the agent</h2>' +
        '<p class="gate-lead">Enter your email and you\'re in. This unlocks every agent and post on the site.</p>';
      dialog.appendChild(buildForm({
        source: 'agent',
        button: 'Get the agent',
        onDone: function () {
          dialog.close();
          var link = pending; pending = null;
          if (!link) return;
          if (link.hasAttribute('download')) link.click(); else location.href = link.href;
        }
      }));
      dialog.querySelector('.gate-close').addEventListener('click', function () { dialog.close(); });
      dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); }); // click outside
      document.body.appendChild(dialog);
    }
    dialog.showModal();
    dialog.querySelector('input[name="email"]').focus();
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('a[data-gate="agent"]');
    if (!link || isUnlocked()) return;
    e.preventDefault();
    openDialog(link);
  });

  // Posts and tutorials: show the opening, hide the rest behind the box
  var BLOCKS = {
    post: { text: 'Enter your email to read the rest of this post. It also unlocks every agent on the site.', button: 'Read the rest' },
    tutorial: { text: 'Enter your email to see the full tutorial, step by step, with every prompt to copy.', button: 'Show the tutorial' }
  };
  document.querySelectorAll('[data-gate="post"], [data-gate="tutorial"]').forEach(function (rest) {
    if (isUnlocked()) return;
    var kind = rest.getAttribute('data-gate'), copy = BLOCKS[kind];
    rest.hidden = true;
    var box = document.createElement('section');
    box.className = 'card gate-card';
    box.setAttribute('aria-labelledby', 'gate-post-title');
    box.innerHTML =
      '<h2 id="gate-post-title" class="h3">Keep reading</h2>' +
      '<p>' + copy.text + '</p>';
    box.appendChild(buildForm({
      source: kind,
      button: copy.button,
      onDone: function () {
        rest.hidden = false;
        box.remove();
        var first = rest.querySelector('p, h2, h3');
        if (first) { first.setAttribute('tabindex', '-1'); first.focus(); }
      }
    }));
    rest.parentNode.insertBefore(box, rest);
  });
})();
