/* =========================================================================
 * ERIC MARTIN / ME ONE — shared UI behavior
 *   - Renders site header + footer into placeholder slots.
 *   - Real form submission (Formspree-compatible) with proper UI states.
 *   - Newsletter hook supports Formspree OR a Flodesk embed swap.
 *
 * TO ACTIVATE FORMS (one-time, takes ~5 min):
 *   1. Make a free Formspree account → https://formspree.io/forms
 *   2. Create one form per channel below and paste the endpoint URL
 *      (looks like https://formspree.io/f/abcd1234) into FORM_ENDPOINTS.
 *   3. For newsletter via Flodesk: leave its endpoint blank and set
 *      NEWSLETTER_PROVIDER to "flodesk" — then drop your Flodesk hosted-form
 *      URL into FLODESK_FORM_URL (we'll open it in a lightweight overlay).
 *   4. Redeploy. No other changes needed.
 *
 * Until endpoints are pasted, forms degrade to a friendly inline message
 * directing visitors to bookings@ericmartinmusic.com — so nothing breaks.
 * ======================================================================= */

(() => {
  // -------- CONFIG ----------------------------------------------------------
  const FORM_ENDPOINTS = {
    booking:    "https://formsubmit.co/ajax/Eric@ericmartinmusic.com", // delivers booking requests to Eric (needs one-time activation click)
    production: "https://formsubmit.co/ajax/Eric@ericmartinmusic.com", // production/remix inquiries → Eric (same FormSubmit activation as booking)
    demo:       "https://formsubmit.co/ajax/Eric@ericmartinmusic.com", // Musicated demo submissions → Eric
    newsletter: "https://formsubmit.co/ajax/Eric@ericmartinmusic.com", // mailing-list signups → Eric (basic capture; swap to Mailchimp/Flodesk/Beehiiv later for proper list management)
  };

  const NEWSLETTER_PROVIDER = "formspree"; // "formspree" | "flodesk"
  const FLODESK_FORM_URL    = "";          // e.g. https://app.flodesk.com/forms/...

  const FALLBACK_EMAIL = "bookings@ericmartinmusic.com";
  // --------------------------------------------------------------------------

  const PAGES = [
    { href: 'index.html', label: 'Home',    key: 'home' },
    { href: 'music.html', label: 'Music',   key: 'music' },
    { href: 'press.html', label: 'Press',   key: 'press' },
    { href: 'about.html', label: 'About',   key: 'about' },
    { href: 'contact.html', label: 'Contact', key: 'contact' },
  ];

  function header(active){
    const links = PAGES.map(p =>
      `<a href="${p.href}"${p.key===active?' aria-current="page"':''}>${p.label}</a>`
    ).join('');
    return `
      <header class="site-header">
        <div class="site-header__inner">
          <a href="index.html" class="brand" aria-label="Eric Martin · Me One — Home">
            <span class="dot" aria-hidden="true"></span>
            <span><b>Eric Martin</b> · Me One</span>
          </a>
          <button class="nav__toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="primary-nav">
            <span></span><span></span><span></span>
          </button>
          <nav class="nav" id="primary-nav" aria-label="Primary">
            ${links}
            <a href="contact.html#booking" class="cta">Book the DJ Set</a>
          </nav>
        </div>
      </header>
    `;
  }

  function footer(){
    const year = new Date().getFullYear();
    return `
      <footer class="site-footer">
        <div class="site-footer__inner">
          <div>
            <a href="index.html" class="brand" style="margin-bottom:14px">
              <span class="dot" aria-hidden="true"></span>
              <span><b>Eric Martin</b> · Me One</span>
            </a>
            <p class="muted" style="max-width:340px;margin-top:14px">UK-based musician, songwriter, music producer and DJ. A founding member of Technotronic and owner of Musicated Records.</p>
          </div>
          <div>
            <h5>Site</h5>
            <ul>
              <li><a href="index.html">Home</a></li>
              <li><a href="music.html">Music</a></li>
              <li><a href="press.html">Press / EPK</a></li>
              <li><a href="about.html">About</a></li>
              <li><a href="contact.html">Contact</a></li>
            </ul>
          </div>
          <div>
            <h5>Listen</h5>
            <ul>
              <li><a href="https://meone.bandcamp.com" target="_blank" rel="noopener">Bandcamp · Me One</a></li>
              <li><a href="https://www.beatport.com/artist/eric-martin/34907" target="_blank" rel="noopener">Beatport</a></li>
              <li><a href="https://www.youtube.com/channel/UCZgfJ7ZeAhPUknXXtB20-mw" target="_blank" rel="noopener">YouTube</a></li>
              <li><a href="https://musicatedrecords.com" target="_blank" rel="noopener">Musicated Records</a></li>
            </ul>
          </div>
          <div>
            <h5>Connect</h5>
            <ul>
              <li><a href="https://www.instagram.com/iamericmartin/" target="_blank" rel="noopener">Instagram</a></li>
              <li><a href="https://www.facebook.com/ericmartindjs/" target="_blank" rel="noopener">Facebook</a></li>
              <li><a href="https://www.linkedin.com/in/ericmartinmusic/" target="_blank" rel="noopener">LinkedIn</a></li>
              <li><a href="contact.html">Email</a></li>
            </ul>
          </div>
        </div>
        <div class="site-footer__legal">
          <span>© ${year} Eric Martin · Musicated Records</span>
          <span>London / Worldwide</span>
        </div>
      </footer>
    `;
  }

  // ---------- FORMS ---------------------------------------------------------

  function setNote(form, text, kind){
    const note = form.querySelector('[data-form-note]');
    if (!note) return;
    note.textContent = text;
    note.dataset.kind = kind || '';
    note.style.color =
      kind === 'success' ? 'var(--teal)'
      : kind === 'error' ? '#ff7a7a'
      : '';
  }

  function setLoading(form, loading){
    const btn = form.querySelector('button[type="submit"]');
    if (!btn) return;
    if (loading) {
      btn.dataset.originalText = btn.dataset.originalText || btn.innerHTML;
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');
      btn.innerHTML = 'Sending…';
    } else {
      btn.disabled = false;
      btn.removeAttribute('aria-busy');
      if (btn.dataset.originalText) btn.innerHTML = btn.dataset.originalText;
    }
  }

  async function submitForm(form){
    const channel  = form.dataset.formName || 'general';
    const endpoint = FORM_ENDPOINTS[channel] || '';
    const fd = new FormData(form);

    // No endpoint configured yet — graceful fallback.
    if (!endpoint) {
      setNote(form,
        `Form delivery isn't wired yet — please email ${FALLBACK_EMAIL} directly and Eric will be in touch.`,
        'error');
      return;
    }

    setLoading(form, true);
    setNote(form, 'Sending…', '');

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: fd,
        headers: { 'Accept': 'application/json' },
      });

      if (res.ok) {
        setNote(form, "✓ Thanks — we'll be in touch.", 'success');
        form.reset();
      } else {
        const data = await res.json().catch(() => ({}));
        const msg = (data && data.errors && data.errors.map(e => e.message).join(', '))
                    || 'Something went wrong sending that. Please try again or email ' + FALLBACK_EMAIL + '.';
        setNote(form, msg, 'error');
      }
    } catch (err) {
      setNote(form,
        `Network error — please try again or email ${FALLBACK_EMAIL} directly.`,
        'error');
    } finally {
      setLoading(form, false);
    }
  }

  function wireForms(){
    document.querySelectorAll('form[data-form]').forEach(form => {
      // Newsletter via Flodesk → open Flodesk hosted form in a new tab.
      const channel = form.dataset.formName || 'general';
      if (channel === 'newsletter'
          && NEWSLETTER_PROVIDER === 'flodesk'
          && FLODESK_FORM_URL) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const email = form.querySelector('input[type="email"]')?.value || '';
          const url = FLODESK_FORM_URL +
            (FLODESK_FORM_URL.includes('?') ? '&' : '?') +
            'email=' + encodeURIComponent(email);
          window.open(url, '_blank', 'noopener');
          setNote(form, 'Opening sign-up — finish in the new tab.', 'success');
        });
        return;
      }

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        submitForm(form);
      });
    });
  }

  // ---------- BOOT ----------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    const active   = document.body.dataset.page || '';
    const headSlot = document.querySelector('[data-slot="header"]');
    const footSlot = document.querySelector('[data-slot="footer"]');
    if (headSlot) headSlot.outerHTML = header(active);
    if (footSlot) footSlot.outerHTML = footer();

    wireForms();
    wireCoverColor();
    wireNav();
  });

  // Mobile hamburger: toggle the nav dropdown; close it when a link is tapped
  function wireNav(){
    const toggle = document.querySelector('.nav__toggle');
    const nav = document.getElementById('primary-nav');
    if (!toggle || !nav) return;
    const close = () => { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded','false'); toggle.setAttribute('aria-label','Open menu'); };
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  // Tap/click a release cover to toggle full colour (desktop also gets it on hover via CSS)
  function wireCoverColor(){
    document.querySelectorAll('.release-card__cover').forEach(cover => {
      cover.addEventListener('click', () => cover.classList.toggle('is-color'));
    });
  }
})();
