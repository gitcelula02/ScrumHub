// Dashboard Chatbot Integration
const DEEPSEEK_API_KEY = "sk-1979a0e499854dab931fdeb14fd9b02e";
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const AI_API_URL = '/api/ai/chat';

const userData = { message: null, file: { data: null, mime_type: null } };
const chatHistory = [];

const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const fileCancelButton = document.querySelector("#file-cancel");
const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeChatbot = document.querySelector("#close-chatbot");
const initialInputHeight = messageInput ? messageInput.scrollHeight : 56;

if (!chatBody || !messageInput || !sendMessageButton) {
    console.warn('Chatbot elements not found. Skipping chatbot initialization.');
} else {
    initializeChatbot();
}

function initializeChatbot() {
    const scrollToLatest = () => chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

    const createMessageElement = (content, ...classes) => {
        const div = document.createElement("div");
        div.classList.add("message", ...classes);
        div.innerHTML = content;
        return div;
    };

    function displayMessage(role, text, type = 'message') {
        const botSVG = `<svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
            <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"></path>
        </svg>`;

        let content = '';
        let classes = [];

        if (role === 'user') {
            classes = ["user-message"];
            content = `<div class="message-text">${text}</div>`;
        } else {
            classes = ["bot-message"];
            content = `${botSVG}<div class="message-text">${text}</div>`;
        }

        const msgDiv = createMessageElement(content, ...classes);
        chatBody.appendChild(msgDiv);
        scrollToLatest();
        return msgDiv;
    }

    async function loadChatHistory() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const projectId = urlParams.get('id');
            const url = `/api/ai/history${projectId ? `?projectId=${projectId}` : ''}`;

            const response = await fetch(url, { credentials: 'include' });
            const data = await response.json();

            if (data.success && data.history) {
                // Limpiar mensajes iniciales si hay historia
                if (data.history.length > 0) {
                    chatBody.innerHTML = '';
                    data.history.forEach(msg => {
                        displayMessage(msg.role, msg.text, msg.type);
                        chatHistory.push({ role: msg.role, content: msg.text });
                    });
                }
            }
        } catch (error) {
            console.error('[Chatbot] Error cargando historial:', error);
        }
    }

    function isProjectRelated(message) {
        const keywords = [
            'proyecto', 'tarea', 'task', 'project', 'crear', 'nuevo', 'asignar',
            'prioridad', 'fecha', 'estado', 'tablero', 'dashboard', 'miembro',
            'completar', 'eliminar', 'buscar', 'sprint', 'scrum', 'progreso',
            'ayuda', 'help', 'cómo', 'qué', 'cuándo', 'funciona', 'uso'
        ];
        const lower = message.toLowerCase();
        return keywords.some(k => lower.includes(k)) || lower.length < 30;
    }

    async function sendToAIBackend(message) {
        try {
            // Obtener el projectId de la URL si estamos en un tablero específico
            const urlParams = new URLSearchParams(window.location.search);
            const projectId = urlParams.get('id');

            const response = await fetch(AI_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ message, projectId })
            });
            return await response.json();
        } catch (error) {
            console.error('[Chatbot] Error de conexión:', error);
            return { success: false, error: 'Error de conexión con el servidor' };
        }
    }

    async function generateBotResponse(incomingMessageDiv) {
        const messageElement = incomingMessageDiv.querySelector(".message-text");
        const userMessage = userData.message;

        console.log('[Chatbot] Procesando:', userMessage);

        // Enviar todo al backend unificado
        const response = await sendToAIBackend(userMessage);
        
        if (response.success && response.result) {
            const result = response.result;
            let text = result.message || 'Comando procesado.';
            messageElement.innerText = text;

            // Manejar acciones especiales basadas en el tipo de respuesta
            if (result.type === 'project_created') {
                console.log('[Chatbot] Proyecto creado, refrescando dashboard...');
                if (typeof loadProjects === 'function') await loadProjects();
                if (typeof loadStats === 'function') await loadStats();
                if (typeof showToast === 'function') showToast(`✨ Proyecto creado exitosamente`);
            }

            if (result.type === 'task_created' || result.type === 'task_updated') {
                console.log('[Chatbot] Tarea modificada, refrescando tablero...');
                if (typeof loadProject === 'function') loadProject();
                if (typeof loadTasks === 'function') loadTasks();
                if (typeof showToast === 'function') showToast(`✅ Tarea actualizada`);
            }

            chatHistory.push({ role: "user", content: userMessage });
            chatHistory.push({ role: "assistant", content: text });
        } else {
            messageElement.innerText = 'Lo siento, tuve un problema al procesar tu mensaje. Por favor, intenta de nuevo.';
            messageElement.style.color = "#ef4444";
        }

        userData.file = {};
        incomingMessageDiv.classList.remove("thinking");
        scrollToLatest();
    }

    const handleOutgoingMessage = (e) => {
        e.preventDefault();
        userData.message = messageInput.value.trim();
        if (!userData.message && !userData.file.data) return;

        messageInput.value = "";
        fileUploadWrapper.classList.remove("file-uploaded");
        messageInput.dispatchEvent(new Event("input"));

        const outgoingContent = `
            <div class="message-text"></div>
            ${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment" />` : ""}
        `;
        const outgoingDiv = createMessageElement(outgoingContent, "user-message");
        outgoingDiv.querySelector(".message-text").textContent = userData.message;
        chatBody.appendChild(outgoingDiv);
        scrollToLatest();

        setTimeout(() => {
            const botSVG = `<svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
                <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"></path>
            </svg>`;
            const botContent = `
                ${botSVG}
                <div class="message-text">
                    <div class="thinking-indicator">
                        <div class="dot"></div><div class="dot"></div><div class="dot"></div>
                    </div>
                </div>`;
            const incomingDiv = createMessageElement(botContent, "bot-message", "thinking");
            chatBody.appendChild(incomingDiv);
            scrollToLatest();
            generateBotResponse(incomingDiv);
        }, 600);
    };

    messageInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && messageInput.value.trim() && !e.shiftKey && window.innerWidth > 768) {
            handleOutgoingMessage(e);
        }
    });

    messageInput.addEventListener("input", () => {
        messageInput.style.height = `${initialInputHeight}px`;
        messageInput.style.height = `${messageInput.scrollHeight}px`;
        const chatForm = document.querySelector(".chat-form");
        if (chatForm) chatForm.style.borderRadius = messageInput.scrollHeight > initialInputHeight ? "15px" : "32px";
    });

    if (fileInput) {
        fileInput.addEventListener("change", () => {
            const file = fileInput.files[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) {
                alert('Solo se permiten imágenes.');
                fileInput.value = "";
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                fileUploadWrapper.querySelector("img").src = e.target.result;
                fileUploadWrapper.classList.add("file-uploaded");
                userData.file = { data: e.target.result.split(",")[1], mime_type: file.type };
                fileInput.value = "";
            };
            reader.readAsDataURL(file);
        });
    }

    if (fileCancelButton) {
        fileCancelButton.addEventListener("click", () => {
            userData.file = {};
            fileUploadWrapper.classList.remove("file-uploaded");
        });
    }

    sendMessageButton.addEventListener("click", (e) => handleOutgoingMessage(e));

    const fileUploadBtn = document.querySelector("#file-upload");
    if (fileUploadBtn) fileUploadBtn.addEventListener("click", () => fileInput && fileInput.click());

    if (chatbotToggler) chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
    if (closeChatbot) closeChatbot.addEventListener("click", () => document.body.classList.remove("show-chatbot"));

    const emojiPickerBtn = document.querySelector("#emoji-picker");
    if (emojiPickerBtn) {
        emojiPickerBtn.addEventListener("click", () => document.body.classList.toggle("show-emoji-picker"));
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.emoji-mart') && !e.target.closest('#emoji-picker')) {
                document.body.classList.remove('show-emoji-picker');
            }
        });
    }

    // Cargar historial al iniciar
    loadChatHistory();
    console.log('[Chatbot] Inicializado correctamente.');
}
