/* --- DOM ELEMENT EXPORTS --- */
export const UI = {
    boot: document.getElementById('boot-screen'),
    chat: document.getElementById('chat-container'),
    input: document.getElementById('user-input'),
    sendBtn: document.getElementById('send-btn'),
    apiDot: document.getElementById('api-status-dot'),
    roomDisp: document.getElementById('room-display'),
    codeOverlay: document.getElementById('code-editor-overlay'),
    codeArea: document.getElementById('code-area'),
    previewFrame: document.getElementById('preview-frame'),
    adminPanel: document.getElementById('admin-panel'),
    copilotChat: document.getElementById('copilot-chat'),
    copilotInput: document.getElementById('copilot-input'),
    apiKeyInput: document.getElementById('api-key-input'),
    profileModal: document.getElementById('profile-modal'),
    profilePreview: document.getElementById('profile-avatar-preview'),
    profileNameInput: document.getElementById('edit-name'),
    videoGrid: document.getElementById('video-grid'),
    fileTransferUI: document.getElementById('file-transfer-ui'),
    progressBar: document.getElementById('progress-bar'),
    transferStatus: document.getElementById('transfer-status'),
    transferProgress: document.getElementById('transfer-progress'),
    galaxyCanvas: document.getElementById('galaxy-canvas'),
    
    // Modal Toggles
    toggleMedia: (active) => {
        const deck = document.getElementById('media-deck');
        if(active) deck.classList.add('active');
        else deck.classList.remove('active');
    },
    toggleAdmin: (active) => {
        const p = document.getElementById('admin-panel');
        if(active) p.classList.remove('hidden-ui'); else p.classList.add('hidden-ui');
    },
    toggleProfile: (active) => {
        const p = document.getElementById('profile-modal');
        if(active) p.classList.remove('hidden-ui'); else p.classList.add('hidden-ui');
    },
    toggleGithubModal: (active) => {
        const p = document.getElementById('github-modal');
        if(active) p.classList.remove('hidden-ui'); else p.classList.add('hidden-ui');
    },
    switchMediaTab: (tab) => {
        document.getElementById('tab-video').classList.add('hidden');
        document.getElementById('tab-radio').classList.add('hidden');
        document.getElementById('tab-'+tab).classList.remove('hidden');
        const vBtn = document.getElementById('tab-btn-video');
        const rBtn = document.getElementById('tab-btn-radio');
        if(tab === 'video') { vBtn.className = "flex-1 py-1.5 text-[10px] font-bold rounded bg-white/10 text-purple-300 shadow-sm border border-white/5"; rBtn.className = "flex-1 py-1.5 text-[10px] font-bold rounded text-gray-400 hover:text-white hover:bg-white/5 transition-all"; }
        else { rBtn.className = "flex-1 py-1.5 text-[10px] font-bold rounded bg-white/10 text-purple-300 shadow-sm border border-white/5"; vBtn.className = "flex-1 py-1.5 text-[10px] font-bold rounded text-gray-400 hover:text-white hover:bg-white/5 transition-all"; }
    },

    // Inputs
    ghOwner: document.getElementById('gh-owner'),
    ghRepo: document.getElementById('gh-repo'),
    ghPath: document.getElementById('gh-path'),
    ghToken: document.getElementById('gh-token'),
    
    // Buttons
    btnMediaDeck: document.getElementById('btn-media-deck'),
    btnShare: document.getElementById('btn-share'),
    btnCopyLog: document.getElementById('btn-copy-log'),
    btnProfile: document.getElementById('btn-profile'),
    btnKernel: document.getElementById('btn-kernel'),
    btnIde: document.getElementById('btn-ide'),
    btnAdmin: document.getElementById('btn-admin'),
    btnCloseDeck: document.getElementById('btn-close-deck'),
    tabBtnVideo: document.getElementById('tab-btn-video'),
    tabBtnRadio: document.getElementById('tab-btn-radio'),
    btnEnableVideo: document.getElementById('btn-enable-video'),
    btnDisableVideo: document.getElementById('btn-disable-video'),
    btnSendFileTrigger: document.getElementById('btn-send-file-trigger'),
    p2pFileInput: document.getElementById('p2p-file-input'),
    btnSaveApi: document.getElementById('btn-save-api'),
    btnResetSys: document.getElementById('btn-reset-sys'),
    btnUpAvatar: document.getElementById('btn-up-avatar'),
    avatarUpload: document.getElementById('avatar-upload'),
    btnSaveId: document.getElementById('btn-save-id'),
    btnCancel: document.getElementById('btn-cancel'),
    btnGenInvite: document.getElementById('btn-gen-invite'),
    btnCloseIde: document.getElementById('btn-close-ide'),
    btnPushGithub: document.getElementById('btn-push-github'),
    btnRunPreview: document.getElementById('btn-run-preview'),
    btnGenCode: document.getElementById('btn-gen-code'),
    btnAbort: document.getElementById('btn-abort'),
    btnInitUplink: document.getElementById('btn-init-uplink'),
    btnAiInput: document.getElementById('btn-ai-input')
};

