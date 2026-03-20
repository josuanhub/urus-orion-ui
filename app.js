const chat = document.getElementById("chat");
const loader = document.getElementById("loader");

const agentsDiv = document.getElementById("agents");
const insightsDiv = document.getElementById("insights");
const statusDiv = document.getElementById("status");
const auditDiv = document.getElementById("audit");

// ENTER
document.getElementById("input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

// SEND
window.sendMessage = async function () {
  const input = document.getElementById("input");
  const text = input.value.trim();
  if (!text) return;

  addMessage("user", text);
  input.value = "";

  loader.classList.remove("hidden");

  try {
    const res = await fetch("/api/v1/moltbook/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: "ORION", message: text })
    });

    const data = await res.json();
    loader.classList.add("hidden");

    typeMessage(data.output.reply);
    renderDashboard(data);

  } catch {
    loader.classList.add("hidden");
    addMessage("orion", "Error conectando");
  }
};

// CHAT
function addMessage(type, text) {
  const msg = document.createElement("div");
  msg.className = `message ${type}`;

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerText = text;

  msg.appendChild(bubble);
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

// TYPING
function typeMessage(text) {
  const msg = document.createElement("div");
  msg.className = "message orion";

  const bubble = document.createElement("div");
  bubble.className = "bubble";

  const btn = document.createElement("button");
  btn.innerText = "🔊";
  btn.className = "voice-btn";
  btn.onclick = () => speak(text);

  msg.appendChild(bubble);
  msg.appendChild(btn);
  chat.appendChild(msg);

  let i = 0;
  function write() {
    if (i < text.length) {
      bubble.innerText += text[i++];
      chat.scrollTop = chat.scrollHeight;
      setTimeout(write, 10);
    }
  }
  write();
}

// VOICE
function speak(text) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "es-ES";
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

// MIC
window.startVoice = function () {
  const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  rec.lang = "es-ES";
  rec.start();

  rec.onresult = e => {
    document.getElementById("input").value = e.results[0][0].transcript;
  };
};

// DASHBOARD
function renderDashboard(data) {

  agentsDiv.innerHTML = "";
  insightsDiv.innerHTML = "";

  data.consulted_agents?.forEach(a => {
    agentsDiv.innerHTML += `<div>${a.agent}</div>`;
    insightsDiv.innerHTML += `<div>${a.agent}: ${a.insight}</div>`;
  });

  statusDiv.innerHTML = `Status: ${data.governance?.status}`;
  auditDiv.innerHTML = `Procesado correctamente`;
}
