import { CONFIG } from './config.js';

export const UI = {
  // Elements
  chat: document.getElementById('chat-container'),
  input: document.getElementById('user-input'),
  sendBtn: document.getElementById('send-btn'),
  // ... other elements ...
};

// Helper: Purge old messages (Performance)
export function purgeChat() {
  if (UI.chat.children.length > 50) {
    while (UI.chat.children.length > 50) {
      UI.chat.removeChild(UI.chat.firstChild);
    }
  }
}

// Helper: Add System Message
export function addSystemMessage(text, type = 'info') {
  const div = document.createElement('div');
  // ... CSS Classes ...
  UI.chat.appendChild(div);
  purgeChat();
}
