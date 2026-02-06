import { CONFIG } from './config.js';
import * as UI from './ui.js';
import * as Network from './network.js';
import * as AI from './ai.js';
// Uncomment the line below if you downloaded marked.min.js to your lib folder
// import { marked } from '../lib/marked.min.js';

/* --- AUDIO ENGINE --- */
// We keep AudioFX here to ensure immediate interaction handling
const AudioFX = {
    ctx: null,
    init: function() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },
    playTone: function(freq, type, duration, vol = 0.05) {
        if (!this.ctx) return;
        if(this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        osc.detune.setValueAtTime(Math.random() * 10 - 5, this.ctx.currentTime);
        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },
    send: () => { AudioFX.init(); AudioFX.playTone(800, 'sine', 0.1); setTimeout(() => AudioFX.playTone(1200, 'sine', 0.1), 50); },
    receive: () => { AudioFX.init(); AudioFX.playTone(600, 'triangle', 0.15); },
    error: () => { AudioFX.init(); AudioFX.playTone(150, 'sawtooth', 0.4, 0.1); setTimeout(() => AudioFX.playTone(100, 'sawtooth', 0.2, 0.1), 100); },
    system: () => { AudioFX.init(); AudioFX.playTone(400, 'square', 0.05); setTimeout(() => AudioFX.playTone(600, 'square', 0.05), 50); setTimeout(() => AudioFX.playTone(1000, 'square', 0.1), 100); },
    boot: () => { 
        AudioFX.init(); 
        let t = 0; 
        [200, 300, 400, 600, 800, 1200].forEach((f, i) => { 
            setTimeout(() => AudioFX.playTone(f, 'sine', 0.1), i * 100); 
        }); 
    }
};

/* --- APP STATE --- */
let userProfile = {
    name: localStorage.getItem('termos_username') || 'User_' + Math.floor(Math.random() * 9999),
    avatar: localStorage.getItem('termos_avatar') || "👤"
};
let currentRoom = "public";
let typingTimeout = null;

/* --- INITIALIZATION --- */
window.addEventListener('load', () => {
    console.log("System Initializing...");
    
    // 1. Boot Sequence
    AudioFX.boot();
    setTimeout(() => {
        UI.bootScreen.style.opacity = '0';
        setTimeout(() => {
            UI.bootScreen.remove();
            startSystem();
        }, 800);
    }, 2000);

    // 2. Bind Events
    bindEvents();

    // 3. Start Visuals
    initGalaxy();
});

function startSystem() {
    // Check API Key
    const apiKey = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (!apiKey) {
        UI.addSystemMessage("⚠️ API Key Missing. Access Admin Panel.", "warning");
        AudioFX.error();
        // We don't auto-open admin on mobile to avoid popups, just log status
        UI.updateStatus(false);
    } else {
        UI.updateStatus(true);
        connectNetwork();
    }
    UI.input.focus();
}

function connectNetwork() {
    Network.connectMQTT(handleIncomingMessage);
}

