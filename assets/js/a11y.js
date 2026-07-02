/* Job Power — תפריט נגישות עצמאי (ת"י 5568 / WCAG 2.1 AA).
   קובץ יחיד: מזריק עיצוב, כפתור צף, תפריט והצהרת נגישות. שומר ב-localStorage.
   נטען לפני main.js כדי ש"עצירת אנימציות" תיתפס שם דרך המחלקה על <html>. */
(function () {
  var KEY = 'jp-a11y';
  var s = {};
  try { s = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}
  var root = document.documentElement;

  var FLAGS = { contrast: 'jpa-contrast', links: 'jpa-links', font: 'jpa-font', motion: 'jpa-motion' };
  function apply() {
    for (var k in FLAGS) root.classList.toggle(FLAGS[k], !!s[k]);
    root.style.fontSize = s.fs ? (100 + s.fs * 12.5) + '%' : '';
  }
  apply(); // מיידי, לפני main.js

  var css = [
    ':where(a,button,input,select,textarea,[tabindex]):focus-visible{outline:3px solid #1f6feb!important;outline-offset:2px}',
    '.jpa-links a{text-decoration:underline!important;text-underline-offset:3px}',
    '.jpa-font,.jpa-font *{font-family:Arial,"Segoe UI",sans-serif!important;letter-spacing:0!important}',
    '.jpa-motion *,.jpa-motion *::before,.jpa-motion *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}',
    '.jpa-contrast,.jpa-contrast body{background:#000!important;color:#fff!important}',
    '.jpa-contrast *:not(img):not(video):not(svg):not(path){background-color:#000!important;color:#fff!important;border-color:#fff!important;text-shadow:none!important;box-shadow:none!important}',
    '.jpa-contrast a{color:#9cc2ff!important}',
    /* widget */
    '#jpaBtn{position:fixed;bottom:18px;left:18px;z-index:99990;width:52px;height:52px;border-radius:50%;border:2px solid #fff;background:#1f6feb;color:#fff;cursor:pointer;display:grid;place-items:center;box-shadow:0 4px 14px rgba(0,0,0,.35)}',
    '#jpaBtn svg{width:28px;height:28px;fill:#fff}',
    '#jpaPanel{position:fixed;bottom:80px;left:18px;z-index:99991;width:min(86vw,300px);background:#fff;color:#111;border-radius:12px;box-shadow:0 10px 40px rgba(0,0,0,.35);padding:14px;display:none;font-family:Arial,sans-serif;font-size:15px}',
    '#jpaPanel.open{display:block}',
    '#jpaPanel h2{font-size:16px;margin:0 0 10px}',
    '#jpaPanel button{display:block;width:100%;margin:6px 0;padding:10px;border-radius:8px;border:1px solid #ccc;background:#f6f6f6;color:#111;font:inherit;text-align:right;cursor:pointer}',
    '#jpaPanel button[aria-pressed="true"]{background:#1f6feb;color:#fff;border-color:#1f6feb}',
    '#jpaPanel .jpa-fsrow{display:flex;gap:6px}',
    '#jpaPanel .jpa-fsrow button{width:auto;flex:1;text-align:center}',
    '#jpaStatement{position:fixed;inset:0;z-index:99992;background:rgba(0,0,0,.6);display:none;align-items:center;justify-content:center;padding:16px}',
    '#jpaStatement.open{display:flex}',
    '#jpaStatement .jpa-box{background:#fff;color:#111;max-width:560px;max-height:80vh;overflow:auto;border-radius:12px;padding:22px;font-family:Arial,sans-serif;font-size:15px;line-height:1.7}',
    '.jpa-skip{position:fixed;top:8px;right:50%;transform:translate(50%,-300%);z-index:99993;background:#1f6feb;color:#fff;padding:10px 18px;border-radius:999px;font-family:Arial,sans-serif}',
    '.jpa-skip:focus{transform:translate(50%,0)}'
  ].join('');
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  function el(html) { var d = document.createElement('div'); d.innerHTML = html; return d.firstChild; }

  document.addEventListener('DOMContentLoaded', function () {
    var main = document.querySelector('main, section, .hero');
    if (main && !main.id) main.id = 'jpa-main';
    if (main) document.body.insertBefore(el('<a class="jpa-skip" href="#' + main.id + '">דילוג לתוכן</a>'), document.body.firstChild);

    var btn = el('<button id="jpaBtn" type="button" aria-label="תפריט נגישות" aria-expanded="false" aria-controls="jpaPanel"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/></svg></button>');
    var panel = el('<div id="jpaPanel" role="group" aria-label="הגדרות נגישות">' +
      '<h2>נגישות</h2>' +
      '<div class="jpa-fsrow"><button type="button" data-fs="1" aria-label="הגדלת טקסט">א+</button><button type="button" data-fs="-1" aria-label="הקטנת טקסט">א-</button></div>' +
      '<button type="button" data-k="contrast">ניגודיות גבוהה</button>' +
      '<button type="button" data-k="links">הדגשת קישורים</button>' +
      '<button type="button" data-k="font">גופן קריא</button>' +
      '<button type="button" data-k="motion">עצירת אנימציות</button>' +
      '<button type="button" data-reset>איפוס</button>' +
      '<button type="button" data-statement>הצהרת נגישות</button></div>');
    var modal = el('<div id="jpaStatement" role="dialog" aria-modal="true" aria-label="הצהרת נגישות"><div class="jpa-box">' +
      '<h2>הצהרת נגישות</h2>' +
      '<p>אתר Job Power פועל להנגשת האתר לכלל הגולשים, כולל אנשים עם מוגבלות, בהתאם לתקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע"ג 2013, לתקן הישראלי (ת"י 5568) ולהנחיות WCAG 2.1 ברמה AA.</p>' +
      '<p>באתר: תפריט נגישות (הגדלת טקסט, ניגודיות גבוהה, הדגשת קישורים, גופן קריא ועצירת אנימציות), ניווט מקלדת מלא ותמיכה בהעדפת הפחתת תנועה של מערכת ההפעלה.</p>' +
      '<p>נתקלתם בקושי? נשמח לשמוע ולתקן, ניתן לפנות אלינו דרך פרטי הקשר שבאתר.</p>' +
      '<p>עדכון אחרון: יולי 2026</p>' +
      '<button type="button" data-close style="margin-top:10px;padding:10px 18px;border-radius:8px;border:1px solid #ccc;background:#f6f6f6;cursor:pointer">סגירה</button></div></div>');
    document.body.appendChild(btn);
    document.body.appendChild(panel);
    document.body.appendChild(modal);

    function save() { localStorage.setItem(KEY, JSON.stringify(s)); }
    function sync() {
      apply();
      panel.querySelectorAll('[data-k]').forEach(function (b) { b.setAttribute('aria-pressed', String(!!s[b.dataset.k])); });
    }
    btn.addEventListener('click', function () {
      var open = !panel.classList.contains('open');
      panel.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
    panel.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.fs) { s.fs = Math.max(0, Math.min(3, (s.fs || 0) + +b.dataset.fs)); save(); sync(); }
      else if (b.dataset.k) {
        s[b.dataset.k] = !s[b.dataset.k]; save();
        if (b.dataset.k === 'motion') { location.reload(); return; }
        sync();
      }
      else if (b.hasAttribute('data-reset')) { var had = s.motion; s = {}; save(); if (had) { location.reload(); return; } sync(); }
      else if (b.hasAttribute('data-statement')) { modal.classList.add('open'); modal.querySelector('[data-close]').focus(); }
    });
    modal.addEventListener('click', function (e) {
      if (e.target === modal || e.target.closest('[data-close]')) modal.classList.remove('open');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { modal.classList.remove('open'); panel.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    });
    sync();
  });
})();
