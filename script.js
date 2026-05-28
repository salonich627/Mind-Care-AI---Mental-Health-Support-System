// ═══════════════════════════════════════════════════════════
//  MindCare AI — script.js
//  Shared JS for: login, signup, home, chat, manual pages
// ═══════════════════════════════════════════════════════════

// ── CONFIG ──────────────────────────────────────────────────
// Replace with your real Anthropic API key
const API_KEY = "YOUR_ANTHROPIC_API_KEY_HERE";
const MODEL   = "claude-sonnet-4-20250514";
// ────────────────────────────────────────────────────────────

// ── DATA ────────────────────────────────────────────────────
const MOODS = [
  { emoji: "😔", label: "Sad",     color: "#60A5FA", glow: "#60A5FA22", ring: "#3B82F6" },
  { emoji: "😊", label: "Happy",   color: "#34D399", glow: "#34D39922", ring: "#10B981" },
  { emoji: "😤", label: "Angry",   color: "#F87171", glow: "#F8717122", ring: "#EF4444" },
  { emoji: "😰", label: "Anxious", color: "#FBBF24", glow: "#FBBF2422", ring: "#F59E0B" },
  { emoji: "😴", label: "Tired",   color: "#C084FC", glow: "#C084FC22", ring: "#A855F7" },
  { emoji: "😶", label: "Numb",    color: "#94A3B8", glow: "#94A3B822", ring: "#64748B" },
];

const AFFIRMATIONS = [
  { main: "You are stronger than you think",        sub: "Every storm runs out of rain 🌤️" },
  { main: "It's okay to not be okay",               sub: "Rest is part of the journey 🌿" },
  { main: "You deserve to be here",                  sub: "Your presence matters 🤍" },
  { main: "Small steps still move you forward",     sub: "Progress is progress 🌱" },
  { main: "This feeling is temporary",              sub: "You've survived 100% of hard days 💫" },
];

const QUICK_CHIPS = {
  Sad:     ["I feel really low", "I need someone to talk to", "Nothing feels okay"],
  Happy:   ["Something good happened!", "I'm feeling great today", "Life feels good"],
  Angry:   ["I'm so frustrated", "Someone upset me", "I can't calm down"],
  Anxious: ["My mind won't stop", "I feel overwhelmed", "I'm scared of what's ahead"],
  Tired:   ["I'm completely drained", "I can't sleep well", "Everything feels heavy"],
  Numb:    ["I feel nothing", "Just going through motions", "I feel disconnected"],
};

const TIPS = [
  { icon: "🧘", title: "5-4-3-2-1 Grounding",  color: "#60A5FA",
    desc: "Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. This anchors you to the present moment instantly." },
  { icon: "📓", title: "Free Journaling",        color: "#34D399",
    desc: "Write 3 feelings right now. No editing, no rules. Just let it pour out — release emotions without judgment." },
  { icon: "🏃", title: "Move Your Body",         color: "#FBBF24",
    desc: "Even a 5-minute walk shifts your mood chemistry. Movement releases endorphins and breaks anxious thought loops." },
  { icon: "🌙", title: "Sleep Hygiene",          color: "#C084FC",
    desc: "Consistent sleep times, no screens 1hr before bed. Sleep is the foundation of mental wellness." },
  { icon: "🤝", title: "Reach Out",              color: "#34D399",
    desc: "Text a friend. Call someone who cares. You don't have to carry this alone — connection heals." },
  { icon: "🌊", title: "Box Breathing",          color: "#60A5FA",
    desc: "Inhale 4s → Hold 4s → Exhale 4s → Hold 4s. Repeat 4 times. Calms your nervous system fast." },
  { icon: "🧠", title: "CBT Thought Record",     color: "#C084FC",
    desc: "Write the negative thought → identify the distortion → write a balanced alternative thought." },
  { icon: "🆘", title: "Crisis Support",         color: "#F87171", urgent: true,
    desc: "iCall India: 9152987821\nVandrevala Foundation: 1860-2662-345 (24/7 Free)" },
];

// ── STORAGE HELPERS ─────────────────────────────────────────
const Store = {
  getUser:      ()      => JSON.parse(localStorage.getItem('mc_user')  || '{}'),
  setUser:      (u)     => localStorage.setItem('mc_user', JSON.stringify(u)),
  removeUser:   ()      => localStorage.removeItem('mc_user'),
  getMood:      ()      => localStorage.getItem('mc_mood')       || '',
  getMoodEmoji: ()      => localStorage.getItem('mc_mood_emoji') || '',
  setMood:      (l, e)  => { localStorage.setItem('mc_mood', l); localStorage.setItem('mc_mood_emoji', e); },
};

