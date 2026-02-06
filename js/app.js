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
import { toggleMedia, startWebRTC, stopWebRTC, handleFileSelect, switchMediaTab } from './network.js';
import { toggleAdmin, toggleProfile, saveApiKey, saveProfile, generateInviteLink, shareApp, copySystemLog, resetSystem, triggerKernelThought, toggleCodeEditor, sendCopilot, executeGitHubPush, runCode } from './main-logic.js'; // Assuming you create main-logic.js

document.addEventListener('DOMContentLoaded', () => {
    // Header Buttons
    document.getElementById('btn-media-deck').addEventListener('click', toggleMedia);
    document.getElementById('btn-share').addEventListener('click', shareApp);
    document.getElementById('btn-copy-log').addEventListener('click', copySystemLog);
    document.getElementById('btn-profile').addEventListener('click', toggleProfile);
    document.getElementById('btn-kernel').addEventListener('click', triggerKernelThought);
    document.getElementById('btn-ide').addEventListener('click', toggleCodeEditor);
    document.getElementById('btn-admin').addEventListener('click', toggleAdmin);

    // Input Area
    document.getElementById('btn-ai-input').addEventListener('click', openKernelInput); // Assuming this exists
    
    // Media Deck
    document.getElementById('btn-close-deck').addEventListener('click', toggleMedia);
    document.getElementById('tab-btn-video').addEventListener('click', () => switchMediaTab('video'));
    document.getElementById('tab-btn-radio').addEventListener('click', () => switchMediaTab('radio'));
    document.getElementById('btn-enable-video').addEventListener('click', startWebRTC);
    document.getElementById('btn-disable-video').addEventListener('click', stopWebRTC);
    document.getElementById('btn-send-file-trigger').addEventListener('click', () => document.getElementById('p2p-file-input').click());
    document.getElementById('p2p-file-input').addEventListener('change', handleFileSelect);

    // Admin Panel
    document.getElementById('btn-save-api').addEventListener('click', saveApiKey);
    document.getElementById('btn-reset-sys').addEventListener('click', resetSystem);

    // Profile Modal
    document.getElementById('btn-up-avatar').addEventListener('click', () => document.getElementById('avatar-upload').click());
    document.getElementById('btn-save-id').addEventListener('click', saveProfile);
    document.getElementById('btn-cancel').addEventListener('click', toggleProfile);
    document.getElementById('btn-gen-invite').addEventListener('click', generateInviteLink);
    document.getElementById('lang-select').addEventListener('change', changeLanguage);

    // GitHub Modal
    document.getElementById('btn-abort').addEventListener('click', () => toggleGitHubModal(false));
    document.getElementById('btn-init-uplink').addEventListener('click', executeGitHubPush);
    
    // IDE
    document.getElementById('btn-push-github').addEventListener('click', () => toggleGitHubModal(true));
    document.getElementById('btn-close-ide').addEventListener('click', toggleCodeEditor);
    document.getElementById('btn-gen-code').addEventListener('click', sendCopilot);
    document.getElementById('btn-run-preview').addEventListener('click', runCode);
});
