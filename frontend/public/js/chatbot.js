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

    // ── Detectar intención de crear proyecto ──
    function extractProjectCreationDetails(message) {
        const msg = message.trim();
        const patterns = [
            /^(?:quiero\s+)?crear\s+(?:un\s+)?(?:nuevo\s+)?proyecto\s+(?:llamado\s+|con\s+nombre\s+)?(.+?)(?:\s+con\s+descripci[oó]n\s+(.+))?$/i,
            /^nuevo\s+proyecto\s+(.+?)(?:\s+con\s+descripci[oó]n\s+(.+))?$/i,
            /^hacer\s+(?:un\s+)?proyecto\s+(.+?)(?:\s+con\s+descripci[oó]n\s+(.+))?$/i,
            /^proyecto:\s*(.+?)(?:\s*,\s*(.+))?$/i,
            /^agregar\s+(?:un\s+)?proyecto\s+(.+)/i,
        ];
        for (const pattern of patterns) {
            const match = msg.match(pattern);
            if (match && match[1]?.trim().length > 0) {
                return {
                    name: match[1].trim().replace(/['"]/g, ''),
                    description: match[2]?.trim().replace(/['"]/g, '') || '',
                    intent: 'create_project'
                };
            }
        }
        return null;
    }

    function isAICommand(message) {
        const patterns = [
            /crear\s+tarea/i, /nueva\s+tarea/i, /asignar\s+a/i,
            /cambiar\s+prioridad/i, /cambiar\s+estado/i,
            /fecha\s+\d{1,2}\/\d{1,2}\/\d{4}/i,
            /buscar\s+tarea/i, /eliminar\s+tarea/i, /completar\s+tarea/i
        ];
        return patterns.some(p => p.test(message));
    }

    function isProjectRelated(message) {
        const keywords = [
            'proyecto', 'tarea', 'task', 'project', 'crear', 'nuevo', 'asignar',
            'prioridad', 'fecha', 'estado', 'tablero', 'dashboard', 'miembro',
            'completar', 'eliminar', 'buscar', 'sprint', 'scrum', 'progreso',
            'ayuda', 'help', 'cómo', 'qué', 'cuándo', 'funciona', 'uso'
        ];
        const lower = message.toLowerCase();
        return keywords.some(k => lower.includes(k)) || isAICommand(message) || lower.length < 30;
    }

    // ── Crear proyecto directamente via backend ──
    async function createProjectFromChat(name, description) {
        try {
            console.log('[Chatbot] Creando proyecto:', name);

            const response = await fetch('/api/projects/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name: name.trim(), description: description || '', color: '#9604DB' })
            });

            const data = await response.json();
            console.log('[Chatbot] Respuesta:', data);

            if (response.status === 401) {
                return { success: false, error: 'Sesión expirada. Recarga la página e inicia sesión.' };
            }

            if (data.success && data.project) {
                if (typeof loadProjects === 'function') await loadProjects();
                if (typeof loadStats === 'function') await loadStats();
                if (typeof showToast === 'function') showToast(`✨ Proyecto "${name}" creado`);

                return {
                    success: true,
                    project: data.project,
                    message: `✅ Proyecto creado exitosamente:\n\n📁 ${name}\n${description ? '📝 ' + description + '\n' : ''}\nYa aparece en tu dashboard. ¿Quieres agregar tareas?`
                };
            }

            return { success: false, error: data.message || 'Error al crear proyecto' };
        } catch (error) {
            console.error('[Chatbot] Error:', error);
            return { success: false, error: 'Error de conexión: ' + error.message };
        }
    }

    async function sendToAIBackend(message) {
        try {
            const response = await fetch(AI_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ message })
            });
            return await response.json();
        } catch (error) {
            return { success: false, error: 'Error de conexión' };
        }
    }

    async function sendToDeepSeek(message) {
        const messages = [
            {
                role: "system",
                content: `Eres un asistente especializado en gestión de proyectos (TaskFlow).
Ayuda EXCLUSIVAMENTE con temas de gestión de proyectos y tareas.
Para crear proyectos usa: "crear proyecto [nombre]".
Respuestas concisas en español, máximo 3 párrafos.`
            },
            ...chatHistory.slice(-6),
            { role: "user", content: message }
        ];

        try {
            const response = await fetch(DEEPSEEK_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${DEEPSEEK_API_KEY}` },
                body: JSON.stringify({ model: "deepseek-chat", messages, max_tokens: 800, temperature: 0.7 })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || 'API error');
            const text = data.choices[0].message.content.trim();
            chatHistory.push({ role: "user", content: message });
            chatHistory.push({ role: "assistant", content: text });
            return { success: true, text };
        } catch (error) {
            console.error('[Chatbot] DeepSeek error:', error);
            return {
                success: true,
                text: 'Puedo ayudarte con la gestión de proyectos:\n• "crear proyecto MiApp"\n• "crear tarea Diseñar logo"\n• "buscar tareas pendientes"'
            };
        }
    }

    async function generateBotResponse(incomingMessageDiv) {
        const messageElement = incomingMessageDiv.querySelector(".message-text");
        const userMessage = userData.message;

        console.log('[Chatbot] Mensaje recibido:', userMessage);

        // 1. Crear proyecto
        const projectDetails = extractProjectCreationDetails(userMessage);
        if (projectDetails) {
            console.log('[Chatbot] → Crear proyecto:', projectDetails.name);
            const result = await createProjectFromChat(projectDetails.name, projectDetails.description);
            messageElement.innerText = result.success ? result.message : `❌ ${result.error}`;
            if (!result.success) messageElement.style.color = "#ef4444";
            chatHistory.push({ role: "user", content: userMessage });
            chatHistory.push({ role: "assistant", content: messageElement.innerText });
            userData.file = {};
            incomingMessageDiv.classList.remove("thinking");
            scrollToLatest();
            return;
        }

        // 2. Comandos de tareas
        if (isAICommand(userMessage)) {
            console.log('[Chatbot] → Comando AI backend');
            const response = await sendToAIBackend(userMessage);
            if (response.success && response.result) {
                let text = response.result.message || 'Comando procesado.';
                if (response.result.task) text += `\n\n📋 ${response.result.task.title}`;
                messageElement.innerText = text;
                chatHistory.push({ role: "user", content: userMessage });
                chatHistory.push({ role: "assistant", content: text });
                if (response.result.task && typeof loadProject === 'function') loadProject();
            } else {
                messageElement.innerText = 'No pude procesar el comando. Ejemplo: "crear tarea Revisar diseño"';
            }
            userData.file = {};
            incomingMessageDiv.classList.remove("thinking");
            scrollToLatest();
            return;
        }

        // 3. No relacionado
        if (!isProjectRelated(userMessage)) {
            const offTopic = 'Soy un asistente especializado en TaskFlow 📋\n\nPrueba:\n• "crear proyecto MiApp"\n• "crear tarea Diseñar logo"\n• "¿cómo funciona el tablero?"';
            messageElement.innerText = offTopic;
            chatHistory.push({ role: "user", content: userMessage });
            chatHistory.push({ role: "assistant", content: offTopic });
            userData.file = {};
            incomingMessageDiv.classList.remove("thinking");
            scrollToLatest();
            return;
        }

        // 4. Pregunta general → DeepSeek
        const response = await sendToDeepSeek(userMessage);
        messageElement.innerText = response.text || 'No pude generar una respuesta.';

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

        const outgoingContent = `<div class="message-text"></div>${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment" />` : ""}`;
        const outgoingDiv = createMessageElement(outgoingContent, "user-message");
        outgoingDiv.querySelector(".message-text").textContent = userData.message;
        chatBody.appendChild(outgoingDiv);
        scrollToLatest();

        setTimeout(() => {
            const botContent = `
                <svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
                    <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"></path>
                </svg>
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
            if (!file.type.startsWith('image/')) { alert('Solo se permiten imágenes.'); fileInput.value = ""; return; }
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

    if (fileCancelButton) fileCancelButton.addEventListener("click", () => { userData.file = {}; fileUploadWrapper.classList.remove("file-uploaded"); });
    sendMessageButton.addEventListener("click", (e) => handleOutgoingMessage(e));
    const fileUploadBtn = document.querySelector("#file-upload");
    if (fileUploadBtn) fileUploadBtn.addEventListener("click", () => fileInput && fileInput.click());
    if (chatbotToggler) chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
    if (closeChatbot) closeChatbot.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
    const emojiPickerBtn = document.querySelector("#emoji-picker");
    if (emojiPickerBtn) {
        emojiPickerBtn.addEventListener("click", () => document.body.classList.toggle("show-emoji-picker"));
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.emoji-mart') && !e.target.closest('#emoji-picker')) document.body.classList.remove('show-emoji-picker');
        });
    }
    console.log('[Chatbot] Inicializado correctamente.');
}
