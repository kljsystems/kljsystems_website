/* KLJ Systems — contact form.
   To receive submissions without the visitor's email app, paste a form endpoint below
   (Formspree, Basin, Getform, or your own). Leave it empty and the form opens a ready-written email instead. */
const CONTACT = {
  endpoint: '',                      // e.g. 'https://formspree.io/f/abcdwxyz'
  email: 'hello@kljsystems.com',     // where requests go
};

(() => {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const $ = (id) => document.getElementById(id);
  const area = $('form-area');
  const done = $('done');
  const send = $('send');

  /* ---------- pre-fill from links like contact.html?service=Website ---------- */
  const q = new URLSearchParams(location.search);
  const service = q.get('service');
  if (service) {
    const chip = [...form.elements.service].find((r) => r.value.toLowerCase() === service.toLowerCase());
    if (chip) chip.checked = true;
  }
  const budget = Number((q.get('budget') || '').replace(/[^0-9]/g, ''));
  if (budget) {
    const pick = budget < 500 ? 1 : budget < 1500 ? 2 : budget < 3000 ? 3 : 4;
    $('f-budget').selectedIndex = pick;
  }
  const build = q.get('build');
  if (build) {
    $('f-message').value = `I'd like a quote for this build:\n\n${build}\n\nAnything I should change?`;
    $('prefill').hidden = false;
  }

  /* ---------- validation ---------- */
  const rules = {
    name: [() => form.elements.name.value.trim().length > 1, 'Please add your name.'],
    email: [() => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.elements.email.value.trim()), 'Please add an email address we can reply to.'],
    service: [() => !!form.elements.service.value, 'Pick the closest match; "Something else" is fine.'],
    message: [() => form.elements.message.value.trim().length > 9, 'A sentence or two about what you need, please.'],
  };
  const fieldFor = (key) => (key === 'service' ? form.querySelector('.chips') : form.elements[key]);
  const check = (key) => {
    const [ok, msg] = rules[key];
    const good = ok();
    const el = fieldFor(key);
    $(`e-${key}`).textContent = good ? '' : msg;
    if (key !== 'service') el.setAttribute('aria-invalid', String(!good));
    return good;
  };
  let tried = false;
  Object.keys(rules).forEach((key) => {
    const target = key === 'service' ? form.querySelector('.chips') : form.elements[key];
    target.addEventListener(key === 'service' ? 'change' : 'blur', () => { if (tried) check(key); });
    if (key !== 'service') target.addEventListener('input', () => { if (tried && target.getAttribute('aria-invalid') === 'true') check(key); });
  });

  /* ---------- sending ---------- */
  const summary = () => {
    const f = form.elements;
    const details = [
      `Name: ${f.name.value.trim()}`,
      `Email: ${f.email.value.trim()}`,
      f.phone.value.trim() && `Phone: ${f.phone.value.trim()}`,
      `Best way to reach: ${f.reach.value}`,
      `Service: ${f.service.value}`,
      `Budget: ${f.budget.value || 'Not sure yet'}`,
      `Timing: ${f.when.value}`,
    ].filter(Boolean);
    return `${details.join('\n')}\n\n${f.message.value.trim()}`;
  };

  const finish = (text) => {
    $('done-text').textContent = text;
    area.hidden = true;
    done.hidden = false;
    done.focus();
    done.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    tried = true;
    const results = Object.keys(rules).map((key) => [key, check(key)]);
    const firstBad = results.find(([, ok]) => !ok);
    if (firstBad) {
      const el = firstBad[0] === 'service' ? form.elements.service[0] : form.elements[firstBad[0]];
      el.focus();
      return;
    }
    if (form.elements.company.value) { finish('We\'ll reply within one business day.'); return; }

    const name = form.elements.name.value.trim().split(' ')[0];
    if (CONTACT.endpoint) {
      send.disabled = true;
      send.firstChild.textContent = 'Sending… ';
      try {
        const res = await fetch(CONTACT.endpoint, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) });
        if (!res.ok) throw new Error(String(res.status));
        finish(`Thanks ${name}. We'll reply to ${form.elements.email.value.trim()} within one business day.`);
      } catch {
        send.disabled = false;
        send.firstChild.textContent = 'Send request ';
        $('e-message').textContent = `That didn't send. Try again, or email ${CONTACT.email} directly.`;
      }
      return;
    }

    const subject = `${form.elements.service.value} request from ${form.elements.name.value.trim()}`;
    location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary())}`;
    finish(`Thanks ${name}. Your email app should have opened with the request written out; press send there to finish. If nothing opened, write to ${CONTACT.email}.`);
  });
})();