/* --- EVENT BINDING --- */
function bindEvents() {
    // Input Handling
    UI.sendBtn.addEventListener('click', handleInput);
    UI.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleInput();
        }
        // Typing Indicator Logic
        Network.broadcastTyping(true);
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => Network.broadcastTyping(false), 1000);
    });

    // Header Buttons
    UI.btnMediaDeck.addEventListener('click', () => UI.toggleMedia(true));
    UI.btnShare.addEventListener('click', shareApp);
    UI.btnCopyLog.addEventListener('click', copySystemLog);
    UI.btnProfile.addEventListener('click', () => UI.toggleProfile(true));
    UI.btnKernel.addEventListener('click', triggerKernelThought);
    UI.btnIde.addEventListener('click', toggleCodeEditor);
    UI.btnAdmin.addEventListener('click', () => UI.toggleAdmin(true));

    // Media Deck
    UI.btnCloseDeck.addEventListener('click', () => UI.toggleMedia(false));
    UI.tabBtnVideo.addEventListener('click', () => UI.switchMediaTab('video'));
    UI.tabBtnRadio.addEventListener('click', () => UI.switchMediaTab('radio'));
    
    UI.btnEnableVideo.addEventListener('click', () => {
        Network.startWebRTC();
        UI.btnEnableVideo.classList.add('hidden-ui');
        UI.btnDisableVideo.classList.remove('hidden-ui');
        UI.fileTransferUI.classList.remove('hidden-ui');
    });
    
    UI.btnDisableVideo.addEventListener('click', () => {
        Network.stopWebRTC();
        UI.btnDisableVideo.classList.add('hidden-ui');
        UI.btnEnableVideo.classList.remove('hidden-ui');
        UI.fileTransferUI.classList.add('hidden-ui');
        UI.videoGrid.innerHTML = ''; // Clear grid
    });

    // File Transfer
    UI.btnSendFileTrigger.addEventListener('click', () => UI.p2pFileInput.click());
    UI.p2pFileInput.addEventListener('change', (e) => Network.handleFileSelect(e.target));

    // Admin Panel
    UI.btnSaveApi.addEventListener('click', () => {
        const key = UI.apiKeyInput.value.trim();
        if (key) {
            localStorage.setItem(CONFIG.STORAGE_KEY, key);
            UI.updateStatus(true);
            connectNetwork();
            UI.addSystemMessage("API Key Updated.", "info");
            UI.toggleAdmin(false);
        }
    });
    UI.btnResetSys.addEventListener('click', () => localStorage.clear() || location.reload());

    // Profile Modal
    UI.btnUpAvatar.addEventListener('click', () => UI.avatarUpload.click());
    UI.avatarUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            UI.profilePreview.innerHTML = `<img src="${evt.target.result}" class="w-full h-full object-cover">`;
            userProfile.tempAvatar = evt.target.result;
        };
        reader.readAsDataURL(file);
    });
    
    UI.btnSaveId.addEventListener('click', () => {
        const name = UI.editName.value.trim();
        if(name) userProfile.name = name;
        if(userProfile.tempAvatar) userProfile.avatar = userProfile.tempAvatar;
        
        localStorage.setItem('termos_username', userProfile.name);
        localStorage.setItem('termos_avatar', userProfile.avatar);
        UI.addSystemMessage(`Identity Updated: ${userProfile.name}`, "info");
        UI.toggleProfile(false);
    });

    UI.btnCancel.addEventListener('click', () => UI.toggleProfile(false));
    UI.btnGenInvite.addEventListener('click', generateInviteLink);

    // IDE
    UI.btnCloseIde.addEventListener('click', toggleCodeEditor);
    UI.btnRunPreview.addEventListener('click', runCode);
    UI.btnGenCode.addEventListener('click', sendCopilot);
    UI.btnPushGithub.addEventListener('click', () => UI.toggleGithubModal(true));
    UI.btnAbort.addEventListener('click', () => UI.toggleGithubModal(false));
    UI.btnInitUplink.addEventListener('click', executeGitHubPush);
}

/* --- CORE LOGIC --- */

async function handleInput() {
    const text = UI.input.value.trim();
    if (!text) return;
    
    UI.input.value = '';
    Network.broadcastTyping(false); // Stop typing
    AudioFX.send();

    if (text.startsWith('/')) {
        handleCommand(text);
        return;
    }

    // Normal Chat Message
    UI.addUserMessage(text, true, userProfile.name, userProfile.avatar);
    Network.sendMessage("termos/public", {
        type: 'chat',
        user: userProfile.name,
        avatar: userProfile.avatar,
        text: text,
        ts: Date.now()
    });
}

function handleCommand(cmdStr) {
    const parts = cmdStr.split(' ');
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ');

    switch(cmd) {
        case '/ai': 
            if(arg) processAICommand(arg); 
            else UI.addSystemMessage("Usage: /ai [prompt]", "warning");
            break;
        case '/join': 
            if(arg) joinRoom(arg); 
            else UI.addSystemMessage("Usage: /join [room]", "warning");
            break;
        case '/clear': UI.chat.innerHTML = ''; break;
        case '/kernel': triggerKernelThought(); break;
        case '/video': UI.toggleMedia(true); break;
        default: UI.addSystemMessage(`Unknown command: ${cmd}`, "warning"); AudioFX.error();
    }
}

