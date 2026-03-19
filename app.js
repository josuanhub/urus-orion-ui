const chat = document.getElementById("chat");
const loader = document.getElementById("loader");

async function sendMessage() {
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

    const meta = {
      agents: "multi-agent",
      status: "approved",
      time: "real-time"
    };

    addMessage("orion", reply, meta);

  } catch (err) {
    loader.classList.add("hidden");
    addMessage("orion", "Error conectando al sistema");
  }
}

function addMessage(type, text, meta = null) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${type}`;

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerText = text;

  wrapper.appendChild(bubble);

  if (meta) {
    const metaDiv = document.createElement("div");
    metaDiv.className = "meta";
    metaDiv.innerText =
      `Agentes: ${meta.agents} • Estado: ${meta.status} • Tiempo: ${meta.time}`;
    wrapper.appendChild(metaDiv);
  }

  chat.appendChild(wrapper);
  chat.scrollTop = chat.scrollHeight;
}