/* --- RENDERING HELPERS --- */
export function escapeHtml(text) {
    if(!text) return "";
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function scrollToBottom() {
    UI.chat.scrollTo({ top: UI.chat.scrollHeight, behavior: 'smooth' });
}

export function purgeChat() {
    if (UI.chat.children.length > 50) {
        while (UI.chat.children.length > 50) {
            UI.chat.removeChild(UI.chat.firstChild);
        }
    }
}

export function updateStatus(active) {
    if(active) {
        UI.apiDot.className = "w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80] animate-pulse";
        UI.roomDisp.innerText = "PUBLIC GRID";
        UI.roomDisp.classList.add("text-green-400");
        UI.roomDisp.classList.remove("text-red-500");
    } else {
        UI.apiDot.className = "w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]";
        UI.roomDisp.innerText = "OFFLINE";
        UI.roomDisp.classList.remove("text-green-400");
        UI.roomDisp.classList.add("text-red-500");
    }
}

export function addSystemMessage(text, type = 'info') {
    const div = document.createElement('div');
    div.className = "flex justify-center my-4 z-10 msg-anim";
    let bg = "bg-purple-900/20 border-purple-500/20";
    let icon = "ℹ️";
    if(type === 'error') { bg = "bg-red-900/20 border-red-500/30"; icon = "⚠️"; }
    if(type === 'warning') { bg = "bg-yellow-900/20 border-yellow-500/20"; icon = "⚡"; }
    div.innerHTML = `<span class="px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest text-gray-300 border ${bg} flex items-center gap-2 backdrop-blur-md shadow-lg">${icon} ${text}</span>`;
    UI.chat.appendChild(div);
    scrollToBottom();
    purgeChat();
}

export function addUserMessage(text, isMe, senderName, senderAvatar) {
    const div = document.createElement('div');
    div.className = `flex gap-3 my-2 msg-anim ${isMe ? 'flex-row-reverse' : 'flex-row'}`;
    let avatarHTML = `<div class="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-[10px] font-bold text-white shrink-0 border border-white/10">?</div>`;
    if (senderAvatar) {
        if(senderAvatar.startsWith('data:') || senderAvatar.startsWith('http')) avatarHTML = `<div class="w-9 h-9 rounded-full overflow-hidden border border-white/20 shrink-0 shadow-md"><img src="${senderAvatar}" class="w-full h-full object-cover"></div>`;
        else avatarHTML = `<div class="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-lg shrink-0 border border-white/10">${senderAvatar}</div>`;
    }
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    if(isMe) {
        div.innerHTML = `${avatarHTML}<div class="flex flex-col items-end max-w-[80%]"><div class="bg-gradient-to-r from-purple-700 to-indigo-700 text-white p-3 rounded-2xl rounded-tr-none text-sm shadow-md border border-purple-500/30 break-words">${escapeHtml(text)}</div><div class="text-[9px] text-gray-500 mt-1 mr-1 font-mono">${time}</div></div>`;
    } else {
        div.innerHTML = `${avatarHTML}<div class="flex flex-col items-start max-w-[80%]"><div class="flex items-center gap-2 mb-1"><span class="text-[10px] text-cyan-400 font-bold font-header tracking-wide">${escapeHtml(senderName)}</span></div><div class="bg-white/10 border border-white/10 text-gray-100 p-3 rounded-2xl rounded-tl-none text-sm shadow-md break-words backdrop-blur-sm">${escapeHtml(text)}</div><div class="text-[9px] text-gray-500 mt-1 ml-1 font-mono">${time}</div></div>`;
    }
    UI.chat.appendChild(div);
    scrollToBottom();
    purgeChat();
}

export function addAIMessage(text) {
    const div = document.createElement('div');
    div.className = "flex gap-3 my-2 msg-anim";
    // Security: Sanitize here using global DOMPurify
    const htmlContent = DOMPurify.sanitize(marked.parse(text));
    div.innerHTML = `<div class="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-lg ring-1 ring-white/20 shrink-0 border border-cyan-400/50">AI</div><div class="flex-1 bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 p-4 rounded-2xl rounded-tl-none text-sm text-gray-200 shadow-md"><div class="markdown-body text-xs leading-relaxed">${htmlContent}</div></div>`;
    UI.chat.appendChild(div);
    scrollToBottom();
    document.querySelectorAll('pre code').forEach((el) => { hljs.highlightElement(el); });
    purgeChat();
}

export function addThinking(id, label = "AI") {
    const div = document.createElement('div');
    div.id = id;
    div.className = "flex gap-3 my-2 msg-anim";
    div.innerHTML = `<div class="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center animate-pulse text-[10px] font-bold border border-white/10">${label}</div><div class="flex items-center gap-2 h-10 bg-white/5 px-4 rounded-full border border-white/5"><span class="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></span><span class="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></span><span class="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></span><span class="text-[10px] text-cyan-400 ml-2 font-mono">PROCESSING</span></div>`;
    UI.chat.appendChild(div);
    scrollToBottom();
}

export function removeThinking(id) {
    const el = document.getElementById(id);
    if(el) el.remove();
}

export function showTyping(user) {
    let existing = document.getElementById('typing-indicator');
    if (!existing) {
        existing = document.createElement('div');
        existing.id = 'typing-indicator';
        existing.className = "flex gap-2 my-2 msg-anim text-[10px] text-gray-400 font-mono";
        UI.chat.appendChild(existing);
    }
    existing.innerHTML = `<span class="bg-white/5 px-2 py-1 rounded border border-white/5 shadow-inner">${user} typing...</span>`;
    scrollToBottom();
}

export function hideTyping(user) {
    // Simple hide logic for single user
    const existing = document.getElementById('typing-indicator');
    if(existing) existing.remove();
}

export function copySystemLog() {
    const logs = document.querySelectorAll('#chat-container > div');
    let text = "TERMOS GALACTIC - SYSTEM LOG\n==========================\n";
    logs.forEach(el => { const c = el.innerText.replace(/\n+/g, ' ').trim(); if(c && !c.includes("PROCESSING")) text += `${c}\n`; });
    navigator.clipboard.writeText(text).then(() => {
        addSystemMessage("System log copied.", "info");
    }).catch(err => addSystemMessage("Copy failed: " + err.message, "error"));
}