async function processAICommand(prompt) {
    UI.addUserMessage(`/ai ${prompt}`, true, userProfile.name, userProfile.avatar);
    const id = 'ai-' + Date.now();
    UI.addThinking(id);
    
    try {
        const messages = [
            { role: "system", content: "You are TermOS Kernel v3.0. Be concise and cyberpunk." },
            { role: "user", content: prompt }
        ];
        const reply = await AI.getAIResponse(messages);
        UI.removeThinking(id);
        UI.addAIMessage(reply);
    } catch (e) {
        UI.removeThinking(id);
        UI.addSystemMessage("AI Error: " + e.message, "error");
    }
}

function handleIncomingMessage(msg) {
    try {
        const payload = JSON.parse(msg.payloadString);
        const sender = payload.user;
        
        if (sender === userProfile.name) return;

        switch (payload.type) {
            case 'chat':
                AudioFX.receive();
                UI.addUserMessage(payload.text, false, sender, payload.avatar);
                break;
            case 'join':
                UI.addSystemMessage(`${sender} entered the sector.`, "info");
                break;
            case 'typing':
                payload.isTyping ? UI.showTyping(sender) : UI.hideTyping(sender);
                break;
            case 'webrtc':
                Network.handleWebRTCMessage(payload);
                break;
        }
    } catch (e) {
        console.error("MQTT Parse Error", e);
    }
}

function joinRoom(room) {
    if (room === currentRoom) return;
    currentRoom = room;
    UI.addSystemMessage(`Switching frequency to: ${room.toUpperCase()}...`, "info");
    // Logic to unsubscribe old and subscribe new would go here in network.js
    // For now, we just notify
    Network.sendMessage("termos/public", { type: 'leave', user: userProfile.name });
    currentRoom = room;
    UI.updateStatus(true);
    UI.addSystemMessage(`Joined ${room.toUpperCase()}`, "info");
}

/* --- UTILS & FEATURES --- */

function shareApp() {
    const url = window.location.href;
    if (navigator.share) {
        navigator.share({ title: 'TermOS Galactic', text: 'Join my session.', url: url });
    } else {
        navigator.clipboard.writeText(url).then(() => UI.addSystemMessage("Link copied!", "info"));
    }
}

function generateInviteLink() {
    try {
        const data = { r: currentRoom };
        const b64 = btoa(JSON.stringify(data));
        const url = `${window.location.origin}${window.location.pathname}?s=${b64}`;
        navigator.clipboard.writeText(url).then(() => {
            UI.addSystemMessage("Invite link copied.", "info");
            AudioFX.system();
        });
    } catch (e) { UI.addSystemMessage("Error generating invite", "error"); }
}

async function triggerKernelThought() {
    const id = 'kernel-' + Date.now();
    UI.addThinking(id, "OS");
    AudioFX.system();
    try {
        const messages = [
            { role: "system", content: "You are TermOS Kernel. Give a cryptic system update." },
            { role: "user", content: "System status?" }
        ];
        const reply = await AI.getAIResponse(messages);
        UI.removeThinking(id);
        UI.addSystemMessage("KERNEL: " + reply, "info");
    } catch (e) {
        UI.removeThinking(id);
        UI.addSystemMessage("Kernel Panic", "error");
    }
}

/* --- IDE LOGIC --- */
function toggleCodeEditor() {
    const isHidden = UI.codeOverlay.classList.contains('hidden-ui');
    if (isHidden) {
        if(!UI.codeArea.value) UI.codeArea.value = "<h1>Hello TermOS</h1>";
        UI.codeOverlay.classList.remove('hidden-ui');
        UI.codeOverlay.classList.add('flex-ui');
    } else {
        UI.codeOverlay.classList.add('hidden-ui');
        UI.codeOverlay.classList.remove('flex-ui');
    }
}