// ── PAGE DETECTOR ────────────────────────────────────────────
const PAGE = document.body.dataset.page || '';

window.addEventListener('DOMContentLoaded', () => {
  if (PAGE === 'login')   initLogin();
  if (PAGE === 'signup')  initSignup();
  if (PAGE === 'home')    initHome();
  if (PAGE === 'chat')    initChat();
  if (PAGE === 'manual')  initManual();
});

// ════════════════════════════════════════════════════════════
//  LOGIN
// ════════════════════════════════════════════════════════════
function initLogin() {
  // If already logged in, skip to home
  if (Store.getUser().email) {
    window.location = 'home.html';
    return;
  }

  document.getElementById('loginBtn').addEventListener('click', doLogin);
  document.getElementById('signupBtn').addEventListener('click', () => window.location = 'signup.html');

  // Enter key support
  ['l-email', 'l-pass'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => {
      if (e.key === 'Enter') doLogin();
    });
  });
}

function doLogin() {
  const email = document.getElementById('l-email').value.trim();
  const pass  = document.getElementById('l-pass').value;
  if (!email || !pass) { showToast('Please fill all fields.'); return; }

  const user = Store.getUser();
  if (user.email && user.email !== email) {
    showToast('User not found. Please sign up.');
    return;
  }
  Store.setUser({ ...user, email });
  window.location = 'home.html';
}

// ════════════════════════════════════════════════════════════
//  SIGNUP
// ════════════════════════════════════════════════════════════
function initSignup() {
  document.getElementById('signupBtn').addEventListener('click', doSignup);
  document.getElementById('loginLink').addEventListener('click', () => window.location = 'login.html');
}

function doSignup() {
  const name  = document.getElementById('s-name').value.trim();
  const email = document.getElementById('s-email').value.trim();
  const pass  = document.getElementById('s-pass').value;
  const conf  = document.getElementById('s-conf').value;

  if (!name || !email || !pass)  { showToast('Please fill all fields.');    return; }
  if (pass !== conf)             { showToast('Passwords do not match.');     return; }
  if (!email.includes('@'))      { showToast('Enter a valid email address.'); return; }

  Store.setUser({ name, email });
  window.location = 'home.html';
}

// ════════════════════════════════════════════════════════════
//  HOME
// ════════════════════════════════════════════════════════════
function initHome() {
  // Auth guard
  if (!Store.getUser().email) { window.location = 'login.html'; return; }

  // Greeting
  const user = Store.getUser();
  const nameEl = document.getElementById('username');
  if (nameEl && user.name) nameEl.textContent = user.name.split(' ')[0];

  // Random affirmation
  const aff = AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)];
  const affMain = document.getElementById('aff-main');
  const affSub  = document.getElementById('aff-sub');
  if (affMain) affMain.textContent = aff.main;
  if (affSub)  affSub.textContent  = aff.sub;

  // Mood grid
  const grid = document.getElementById('mood-grid');
  if (grid) {
    grid.innerHTML = '';
    const savedMood = Store.getMood();
    MOODS.forEach(m => {
      const btn = document.createElement('button');
      btn.className = 'mood-btn' + (savedMood === m.label ? ' active' : '');
      btn.innerHTML = `<span class="mood-em">${m.emoji}</span>${m.label}`;
      if (savedMood === m.label) applyMoodStyle(btn, m);
      btn.addEventListener('click', () => selectMood(btn, m));
      grid.appendChild(btn);
    });
  }

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  // Navigate buttons
  const chatBtn   = document.getElementById('chatBtn');
  const manualBtn = document.getElementById('manualBtn');
  if (chatBtn)   chatBtn.addEventListener('click',   () => window.location = 'chat.html');
  if (manualBtn) manualBtn.addEventListener('click', () => window.location = 'manual.html');
}

function selectMood(btn, mood) {
  document.querySelectorAll('.mood-btn').forEach(b => {
    b.classList.remove('active');
    b.style.cssText = '';
  });
  btn.classList.add('active');
  applyMoodStyle(btn, mood);
  Store.setMood(mood.label, mood.emoji);
}

function applyMoodStyle(btn, mood) {
  btn.style.background  = mood.glow;
  btn.style.borderColor = mood.ring;
  btn.style.color       = mood.color;
  btn.style.boxShadow   = `0 8px 24px ${mood.glow}`;
  btn.style.transform   = 'translateY(-4px) scale(1.05)';
}

