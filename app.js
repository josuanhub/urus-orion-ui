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
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        to: "ORION",
        message: text
      })
    });

    const data = await res.json();
    const reply = data?.output?.reply || "Sin respuesta";

    loader.classList.add("hidden");

    typeMessage(reply);

    // 🔥 DASHBOARD DATA
    renderDashboard(data);

  } catch (err) {
    loader.classList.add("hidden");
    addMessage("orion", "Error conectando al sistema");
  }
};

// CHAT
function addMessage(type, text) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${type}`;

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerText = text;

  wrapper.appendChild(bubble);
  chat.appendChild(wrapper);
  chat.scrollTop = chat.scrollHeight;
}

// TYPING
function typeMessage(text) {
  const wrapper = document.createElement("div");
  wrapper.className = "message orion";

  const bubble = document.createElement("div");
  bubble.className = "bubble";

  wrapper.appendChild(bubble);
  chat.appendChild(wrapper);

  let i = 0;

  function typing() {
    if (i < text.length) {
      bubble.innerText += text.charAt(i);
      i++;
      chat.scrollTop = chat.scrollHeight;
      setTimeout(typing, 10);
    }
  }

  typing();
}

// 🧠 DASHBOARD
function renderDashboard(data) {

  // AGENTES
  agentsDiv.innerHTML = "";
  data.consulted_agents?.forEach(a => {
    const el = document.createElement("div");
    el.className = "item";
    el.innerText = a.agent;
    agentsDiv.appendChild(el);
  });

  // INSIGHTS
  insightsDiv.innerHTML = "";
  data.consulted_agents?.forEach(a => {
    const el = document.createElement("div");
    el.className = "item";
    el.innerText = `${a.agent}: ${a.insight}`;
    insightsDiv.appendChild(el);
  });

  // ESTADO
  statusDiv.innerHTML = `
    <div class="item">Status: ${data.governance?.status}</div>
  `;

  // AUDIT (simple)
  auditDiv.innerHTML = `
    <div class="item">Mensaje procesado</div>
  `;
}