function runCode() {
    const code = UI.codeArea.value;
    const doc = UI.previewFrame.contentDocument || UI.previewFrame.contentWindow.document;
    doc.open();
    doc.write(code);
    doc.close();
}

async function sendCopilot() {
    const prompt = UI.copilotInput.value.trim();
    if(!prompt) return;
    UI.copilotInput.value = '';
    
    // Show user prompt
    const uDiv = document.createElement('div');
    uDiv.className = "flex justify-end";
    uDiv.innerHTML = `<div class="bg-purple-900/50 text-purple-100 p-2 rounded-lg text-xs max-w-[90%] break-words border border-purple-500/20 font-mono">${prompt}</div>`;
    UI.copilotChat.appendChild(uDiv);

    // Thinking
    const tDiv = document.createElement('div');
    tDiv.className = "text-cyan-500 text-xs italic animate-pulse font-mono";
    tDiv.innerText = "GENERATING...";
    UI.copilotChat.appendChild(tDiv);

    try {
        const reply = await AI.getAIResponse([
            { role: "system", content: "Return ONLY raw HTML code. No markdown ticks." },
            { role: "user", content: prompt }
        ]);
        tDiv.remove();
        
        const aDiv = document.createElement('div');
        aDiv.className = "bg-black/60 border border-cyan-500/30 p-2 rounded text-[10px] font-mono text-cyan-100 max-h-40 overflow-y-auto w-full shadow-inner whitespace-pre-wrap my-2";
        aDiv.innerText = reply;
        UI.copilotChat.appendChild(aDiv);
        UI.copilotChat.scrollTop = UI.copilotChat.scrollHeight;
    } catch (e) {
        tDiv.innerText = "ERROR: " + e.message;
        tDiv.classList.add('text-red-500');
    }
}

async function executeGitHubPush() {
    const owner = UI.ghOwner.value;
    const repo = UI.ghRepo.value;
    const path = UI.ghPath.value;
    const token = UI.ghToken.value;
    const content = UI.codeArea.value;

    if(!owner || !repo || !path || !token) return alert("Fill all fields");
    
    UI.toggleGithubModal(false);
    UI.addSystemMessage("Uploading to GitHub...", "info");

    try {
        const encoded = btoa(unescape(encodeURIComponent(content)));
        // 1. Check if file exists (Get SHA)
        const shaRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        let sha = null;
        if(shaRes.ok) { const data = await shaRes.json(); sha = data.sha; }

        // 2. Put File
        const body = { message: "TermOS Commit", content: encoded };
        if(sha) body.sha = sha;

        const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if(putRes.ok) UI.addSystemMessage("GitHub Push Successful.", "info");
        else throw new Error("Auth Failed");

    } catch(e) { UI.addSystemMessage("GitHub Error: " + e.message, "error"); }
}

/* --- BACKGROUND ANIMATION --- */
function initGalaxy() {
    const canvas = UI.galaxyCanvas;
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    const stars = Array(200).fill().map(() => ({ x: Math.random() * w, y: Math.random() * h, z: Math.random() * 2, o: Math.random(), s: Math.random() * 2 }));
    let mouseX = w / 2;
    let mouseY = h / 2;
    
    window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
    
    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Trail effect
        ctx.fillRect(0, 0, w, h);
        stars.forEach(s => {
            const dx = (mouseX - w/2) * 0.005 * s.z;
            const dy = (mouseY - h/2) * 0.005 * s.z;
            s.x -= dx; s.y -= dy;
            if (s.x < 0) s.x = w; if (s.x > w) s.x = 0;
            if (s.y < 0) s.y = h; if (s.y > h) s.y = 0;
            const size = s.s + (s.z * 0.5);
            const opacity = s.o * (0.5 + Math.random() * 0.5);
            ctx.fillStyle = `rgba(168, 85, 247, ${opacity})`;
            if (Math.random() > 0.9) ctx.fillStyle = `rgba(34, 211, 238, ${opacity})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, size, 0, Math.PI * 2);
            ctx.fill();
        });
        requestAnimationFrame(draw);
    }
    draw();
    window.addEventListener('resize', () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; });
}