function logout() {
  Store.removeUser();
  window.location = 'login.html';
}

// ════════════════════════════════════════════════════════════
//  CHAT
// ════════════════════════════════════════════════════════════
let chatHistory = [];

function initChat() {
  if (!Store.getUser().email) { window.location = 'login.html'; return; }

  const mood      = Store.getMood();
  const moodEmoji = Store.getMoodEmoji();

  // Header mood badge
  const hdrSub = document.getElementById('chat-hdr-sub');
  if (hdrSub && mood) hdrSub.textContent = `● Online · ${moodEmoji} ${mood}`;

  // Back button
  const backBtn = document.getElementById('backBtn');
  if (backBtn) backBtn.addEventListener('click', () => window.location = 'home.html');

  // Breathe button
  const breathBtn = document.getElementById('breatheBtn');
  if (breathBtn) breathBtn.addEventListener('click', openBreath);

  // Quick chips
  const chipsEl = document.getElementById('chips');
  if (chipsEl) {
    const chipList = QUICK_CHIPS[mood] || QUICK_CHIPS.Sad;
    chipList.forEach(c => {
      const btn = document.createElement('button');
      btn.className = 'chip';
      btn.textContent = c;
      btn.addEventListener('click', () => {
        chipsEl.style.display = 'none';
        sendMessage(c);
      });
      chipsEl.appendChild(btn);
    });
  }

  // Send button & enter key
  const sendBtn  = document.getElementById('sendBtn');
  const inputEl  = document.getElementById('chatInput');
  if (sendBtn) sendBtn.addEventListener('click', () => sendMessage());
  if (inputEl) inputEl.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });

  // Welcome message
  const welcome = mood
    ? `I see you're feeling ${mood.toLowerCase()} ${moodEmoji}. I'm here — no judgment. What's going on?`
    : "Hi, I'm MindCare 💙 What's on your mind today?";
  appendMessage('ai', welcome);
}

