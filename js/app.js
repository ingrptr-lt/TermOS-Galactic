import { connectMQTT, sendMessage } from './network.js';
import { getAIResponse } from './ai.js';
import { UI, addSystemMessage } from './ui.js';
import './sw-reg.js'; // Register PWA

// Global State
let userProfile = { name: "User", avatar: "👤" };

async function handleInput() {
  const text = UI.input.value.trim();
  if (!text) return;
  
  UI.input.value = ''; // Clear input

  if (text.startsWith('/ai')) {
    const prompt = text.substring(4);
    try {
      const reply = await getAIResponse([
        { role: "system", content: "You are TermOS." },
        { role: "user", content: prompt }
      ]);
      addSystemMessage(reply, 'info');
    } catch (e) {
      addSystemMessage("AI Error: " + e.message, 'error');
    }
  } else {
    // Handle Chat message via MQTT
    sendMessage("termos/public", {
      type: 'chat',
      user: userProfile.name,
      text: text
    });
  }
}

// Listeners
UI.sendBtn.addEventListener('click', handleInput);
UI.input.addEventListener('keydown', (e) => { if(e.key === 'Enter') handleInput(); });

// Initialize
window.addEventListener('load', () => {
  connectMQTT((msg) => {
    // Handle incoming messages
    console.log("Message:", msg);
  });
});
