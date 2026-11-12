(() => {
  'use strict';

  /* =========================================================
     Разметка окна записи — вставляется на любую страницу
     ========================================================= */
  const MODAL_HTML = `
<div class="modal" id="booking" role="dialog" aria-modal="true" aria-labelledby="booking-title" hidden>
  <div class="modal__overlay" data-close></div>
  <div class="modal__box">
    <div class="modal__head">
      <div>
        <span class="eyebrow eyebrow--accent">Онлайн-запись <i class="live"></i></span>
        <h2 class="modal__title" id="booking-title">Запись на приём</h2>
      </div>
      <div class="modal__head-actions">
        <button class="btn btn--outline btn--sm" id="my-bookings-btn" hidden>Мои записи <span class="badge" id="my-count">0</span></button>
        <button class="arrow arrow--light" data-close aria-label="Закрыть">✕</button>
      </div>
    </div>

    <!-- Form view -->
    <form class="bk" id="bk-form" novalidate>
      <fieldset class="bk__step">
        <legend class="bk__legend"><span class="bk__n">1</span>Услуга</legend>
        <div class="chips chips--wrap" id="bk-services"></div>
      </fieldset>

      <fieldset class="bk__step">
        <legend class="bk__legend"><span class="bk__n">2</span>Специалист</legend>
        <div class="bk-docs" id="bk-doctors"></div>
      </fieldset>

      <fieldset class="bk__step">
        <legend class="bk__legend"><span class="bk__n">3</span>Дата и время</legend>
        <div class="bk__dt">
          <div class="cal" id="bk-calendar">
            <div class="cal__head">
              <button type="button" class="cal__nav" data-month="-1" aria-label="Предыдущий месяц">←</button>
              <span class="cal__month" id="cal-month"></span>
              <button type="button" class="cal__nav" data-month="1" aria-label="Следующий месяц">→</button>
            </div>
            <div class="cal__week"><span>Пн</span><span>Вт</span><span>Ср</span><span>Чт</span><span>Пт</span><span>Сб</span><span>Вс</span></div>
            <div class="cal__grid" id="cal-grid"></div>
            <div class="cal__legend"><span><i class="dot dot--many"></i>много мест</span><span><i class="dot dot--few"></i>мало</span><span><i class="dot dot--none"></i>нет мест</span></div>
          </div>
          <div class="slots">
            <div class="slots__head">
              <p class="slots__date" id="slots-date">Выберите дату</p>
              <p class="slots__meta" id="slots-meta"></p>
            </div>
            <div class="slots__body" id="slots"></div>
            <div class="slots__legend"><span><i class="sl sl--free"></i>свободно</span><span><i class="sl sl--busy"></i>занято</span><span><i class="sl sl--sel"></i>ваш выбор</span></div>
          </div>
        </div>
      </fieldset>

      <fieldset class="bk__step">
        <legend class="bk__legend"><span class="bk__n">4</span>Ваши данные</legend>
        <div class="bk__fields">
          <label class="field"><span>Ваше имя</span><input type="text" name="name" autocomplete="name" placeholder="Как к вам обращаться" required></label>
          <label class="field"><span>Телефон</span><input type="tel" name="phone" autocomplete="tel" placeholder="+7 (___) ___-__-__" required></label>
          <label class="field"><span>Кличка питомца</span><input type="text" name="pet" placeholder="Например, Бублик"></label>
          <div class="field"><span>Кто пациент</span>
            <div class="seg" id="bk-pet-type">
              <label><input type="radio" name="petType" value="Собака" checked><span>Собака</span></label>
              <label><input type="radio" name="petType" value="Кошка"><span>Кошка</span></label>
              <label><input type="radio" name="petType" value="Другое"><span>Другое</span></label>
            </div>
          </div>
          <label class="field field--full"><span>Что беспокоит <em>— необязательно</em></span><textarea name="comment" rows="3" placeholder="Коротко опишите симптомы или цель визита"></textarea></label>
        </div>
      </fieldset>

      <div class="bk__footer">
        <div class="bk__summary" id="bk-summary">Выберите услугу, дату и время</div>
        <div class="bk__submit">
          <label class="check"><input type="checkbox" name="agree" required><span>Согласен на обработку персональных данных</span></label>
          <button type="submit" class="btn btn--accent" id="bk-submit">Записаться <span class="arr">→</span></button>
        </div>
      </div>
      <p class="bk__error" id="bk-error" role="alert"></p>
    </form>

    <!-- Success view -->
    <div class="bk-done" id="bk-done" hidden>
      <div class="bk-done__icon">✓</div>
      <h3 class="bk-done__title">Вы записаны!</h3>
      <p class="bk-done__text">Мы&nbsp;позвоним за&nbsp;день до визита, чтобы напомнить. Если планы изменятся — отмените запись в&nbsp;«Моих записях».</p>
      <div class="ticket" id="bk-ticket"></div>
      <div class="bk-done__btns">
        <button class="btn btn--outline" id="bk-ics">Добавить в календарь</button>
        <button class="btn btn--accent" data-close>Готово</button>
      </div>
    </div>

    <!-- My bookings view -->
    <div class="bk-list" id="bk-list" hidden>
      <button class="bk-list__back" id="bk-list-back"><span class="arr">←</span> Новая запись</button>
      <div id="bk-list-items"></div>
    </div>
  </div>
</div>

<div class="toast" id="toast" role="status" aria-live="polite"></div>
`;
  if (!document.getElementById('booking')) document.body.insertAdjacentHTML('beforeend', MODAL_HTML);

  /* =========================================================
     Общие помощники
     ========================================================= */
  function formatPhone(value) {
    let digits = value.replace(/\D/g, '');
    if (!digits) return '';
    if (digits[0] === '8') digits = '7' + digits.slice(1);
    if (digits[0] !== '7') digits = '7' + digits;
    digits = digits.slice(0, 11);
    const p = digits.slice(1);
    let out = '+7';
    if (p.length) out += ' (' + p.slice(0, 3);
    if (p.length >= 3) out += ')';
    if (p.length > 3) out += ' ' + p.slice(3, 6);
    if (p.length > 6) out += '-' + p.slice(6, 8);
    if (p.length > 8) out += '-' + p.slice(8, 10);
    return out;
  }
  function bindPhoneMask(input) {
    input.addEventListener('input', () => { input.value = formatPhone(input.value); });
    input.addEventListener('focus', () => { if (!input.value) input.value = '+7 ('; });
    input.addEventListener('blur', () => { if (input.value.replace(/\D/g, '').length <= 1) input.value = ''; });
  }
  const searchNorm = (str) => str.toLowerCase().replace(/ё/g, 'е').trim();
  const rub = (n) => n.toLocaleString('ru-RU') + ' ₽';

  /* =========================================================
     Mobile navigation
     ========================================================= */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');

  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open);
  });
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      nav.classList.remove('is-open');
      burger.setAttribute('aria-expanded', false);
    }
  });

  /* =========================================================
     Doctors slider
     ========================================================= */
  const track = document.getElementById('doctors');
  const slideBtns = document.querySelectorAll('[data-slide]');

  if (track && slideBtns.length) {
    const updateSlider = () => {
      const max = track.scrollWidth - track.clientWidth - 2;
      slideBtns[0].disabled = track.scrollLeft <= 2;
      slideBtns[1].disabled = track.scrollLeft >= max;
    };
    slideBtns.forEach((btn) => btn.addEventListener('click', () => {
      const card = track.querySelector('.doctor');
      const step = card.offsetWidth + parseFloat(getComputedStyle(track).columnGap || 16);
      track.scrollBy({ left: step * Number(btn.dataset.slide) });
    }));
    track.addEventListener('scroll', updateSlider, { passive: true });
    window.addEventListener('resize', updateSlider);
    updateSlider();
  }

  /* =========================================================
     «База данных» клиники: услуги, врачи, расписание.
     Всё считается на клиенте: занятость генерируется
     детерминированно (одинаково при каждом заходе),
     а записи пользователя хранятся в localStorage.
     ========================================================= */
  const SERVICES = [
    { id: 'therapy', name: 'Терапия и приём', doctors: ['elena', 'maria', 'anna'] },
    { id: 'first', name: 'Первый визит-знакомство', doctors: ['elena', 'maria', 'anna'] },
    { id: 'vaccination', name: 'Вакцинация', doctors: ['maria', 'anna'] },
    { id: 'surgery', name: 'Хирургия', doctors: ['andrey', 'ilya'] },
    { id: 'ophthalmology', name: 'Офтальмология', doctors: ['andrey'] },
    { id: 'diagnostics', name: 'Диагностика', doctors: ['sergey', 'elena'] },
    { id: 'grooming', name: 'Груминг', doctors: ['olga', 'vika'] },
  ];

  const DOCTORS = {
    elena: { name: 'Елена Морозова', role: 'Ведущий врач', photo: 'img/doc1.jpg' },
    andrey: { name: 'Андрей Соколов', role: 'Хирург, офтальмолог', photo: 'img/doc2.jpg' },
    maria: { name: 'Мария Ковалёва', role: 'Терапевт, вакцинация', photo: 'img/doc3.jpg' },
    sergey: { name: 'Сергей Лебедев', role: 'УЗИ-диагностика', photo: 'img/doc4.jpg' },
    anna: { name: 'Анна Белова', role: 'Терапевт, дерматолог', photo: 'img/doc5.jpg' },
    ilya: { name: 'Илья Кузнецов', role: 'Хирург, травматолог', photo: 'img/doc6.jpg' },
    olga: { name: 'Ольга', role: 'Мастер груминга' },
    vika: { name: 'Виктория', role: 'Мастер груминга' },
  };

  const OPEN_HOUR = 9;
  const CLOSE_HOUR = 21;
  const STEP_MIN = 30;
  const HORIZON_DAYS = 45;
  const BREAK_TIMES = ['13:00', '13:30'];

  const TIMES = [];
  for (let m = OPEN_HOUR * 60; m < CLOSE_HOUR * 60; m += STEP_MIN) {
    TIMES.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
  }

  /* ---------- storage ---------- */
  const store = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem(key);
        return v ? JSON.parse(v) : fallback;
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* приватный режим */ }
    },
  };
  const KEY_BOOKINGS = 'provet:bookings';
  const KEY_TAKEN = 'provet:taken';

  let bookings = store.get(KEY_BOOKINGS, []);
  let taken = new Set(store.get(KEY_TAKEN, []));

  /* ---------- utils ---------- */
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function rand(seed) {
    // mulberry32 — один детерминированный шаг
    let t = (hash(seed) + 0x6d2b79f5) | 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  const pad = (n) => String(n).padStart(2, '0');
  const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fromISO = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const today = () => startOfDay(new Date());
  const daysBetween = (a, b) => Math.round((startOfDay(b) - startOfDay(a)) / 86400000);
  const fmtDay = (iso) => fromISO(iso).toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' });
  const fmtDayLong = (iso) => fromISO(iso).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
  const wait = (min, max) => new Promise((r) => setTimeout(r, min + Math.random() * (max - min)));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- schedule ---------- */
  function isDayOff(doc, date) {
    return rand(`off|${doc}|${date}`) < 0.14;
  }
  function loadFactor(date) {
    const offset = daysBetween(today(), fromISO(date));
    const dow = fromISO(date).getDay();
    let p = offset <= 0 ? 0.8 : offset === 1 ? 0.72 : offset <= 3 ? 0.62 : offset <= 7 ? 0.52 : 0.4;
    if (dow === 0 || dow === 6) p += 0.1;
    return p;
  }
  function isPast(date, time) {
    const [h, m] = time.split(':').map(Number);
    const d = fromISO(date);
    d.setHours(h, m);
    return d.getTime() < Date.now() + 30 * 60000;
  }
  function userBooking(doc, date, time) {
    return bookings.find((b) => b.doctor === doc && b.date === date && b.time === time);
  }
  function isBusy(doc, date, time) {
    if (BREAK_TIMES.includes(time)) return true;
    if (userBooking(doc, date, time)) return true;
    if (taken.has(`${doc}|${date}|${time}`)) return true;
    return rand(`${doc}|${date}|${time}`) < loadFactor(date);
  }

  /** Слоты на день: [{ time, free, past, doctor, mine }] */
  function getSlots(serviceId, doctorId, date) {
    const service = SERVICES.find((s) => s.id === serviceId);
    const docs = doctorId === 'any' ? service.doctors : [doctorId];
    const working = docs.filter((d) => !isDayOff(d, date));
    return TIMES.map((time) => {
      const past = isPast(date, time);
      const freeDoc = working.find((d) => !isBusy(d, date, time));
      const mine = docs.some((d) => userBooking(d, date, time));
      return { time, past, free: !past && !!freeDoc, doctor: freeDoc || null, mine, dayOff: !working.length };
    });
  }
  function dayLevel(serviceId, doctorId, date) {
    const slots = getSlots(serviceId, doctorId, date);
    if (slots[0].dayOff) return 'off';
    const free = slots.filter((s) => s.free).length;
    return free === 0 ? 'none' : free < 6 ? 'few' : 'many';
  }

  /* ---------- fake API (имитация сервера) ---------- */
  const api = {
    async fetchSlots(serviceId, doctorId, date) {
      await wait(280, 650);
      return getSlots(serviceId, doctorId, date);
    },
    async createBooking(data) {
      await wait(700, 1200);
      const service = SERVICES.find((s) => s.id === data.service);
      const docs = data.doctor === 'any' ? service.doctors : [data.doctor];
      const doctor = docs.find((d) => !isDayOff(d, data.date) && !isBusy(d, data.date, data.time));
      if (!doctor || isPast(data.date, data.time)) {
        const err = new Error('slot_taken');
        throw err;
      }
      const booking = { ...data, doctor, id: `PV-${Date.now().toString(36).toUpperCase().slice(-6)}`, createdAt: Date.now() };
      bookings.push(booking);
      store.set(KEY_BOOKINGS, bookings);
      return booking;
    },
    async cancelBooking(id) {
      await wait(250, 500);
      bookings = bookings.filter((b) => b.id !== id);
      store.set(KEY_BOOKINGS, bookings);
    },
  };

  /* =========================================================
     Booking modal
     ========================================================= */
  const modal = document.getElementById('booking');
  const form = document.getElementById('bk-form');
  const servicesEl = document.getElementById('bk-services');
  const doctorsEl = document.getElementById('bk-doctors');
  const calMonthEl = document.getElementById('cal-month');
  const calGridEl = document.getElementById('cal-grid');
  const calNavs = modal.querySelectorAll('.cal__nav');
  const slotsEl = document.getElementById('slots');
  const slotsDateEl = document.getElementById('slots-date');
  const slotsMetaEl = document.getElementById('slots-meta');
  const summaryEl = document.getElementById('bk-summary');
  const submitBtn = document.getElementById('bk-submit');
  const errorEl = document.getElementById('bk-error');
  const doneEl = document.getElementById('bk-done');
  const ticketEl = document.getElementById('bk-ticket');
  const listEl = document.getElementById('bk-list');
  const listItemsEl = document.getElementById('bk-list-items');
  const myBtn = document.getElementById('my-bookings-btn');
  const myCount = document.getElementById('my-count');
  const toastEl = document.getElementById('toast');

  const state = {
    service: 'therapy',
    doctor: 'any',
    date: null,
    time: null,
    assigned: null,
    month: null, // Date — первое число отображаемого месяца
    slots: [],
    reqId: 0,
    lastBooking: null,
  };
  let lastFocus = null;
  let liveTimer = null;
  let liveCount = 0;

  /* ---------- toast ---------- */
  let toastTimer;
  function toast(text) {
    toastEl.textContent = text;
    toastEl.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-show'), 3200);
  }

  /* ---------- render: services & doctors ---------- */
  function renderServices() {
    servicesEl.innerHTML = SERVICES.map((s) =>
      `<button type="button" class="opt${s.id === state.service ? ' is-active' : ''}" data-service="${s.id}" aria-pressed="${s.id === state.service}">${s.name}</button>`
    ).join('');
  }

  function avatar(id) {
    const d = DOCTORS[id];
    return d.photo
      ? `<img class="doc-opt__ava" src="${d.photo}" alt="" width="48" height="48">`
      : `<span class="doc-opt__ava">${d.name[0]}</span>`;
  }

  function renderDoctors() {
    const service = SERVICES.find((s) => s.id === state.service);
    const isGroom = service.id === 'grooming';
    const any = `<button type="button" class="doc-opt${state.doctor === 'any' ? ' is-active' : ''}" data-doctor="any">
        <span class="doc-opt__ava doc-opt__ava--any"><img src="img/paw-pin.svg" width="20" height="20" alt=""></span>
        <span><span class="doc-opt__name">${isGroom ? 'Любой мастер' : 'Любой врач'}</span><span class="doc-opt__role">Ближайшее свободное время</span></span>
      </button>`;
    doctorsEl.innerHTML = any + service.doctors.map((id) =>
      `<button type="button" class="doc-opt${state.doctor === id ? ' is-active' : ''}" data-doctor="${id}">
        ${avatar(id)}
        <span><span class="doc-opt__name">${DOCTORS[id].name}</span><span class="doc-opt__role">${DOCTORS[id].role}</span></span>
      </button>`
    ).join('');
  }

  /* ---------- render: calendar ---------- */
  function renderCalendar() {
    const t = today();
    const last = new Date(t);
    last.setDate(t.getDate() + HORIZON_DAYS);
    const m = state.month;
    calMonthEl.textContent = `${m.toLocaleDateString('ru-RU', { month: 'long' })} ${m.getFullYear()}`;
    calNavs[0].disabled = m <= new Date(t.getFullYear(), t.getMonth(), 1);
    calNavs[1].disabled = new Date(m.getFullYear(), m.getMonth() + 1, 1) > last;

    const first = new Date(m.getFullYear(), m.getMonth(), 1);
    const daysInMonth = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
    const lead = (first.getDay() + 6) % 7;
    let html = '<span></span>'.repeat(lead);

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(m.getFullYear(), m.getMonth(), d);
      const iso = toISO(date);
      const outside = date < t || date > last;
      let level = outside ? null : dayLevel(state.service, state.doctor, iso);
      const disabled = outside || level === 'off' || level === 'none';
      const cls = ['day'];
      if (iso === toISO(t)) cls.push('is-today');
      if (iso === state.date) cls.push('is-active');
      const dot = level ? `<i class="dot dot--${level === 'off' ? 'none' : level}"></i>` : '';
      const label = fmtDayLong(iso) + (level === 'off' ? ', не принимает' : level === 'none' ? ', мест нет' : '');
      html += `<button type="button" class="${cls.join(' ')}" data-date="${iso}"${disabled ? ' disabled' : ''} aria-label="${label}">${d}${dot}</button>`;
    }
    calGridEl.innerHTML = html;
  }

  /* ---------- render: slots ---------- */
  function slotButton(s) {
    const cls = ['slot'];
    if (s.time === state.time && s.free) cls.push('is-active');
    if (s.justTaken) cls.push('is-new');
    const title = s.mine ? 'Ваша запись' : s.past ? 'Время прошло' : s.free ? 'Свободно' : 'Занято';
    return `<button type="button" class="${cls.join(' ')}" data-time="${s.time}"${s.free ? '' : ' disabled'} title="${title}">${s.time}</button>`;
  }

  function renderSlots() {
    if (!state.date) {
      slotsDateEl.textContent = 'Выберите дату';
      slotsMetaEl.textContent = '';
      slotsEl.innerHTML = '<div class="slots__empty"><b>Сначала выберите день в календаре</b>Покажем свободное время у выбранного специалиста</div>';
      return;
    }
    slotsDateEl.textContent = fmtDayLong(state.date);
    const slots = state.slots;
    if (slots[0] && slots[0].dayOff) {
      slotsMetaEl.textContent = '';
      slotsEl.innerHTML = '<div class="slots__empty"><b>Специалист не принимает в этот день</b>Выберите другую дату или «любого врача»</div>';
      return;
    }
    const visible = slots.filter((s) => !s.past);
    const free = visible.filter((s) => s.free).length;
    slotsMetaEl.textContent = `Свободно ${free} из ${visible.length}`;
    if (!free) {
      slotsEl.innerHTML = '<div class="slots__empty"><b>На этот день всё занято</b>Попробуйте соседние даты</div>';
      return;
    }
    const groups = [
      ['Утро', (h) => h < 12],
      ['День', (h) => h >= 12 && h < 17],
      ['Вечер', (h) => h >= 17],
    ];
    slotsEl.innerHTML = groups.map(([label, test]) => {
      const items = visible.filter((s) => test(parseInt(s.time, 10)));
      if (!items.length) return '';
      return `<div class="slots__group"><p class="slots__label">${label}</p><div class="slots__grid">${items.map(slotButton).join('')}</div></div>`;
    }).join('');
  }

  function renderSkeleton() {
    slotsMetaEl.textContent = 'Загружаем расписание…';
    slotsEl.innerHTML = `<div class="slots__grid">${'<div class="skeleton"></div>'.repeat(12)}</div>`;
  }

  async function loadSlots() {
    if (!state.date) { renderSlots(); return; }
    const id = ++state.reqId;
    slotsDateEl.textContent = fmtDayLong(state.date);
    renderSkeleton();
    const slots = await api.fetchSlots(state.service, state.doctor, state.date);
    if (id !== state.reqId) return; // пришёл устаревший ответ
    state.slots = slots;
    const current = slots.find((s) => s.time === state.time);
    if (!current || !current.free) {
      state.time = null;
      state.assigned = null;
    } else {
      state.assigned = current.doctor;
    }
    renderSlots();
    renderSummary();
  }

  /* ---------- summary ---------- */
  function renderSummary() {
    const service = SERVICES.find((s) => s.id === state.service);
    if (!state.date || !state.time) {
      summaryEl.innerHTML = `<b>${service.name}</b> · выберите дату и время`;
      return;
    }
    const doc = state.doctor === 'any' ? state.assigned : state.doctor;
    summaryEl.innerHTML = `<b>${service.name}</b> · ${fmtDay(state.date)}, <b>${state.time}</b>${doc ? ` · ${DOCTORS[doc].name}` : ''}`;
  }

  /** Если дата не выбрана или на неё нет мест — берём ближайший свободный день */
  function ensureDate() {
    if (state.date && ['many', 'few'].includes(dayLevel(state.service, state.doctor, state.date))) return;
    const t = today();
    for (let i = 0; i <= HORIZON_DAYS; i++) {
      const d = new Date(t.getFullYear(), t.getMonth(), t.getDate() + i);
      const iso = toISO(d);
      if (['many', 'few'].includes(dayLevel(state.service, state.doctor, iso))) {
        state.date = iso;
        state.month = new Date(d.getFullYear(), d.getMonth(), 1);
        return;
      }
    }
    state.date = null;
  }

  function refreshAll() {
    ensureDate();
    renderServices();
    renderDoctors();
    renderCalendar();
    renderSummary();
    loadSlots();
  }

  /* ---------- "live" updates: имитация других пациентов ---------- */
  function scheduleLive() {
    clearTimeout(liveTimer);
    if (liveCount >= 3) return;
    liveTimer = setTimeout(() => {
      if (modal.hidden || !state.date || form.hidden) return;
      const candidates = state.slots.filter((s) => s.free && s.time !== state.time && s.doctor);
      if (candidates.length > 3 && Math.random() < 0.6) {
        const s = candidates[Math.floor(Math.random() * candidates.length)];
        taken.add(`${s.doctor}|${state.date}|${s.time}`);
        store.set(KEY_TAKEN, [...taken]);
        state.slots = getSlots(state.service, state.doctor, state.date);
        const changed = state.slots.find((x) => x.time === s.time);
        if (changed && !changed.free) changed.justTaken = true;
        renderSlots();
        renderCalendar();
        liveCount++;
        toast(`Только что заняли ${s.time} — ${fmtDay(state.date)}`);
      }
      scheduleLive();
    }, 18000 + Math.random() * 17000);
  }

  /* ---------- open / close ---------- */
  function showView(view) {
    form.hidden = view !== 'form';
    doneEl.hidden = view !== 'done';
    listEl.hidden = view !== 'list';
    modal.querySelector('.modal__title').textContent =
      view === 'list' ? 'Мои записи' : 'Запись на приём';
  }

  function updateMyCount() {
    const upcoming = bookings.filter((b) => !isPast(b.date, b.time));
    myCount.textContent = upcoming.length;
    myBtn.hidden = !bookings.length;
  }

  function openModal({ service, doctor } = {}) {
    lastFocus = document.activeElement;
    if (doctor && DOCTORS[doctor]) {
      state.doctor = doctor;
      state.service = (SERVICES.find((s) => s.id === service && s.doctors.includes(doctor)) ||
        SERVICES.find((s) => s.doctors.includes(doctor))).id;
    } else {
      state.service = SERVICES.some((s) => s.id === service) ? service : state.service;
      state.doctor = 'any';
    }
    if (!state.month) {
      const t = today();
      state.month = new Date(t.getFullYear(), t.getMonth(), 1);
    }
    errorEl.textContent = '';
    showView('form');
    updateMyCount();
    modal.hidden = false;
    document.body.classList.add('lock');
    refreshAll();
    scheduleLive();
    requestAnimationFrame(() => {
      const active = servicesEl.querySelector('.is-active');
      if (active) active.focus({ preventScroll: true });
    });
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove('lock');
    clearTimeout(liveTimer);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-booking]');
    if (trigger && !modal.contains(trigger)) {
      e.preventDefault();
      openModal({ service: trigger.dataset.booking, doctor: trigger.dataset.doctor });
    }
  });
  document.querySelectorAll('article[data-booking]').forEach((el) => {
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal({ service: el.dataset.booking });
      }
    });
  });
  modal.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });

  /* ---------- interactions ---------- */
  servicesEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-service]');
    if (!btn || btn.dataset.service === state.service) return;
    state.service = btn.dataset.service;
    const service = SERVICES.find((s) => s.id === state.service);
    if (state.doctor !== 'any' && !service.doctors.includes(state.doctor)) state.doctor = 'any';
    refreshAll();
  });

  doctorsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-doctor]');
    if (!btn || btn.dataset.doctor === state.doctor) return;
    state.doctor = btn.dataset.doctor;
    ensureDate();
    renderDoctors();
    renderCalendar();
    loadSlots();
  });

  calNavs.forEach((btn) => btn.addEventListener('click', () => {
    state.month = new Date(state.month.getFullYear(), state.month.getMonth() + Number(btn.dataset.month), 1);
    renderCalendar();
  }));

  calGridEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-date]');
    if (!btn || btn.disabled) return;
    state.date = btn.dataset.date;
    renderCalendar();
    loadSlots();
  });

  slotsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-time]');
    if (!btn || btn.disabled) return;
    state.time = btn.dataset.time;
    state.assigned = state.slots.find((s) => s.time === state.time).doctor;
    errorEl.textContent = '';
    renderSlots();
    renderSummary();
  });

  /* ---------- phone mask ---------- */
  bindPhoneMask(form.elements.phone);

  form.addEventListener('input', (e) => {
    const field = e.target.closest('.field');
    if (field) field.classList.remove('is-invalid');
  });

  /* ---------- submit ---------- */
  function validate() {
    const f = form.elements;
    const problems = [];
    form.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
    if (!state.date || !state.time) problems.push('выберите дату и время');
    if (f.name.value.trim().length < 2) {
      f.name.closest('.field').classList.add('is-invalid');
      problems.push('укажите имя');
    }
    if (f.phone.value.replace(/\D/g, '').length !== 11) {
      f.phone.closest('.field').classList.add('is-invalid');
      problems.push('укажите телефон полностью');
    }
    if (!f.agree.checked) problems.push('подтвердите согласие на обработку данных');
    return problems;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const problems = validate();
    if (problems.length) {
      errorEl.textContent = 'Чтобы записаться, ' + problems.join(', ') + '.';
      return;
    }
    errorEl.textContent = '';
    const f = form.elements;
    const payload = {
      service: state.service,
      doctor: state.doctor,
      date: state.date,
      time: state.time,
      name: f.name.value.trim(),
      phone: f.phone.value,
      pet: f.pet.value.trim(),
      petType: f.petType.value,
      comment: f.comment.value.trim(),
    };
    const initial = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Записываем…';
    try {
      const booking = await api.createBooking(payload);
      state.lastBooking = booking;
      renderTicket(booking);
      showView('done');
      updateMyCount();
      modal.scrollTop = 0;
      state.time = null;
      state.assigned = null;
      form.elements.comment.value = '';
    } catch (err) {
      errorEl.textContent = `Упс, время ${payload.time} только что заняли. Выберите, пожалуйста, другое.`;
      state.time = null;
      renderCalendar();
      loadSlots();
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = initial;
    }
  });

  function renderTicket(b) {
    const service = SERVICES.find((s) => s.id === b.service);
    const doc = DOCTORS[b.doctor];
    const rows = [
      ['Номер', b.id],
      ['Услуга', service.name],
      ['Специалист', `${doc.name} · ${doc.role}`],
      ['Когда', `${fmtDayLong(b.date)}, ${b.time}`],
      ['Пациент', [b.petType, b.pet].filter(Boolean).join(' · ')],
      ['Адрес', 'Ростов-на-Дону, ул. Садовая, 18'],
    ];
    ticketEl.innerHTML = `<dl style="display:contents">${rows.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl>`;
  }

  /* ---------- .ics ---------- */
  document.getElementById('bk-ics').addEventListener('click', () => {
    const b = state.lastBooking;
    if (!b) return;
    const service = SERVICES.find((s) => s.id === b.service);
    const [h, m] = b.time.split(':').map(Number);
    const start = fromISO(b.date);
    start.setHours(h, m);
    const end = new Date(start.getTime() + STEP_MIN * 60000);
    const stamp = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ProVet//Booking//RU', 'BEGIN:VEVENT',
      `UID:${b.id}@provet`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`,
      `SUMMARY:Pro&Vet — ${service.name}`,
      `DESCRIPTION:Специалист: ${DOCTORS[b.doctor].name}. Номер записи: ${b.id}`,
      'LOCATION:Ростов-на-Дону\\, ул. Садовая\\, 18',
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `provet-${b.id}.ics`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  /* ---------- my bookings ---------- */
  function renderList() {
    const sorted = [...bookings].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    if (!sorted.length) {
      listItemsEl.innerHTML = '<div class="slots__empty"><b>Записей пока нет</b>Самое время записаться</div>';
      return;
    }
    listItemsEl.innerHTML = sorted.map((b) => {
      const past = isPast(b.date, b.time);
      const service = SERVICES.find((s) => s.id === b.service);
      return `<div class="booking-item${past ? ' is-past' : ''}">
        <div>
          <p class="booking-item__date">${fmtDayLong(b.date)}, ${b.time}</p>
          <p class="booking-item__meta">${service.name} · ${DOCTORS[b.doctor].name} · ${esc([b.petType, b.pet].filter(Boolean).join(' '))} · ${b.id}</p>
        </div>
        ${past ? '<span class="chip">Прошла</span>' : `<button class="btn btn--outline btn--sm" data-cancel="${b.id}">Отменить</button>`}
      </div>`;
    }).join('');
  }

  myBtn.addEventListener('click', () => {
    renderList();
    showView('list');
  });
  document.getElementById('bk-list-back').addEventListener('click', () => {
    showView('form');
    refreshAll();
  });
  listItemsEl.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-cancel]');
    if (!btn) return;
    btn.disabled = true;
    btn.textContent = 'Отменяем…';
    await api.cancelBooking(btn.dataset.cancel);
    renderList();
    updateMyCount();
    toast('Запись отменена — время снова свободно');
  });

  // ссылка вида site/#booking сразу открывает форму записи
  if (location.hash === '#booking') openModal();

  /* =========================================================
     Страница «Услуги»: поиск по прайс-листу
     ========================================================= */
  const priceSearch = document.getElementById('price-search');
  if (priceSearch) {
    const blocks = document.querySelectorAll('[data-scope]');
    const empty = document.getElementById('price-empty');
    priceSearch.addEventListener('input', () => {
      const q = searchNorm(priceSearch.value);
      let total = 0;
      blocks.forEach((block) => {
        const title = searchNorm(block.querySelector('.price-block__title').textContent);
        let visibleInBlock = 0;
        block.querySelectorAll('.price-group').forEach((group) => {
          let visible = 0;
          group.querySelectorAll('.price-row').forEach((row) => {
            const show = !q || title.includes(q) || searchNorm(row.textContent).includes(q);
            row.hidden = !show;
            if (show) visible++;
          });
          group.hidden = !visible;
          visibleInBlock += visible;
        });
        block.hidden = !visibleInBlock;
        total += visibleInBlock;
      });
      empty.hidden = total > 0;
    });
    priceSearch.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('prices').scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  /* =========================================================
     Страница «Ветаптека»: фильтр, поиск, бронь товаров
     ========================================================= */
  const productsEl = document.getElementById('products');
  if (productsEl) {
    const KEY_CART = 'provet:cart';
    const KEY_ORDERS = 'provet:orders';
    const products = [...productsEl.querySelectorAll('.product')];
    const byId = Object.fromEntries(products.map((p) => [p.dataset.id, {
      id: p.dataset.id, name: p.dataset.name, price: Number(p.dataset.price),
    }]));
    const filterEl = document.getElementById('cat-filter');
    const searchEl = document.getElementById('product-search');
    const emptyEl = document.getElementById('products-empty');
    const cartList = document.getElementById('cart-list');
    const cartEmpty = document.getElementById('cart-empty');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    const cartSubmit = document.getElementById('cart-submit');
    let cat = 'all';
    let cart = store.get(KEY_CART, []).filter((id) => byId[id]);

    const applyFilter = () => {
      const q = searchNorm(searchEl.value);
      let visible = 0;
      products.forEach((p) => {
        const show = (cat === 'all' || p.dataset.cat === cat) && (!q || searchNorm(p.textContent).includes(q));
        p.hidden = !show;
        if (show) visible++;
      });
      emptyEl.hidden = visible > 0;
    };
    const setCat = (value) => {
      cat = value;
      filterEl.querySelectorAll('[data-cat]').forEach((b) => b.classList.toggle('is-active', b.dataset.cat === cat));
      applyFilter();
    };

    const renderCart = () => {
      store.set(KEY_CART, cart);
      products.forEach((p) => {
        const inCart = cart.includes(p.dataset.id);
        const btn = p.querySelector('[data-reserve]');
        btn.classList.toggle('is-active', inCart);
        btn.textContent = inCart ? '✓ Отложено' : 'Отложить';
      });
      cartList.innerHTML = cart.map((id) =>
        `<li class="cart__item"><span>${esc(byId[id].name)}</span><b>${rub(byId[id].price)}</b><button type="button" data-remove="${id}" aria-label="Убрать">✕</button></li>`
      ).join('');
      const sum = cart.reduce((acc, id) => acc + byId[id].price, 0);
      cartCount.textContent = cart.length;
      cartTotal.textContent = rub(sum);
      cartEmpty.hidden = cart.length > 0;
      cartSubmit.disabled = !cart.length;
    };

    filterEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-cat]');
      if (btn) setCat(btn.dataset.cat);
    });
    searchEl.addEventListener('input', applyFilter);
    productsEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-reserve]');
      if (!btn) return;
      const id = btn.dataset.reserve;
      cart = cart.includes(id) ? cart.filter((x) => x !== id) : [...cart, id];
      renderCart();
      if (cart.includes(id)) toast(`«${byId[id].name}» — отложено`);
    });
    cartList.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-remove]');
      if (!btn) return;
      cart = cart.filter((x) => x !== btn.dataset.remove);
      renderCart();
    });

    // ссылки вида pharmacy.html#cat-food сразу включают нужную категорию
    const hashCat = location.hash.match(/^#cat-(\w+)/);
    if (hashCat && filterEl.querySelector(`[data-cat="${hashCat[1]}"]`)) {
      setCat(hashCat[1]);
      document.getElementById('catalog').scrollIntoView();
    }
    renderCart();

    /* ---------- reserve dialog ---------- */
    const reserve = document.getElementById('reserve');
    const rForm = document.getElementById('reserve-form');
    const rItems = document.getElementById('reserve-items');
    const rError = document.getElementById('reserve-error');
    const rDone = document.getElementById('reserve-done');
    const rDoneText = document.getElementById('reserve-done-text');
    bindPhoneMask(rForm.elements.phone);

    const openReserve = () => {
      const sum = cart.reduce((acc, id) => acc + byId[id].price, 0);
      rItems.innerHTML = cart.map((id) => `<dt>${esc(byId[id].name)}</dt><dd>${rub(byId[id].price)}</dd>`).join('') +
        `<dt><b>Итого</b></dt><dd>${rub(sum)}</dd>`;
      rForm.hidden = false;
      rDone.hidden = true;
      rError.textContent = '';
      reserve.hidden = false;
      document.body.classList.add('lock');
      rForm.elements.name.focus();
    };
    const closeReserve = () => {
      reserve.hidden = true;
      document.body.classList.remove('lock');
    };
    cartSubmit.addEventListener('click', openReserve);
    reserve.addEventListener('click', (e) => { if (e.target.closest('[data-close-reserve]')) closeReserve(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !reserve.hidden) closeReserve(); });

    rForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = rForm.elements.name.value.trim();
      const phone = rForm.elements.phone.value;
      rForm.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
      const problems = [];
      if (name.length < 2) {
        rForm.elements.name.closest('.field').classList.add('is-invalid');
        problems.push('укажите имя');
      }
      if (phone.replace(/\D/g, '').length !== 11) {
        rForm.elements.phone.closest('.field').classList.add('is-invalid');
        problems.push('укажите телефон полностью');
      }
      if (problems.length) {
        rError.textContent = 'Чтобы забронировать, ' + problems.join(' и ') + '.';
        return;
      }

      const btn = rForm.querySelector('[type="submit"]');
      const initial = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Бронируем…';
      await wait(700, 1100);
      const until = new Date(Date.now() + 24 * 3600000);
      const order = { id: `AP-${Date.now().toString(36).toUpperCase().slice(-5)}`, items: cart, name, phone, until: until.getTime() };
      store.set(KEY_ORDERS, [...store.get(KEY_ORDERS, []), order]);
      rDoneText.innerHTML = `Номер брони <b>${order.id}</b>. Заберите заказ до ${until.toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })} по адресу ул.&nbsp;Садовая,&nbsp;18. Оплата на месте.`;
      rForm.hidden = true;
      rDone.hidden = false;
      btn.disabled = false;
      btn.innerHTML = initial;
      cart = [];
      renderCart();
    });
  }
})();