function appendMessage(role, text) {
  const msgs = document.getElementById('messages');
  if (!msgs) return;
  const div = document.createElement('div');
  div.className = `msg ${role === 'user' ? 'user' : 'ai'}`;
  div.innerHTML = `<div class="bubble">${text}</div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function showTypingIndicator() {
  const msgs = document.getElementById('messages');
  if (!msgs) return;
  const div = document.createElement('div');
  div.className = 'typing'; div.id = 'typing-indicator';
  div.innerHTML = '<span></span><span></span><span></span>';
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function hideTypingIndicator() {
  const el = document.getElementById('typing-indicator');
  if (el) el.remove();
}

async function sendMessage(preset) {
  const inputEl = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  const text = (preset || (inputEl ? inputEl.value : '')).trim();
  if (!text) return;

  if (inputEl) inputEl.value = '';
  const chips = document.getElementById('chips');
  if (chips) chips.style.display = 'none';

  appendMessage('user', text);
  chatHistory.push({ role: 'user', content: text });

  if (sendBtn) sendBtn.disabled = true;
  showTypingIndicator();

  const mood = Store.getMood();

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1000,
        system: `You are MindCare, a compassionate mental health support AI. The user is feeling ${mood || 'emotional'}. Be warm, empathetic, non-judgmental. Keep responses 2-4 sentences. Never diagnose. Speak like a caring friend.`,
        messages: chatHistory,
      }),
    });

    const data  = await res.json();
    const reply = data.content?.map(c => c.text || '').join('') || "I'm here for you 💙";
    hideTypingIndicator();
    appendMessage('ai', reply);
    chatHistory.push({ role: 'assistant', content: reply });

  } catch (err) {
    console.error('MindCare API error:', err);
    hideTypingIndicator();
    appendMessage('ai', "Connection issue right now, but I'm still here 💙 Try again.");
  }

  if (sendBtn) sendBtn.disabled = false;
}

// ════════════════════════════════════════════════════════════
//  MANUAL
// ════════════════════════════════════════════════════════════
function initManual() {
  const backBtn = document.getElementById('backBtn');
  if (backBtn) backBtn.addEventListener('click', () => window.location = 'home.html');

  const wrap = document.getElementById('tips-container');
  if (!wrap) return;

  TIPS.forEach((t, i) => {
    const div = document.createElement('div');
    div.className = `tip-card${t.urgent ? ' urgent' : ''}`;
    div.style.animationDelay = `${0.1 + i * 0.07}s`;
    div.innerHTML = `
      <div class="tip-ico" style="background:${t.color}18">${t.icon}</div>
      <div>
        <p class="tip-name" style="color:${t.urgent ? '#F87171' : '#e2e8f0'}">${t.title}</p>
        <p class="tip-desc">${t.desc}</p>
      </div>`;
    wrap.appendChild(div);
  });
}

// ════════════════════════════════════════════════════════════
//  BREATHING EXERCISE
// ════════════════════════════════════════════════════════════
const BREATH_PHASES = {
  inhale: { next: 'hold',   dur: 4, label: 'Breathe In',  color: '#60A5FA', transition: '4s'   },
  hold:   { next: 'exhale', dur: 4, label: 'Hold',        color: '#C084FC', transition: '0.5s' },
  exhale: { next: 'inhale', dur: 6, label: 'Breathe Out', color: '#34D399', transition: '6s'   },
};

let breathInterval = null;
let breathPhase    = 'inhale';
let breathCount    = 4;
let breathCycles   = 0;

function openBreath() {
  breathPhase  = 'inhale';
  breathCount  = 4;
  breathCycles = 0;

  const overlay = document.getElementById('breathOverlay');
  const skipBtn = document.getElementById('breathSkip');
  const cycleEl = document.getElementById('breathCycle');
  if (overlay) overlay.classList.add('show');
  if (skipBtn) { skipBtn.textContent = 'Skip'; skipBtn.className = 'b-skip'; skipBtn.onclick = closeBreath; }
  if (cycleEl) { cycleEl.style.color = ''; }

  updateBreathUI();
  breathInterval = setInterval(tickBreath, 1000);
}

function closeBreath() {
  clearInterval(breathInterval);
  breathInterval = null;
  const overlay = document.getElementById('breathOverlay');
  if (overlay) overlay.classList.remove('show');
}

function tickBreath() {
  breathCount--;
  if (breathCount <= 0) {
    const p = BREATH_PHASES[breathPhase];
    breathPhase = p.next;
    if (breathPhase === 'inhale') {
      breathCycles++;
      if (breathCycles >= 4) {
        clearInterval(breathInterval);
        const skipBtn = document.getElementById('breathSkip');
        const cycleEl = document.getElementById('breathCycle');
        if (cycleEl) { cycleEl.textContent = 'Well done! 🌿 Great job.'; cycleEl.style.color = '#34D399'; }
        if (skipBtn) { skipBtn.textContent = 'Continue ✓'; skipBtn.className = 'b-done'; skipBtn.onclick = closeBreath; }
        return;
      }
    }
    breathCount = BREATH_PHASES[breathPhase].dur;
  }
  updateBreathUI();
}

function updateBreathUI() {
  const p       = BREATH_PHASES[breathPhase];
  const scale   = breathPhase === 'inhale' ? 1.18 : breathPhase === 'exhale' ? 0.82 : 1;
  const circEl  = document.getElementById('breathCircle');
  const ringEl  = document.getElementById('breathRing');
  const glowEl  = document.getElementById('breathGlow');
  const numEl   = document.getElementById('breathNum');
  const phaseEl = document.getElementById('breathPhase');
  const cycleEl = document.getElementById('breathCycle');

  if (circEl)  { circEl.style.transform  = `scale(${scale})`; circEl.style.transition = `transform ${p.transition} ease-in-out`; }
  if (ringEl)  ringEl.style.borderColor  = p.color;
  if (glowEl)  glowEl.style.background   = p.color;
  if (numEl)   { numEl.style.color       = p.color; numEl.textContent = breathCount; }
  if (phaseEl) phaseEl.textContent       = p.label;
  if (cycleEl) cycleEl.textContent       = `Round ${breathCycles + 1} of 4`;
}

// ── TOAST NOTIFICATION ───────────────────────────────────────
function showToast(msg) {
  let toast = document.getElementById('mc-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'mc-toast';
    toast.style.cssText = `
      position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(20px);
      background:rgba(30,40,70,.95);border:1px solid rgba(255,255,255,.12);
      color:#e2e8f0;padding:12px 24px;border-radius:14px;font-size:14px;
      font-family:'Outfit',sans-serif;z-index:9999;opacity:0;
      transition:all .3s;backdrop-filter:blur(12px);
      box-shadow:0 8px 32px rgba(0,0,0,.4);
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, 2800);
}