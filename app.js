const chat = document.getElementById("chat");
const loader = document.getElementById("loader");

// ENTER
document.getElementById("input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

// FUNCIÓN PRINCIPAL
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

    const meta = {
      agents: "multi-agent",
      status: "approved",
      time: "real-time"
    };

    typeMessage(reply, meta, true); // 🔥 ahora habla

  } catch (err) {
    loader.classList.add("hidden");
    addMessage("orion", "Error conectando al sistema");
  }
};

// MENSAJE NORMAL
function addMessage(type, text, meta = null) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${type}`;

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerText = text;

  wrapper.appendChild(bubble);

  chat.appendChild(wrapper);
  chat.scrollTop = chat.scrollHeight;
}

// ✨ EFECTO ESCRIBIENDO + VOZ
function typeMessage(text, meta, speak = false) {
  const wrapper = document.createElement("div");
  wrapper.className = "message orion";

  const bubble = document.createElement("div");
  bubble.className = "bubble";

  wrapper.appendChild(bubble);

  // 🔊 botón replay voz
  const voiceBtn = document.createElement("button");
  voiceBtn.innerText = "🔊";
  voiceBtn.className = "voice-btn";
  voiceBtn.onclick = () => speakText(text);

  wrapper.appendChild(voiceBtn);

  chat.appendChild(wrapper);

  let i = 0;

  function typing() {
    if (i < text.length) {
      bubble.innerText += text.charAt(i);
      i++;
      chat.scrollTop = chat.scrollHeight;
      setTimeout(typing, 12);
    } else {
      if (meta) {
        const metaDiv = document.createElement("div");
        metaDiv.className = "meta";
        metaDiv.innerText =
          `Agentes: ${meta.agents} • Estado: ${meta.status} • Tiempo: ${meta.time}`;
        wrapper.appendChild(metaDiv);
      }

      if (speak) speakText(text); // 🔥 habla al terminar
    }
  }

  typing();
}

// 🎤 VOZ → TEXTO
window.startVoice = function () {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "es-ES";

  recognition.start();

  recognition.onresult = function (event) {
    const text = event.results[0][0].transcript;
    document.getElementById("input").value = text;
    sendMessage();
  };
};

// 🔊 TEXTO → VOZ (ORION habla)
function speakText(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "es-ES";
  utterance.rate = 1;
  utterance.pitch = 1;

  speechSynthesis.cancel(); // corta si ya estaba hablando
  speechSynthesis.speak(utterance);
}
