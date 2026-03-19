const chat = document.getElementById("chat");
const loader = document.getElementById("loader");

// ENTER
document.getElementById("input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

// ENVIAR
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

  } catch (err) {
    loader.classList.add("hidden");
    addMessage("orion", "Error conectando al sistema");
  }
};

// MENSAJE USER
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

// ✨ ESCRITURA LIMPIA + BOTÓN VOZ
function typeMessage(text) {
  const wrapper = document.createElement("div");
  wrapper.className = "message orion";

  const bubble = document.createElement("div");
  bubble.className = "bubble";

  wrapper.appendChild(bubble);

  // botón voz (NO autoplay)
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
  };
};

// 🔊 TEXTO → VOZ (solo cuando presionas)
function speakText(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "es-ES";
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}
