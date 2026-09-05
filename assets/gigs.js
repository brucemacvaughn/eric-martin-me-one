/* =========================================================================
 * Upcoming dates — Eric Martin / Me One
 *
 * ┌─ HOW TO ADD OR EDIT A DATE ─────────────────────────────────────────┐
 * │                                                                    │
 * │ 1. Add a new line to the GIGS list below, copying the format of    │
 * │    an existing line.                                               │
 * │ 2. Use the date format YYYY-MM-DD                                  │
 * │    e.g.  "2026-11-17"  for 17 Nov 2026                             │
 * │ 3. Don't worry about removing past dates — they automatically      │
 * │    disappear from the website the day after they pass.             │
 * │ 4. Order doesn't matter — they auto-sort by date.                  │
 * │ 5. Save the file. Mac will redeploy and the site updates.          │
 * │                                                                    │
 * │ EACH ENTRY NEEDS FOUR FIELDS:                                      │
 * │   date     — "2026-11-17"           ISO date, YYYY-MM-DD           │
 * │   name     — "Haddaway & Friends"   show / event name              │
 * │   location — "Oberhausen, Germany"  city, country                  │
 * │   role     — "DJ — Technotronic Set"                               │
 * │                                                                    │
 * └────────────────────────────────────────────────────────────────────┘
 * ======================================================================= */

(function () {
  const GIGS = [
    { date: "2026-08-30", name: "Love The 90s Open Air",    location: "Bristol, UK",            role: "DJ — Technotronic Set" },
    { date: "2026-10-01", name: "D! Club",            location: "Lausanne, Switzerland",  role: "DJ — Technotronic Set" },
    { date: "2026-10-10", name: "Sandy Glade",        location: "Brean, UK",              role: "DJ — Technotronic Set" },
    { date: "2026-10-24", name: "Dance Now", location: "Asunci\u00f3n, Paraguay",    role: "DJ — Technotronic Set" },
    { date: "2026-10-30", name: "Dance Now",     location: "Cali, Colombia",         role: "DJ — Technotronic Set" },
    { date: "2026-10-31", name: "Dance Now", location: "Medell\u00edn, Colombia",    role: "DJ — Technotronic Set" },
    { date: "2026-11-01", name: "Dance Now", location: "Bogot\u00e1, Colombia",      role: "DJ — Technotronic Set" },
    { date: "2026-11-17", name: "Haddaway & Friends", location: "Oberhausen, Germany",    role: "DJ — Technotronic Set" },
    { date: "2026-11-18", name: "Haddaway & Friends", location: "Hamburg, Germany",       role: "DJ — Technotronic Set" },
    { date: "2026-11-19", name: "Haddaway & Friends", location: "Frankfurt, Germany",     role: "DJ — Technotronic Set" },
    { date: "2027-05-01", name: "Love The 90s Open Air", location: "Derby, UK",              role: "DJ — Technotronic Set" },
    { date: "2027-06-04", name: "Love The 90s Open Air", location: "Nottingham, UK",         role: "DJ — Technotronic Set" },
    { date: "2027-07-03", name: "Event TBA", location: "Olen, Belgium",          role: "DJ — Technotronic Set" },
    { date: "2027-07-10", name: "Love The 90s Open Air", location: "Leeds, UK",              role: "DJ — Technotronic Set" },
    { date: "2027-08-19", name: "Event TBA", location: "Zr\u0107e Beach, Croatia",   role: "DJ — Technotronic Set" },
    { date: "2027-08-22", name: "Love The 90s Open Air", location: "Sunderland, UK",         role: "DJ — Technotronic Set" },
  ];

  // -- nothing below needs editing to add a date -------------------------

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c =>
      ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  }

  function parseDate(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const list = document.getElementById('gigs-list');
    if (!list) return;

    // Local midnight today — anything BEFORE this disappears.
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const upcoming = GIGS
      .filter(g => parseDate(g.date) >= today)
      .sort((a, b) => (a.date < b.date ? -1 : 1));

    const rowsHtml = upcoming.map(g => {
      const d = parseDate(g.date);
      const mo = MONTHS[d.getMonth()];
      const day = d.getDate();
      const yr = d.getFullYear() !== today.getFullYear()
        ? `<span class="gigs__yr">${d.getFullYear()}</span>` : '';
      return `
        <li class="gigs__row">
          <div class="gigs__date"><span class="gigs__mo">${mo}</span><span class="gigs__day">${day}</span>${yr}</div>
          <div class="gigs__name">${escape(g.name)}</div>
          <div class="gigs__loc">${escape(g.location)}</div>
          <div class="gigs__role">${escape(g.role)}</div>
        </li>`;
    }).join('');

    // "Your event next" CTA always sits at the bottom of the list.
    const ctaHtml = `
      <li class="gigs__row gigs__row--cta">
        <div class="gigs__date"><span class="gigs__mo">+</span></div>
        <div class="gigs__name">Your event next.</div>
        <div class="gigs__loc">Clubs, festivals, brands, private.</div>
        <div class="gigs__role"><a href="contact.html#booking" class="card__link">Inquire <span class="arrow"></span></a></div>
      </li>`;

    list.innerHTML = rowsHtml + ctaHtml;
  });
})();
