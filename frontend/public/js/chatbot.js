// Dashboard Chatbot Integration with DeepSeek AI and AIChat
const DEEPSEEK_API_KEY = "sk-1979a0e499854dab931fdeb14fd9b02e";
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const AI_API_URL = '/api/ai/chat';

const userData = {
    message: null,
    file: {
        data: null,
        mime_type: null
    }
};

const chatHistory = []; // Format: {role: "user"|"assistant", content: "text"}

// DOM Elements
const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const fileCancelButton = document.querySelector("#file-cancel");
const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeChatbot = document.querySelector("#close-chatbot");
const initialInputHeight = messageInput ? messageInput.scrollHeight : 56;

// Check if required DOM elements exist
if (!chatBody || !messageInput || !sendMessageButton) {
    console.warn('Chatbot elements not found. Skipping chatbot initialization.');
} else {
    initializeChatbot();
}

function initializeChatbot() {
    // Scroll to the latest message
    const scrollToLatestMessage = () => { 
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
    };

    // Create message element with dynamic classes and return it
    const createMessageElement = (content, ...classes) => {
        const div = document.createElement("div");
        div.classList.add("message", ...classes);
        div.innerHTML = content;
        return div;
    };

    // Check if message is a command for AI backend
    function isAICommand(message) {
        const commandPatterns = [
            /crear\s+(tarea|proyecto)/i,
            /asignar\s+a/i,
            /cambiar\s+prioridad/i,
            /fecha\s+\d{2}\/\d{2}\/\d{4}/i,
            /prioridad\s+(alta|media|baja)/i,
            /buscar/i,
            /mover\s+tarea/i,
            /eliminar\s+tarea/i,
            /completar\s+tarea/i,
            /estado\s+(por hacer|en progreso|en revisión|completada)/i
        ];
        return commandPatterns.some(pattern => pattern.test(message));
    }

    // Check if message is about creating a project and extract details
    function extractProjectCreationDetails(message) {
        const projectPatterns = [
            /(?:crear|nuevo|hacer)\s+(?:un\s+)?proyecto\s+(?:llamado\s+)?['"]?([^'"\.,;!?]+)['"]?(?:\s+con\s+descripci[oó]n\s+['"]?([^'"\.,;!?]+)['"]?)?/i,
            /proyecto:\s*(.+?)(?:\s*,\s*descripci[oó]n:\s*(.+))?/i,
            /quiero\s+crear\s+(?:un\s+)?proyecto\s+(?:para|sobre|de)\s+['"]?([^'"\.,;!?]+)['"]?(?:\s*[,.]\s*(.+))?/i
        ];
        
        for (const pattern of projectPatterns) {
            const match = message.match(pattern);
            if (match) {
                const name = match[1]?.trim();
                const description = match[2]?.trim() || '';
                return { name, description, intent: 'create_project' };
            }
        }
        
        // Check simple "crear proyecto X" pattern
        const simpleMatch = message.match(/crear\s+proyecto\s+(.+)/i);
        if (simpleMatch) {
            const name = simpleMatch[1]?.trim();
            return { name, description: '', intent: 'create_project' };
        }
        
        return null;
    }

    // Check if message is related to project management
    function isProjectRelated(message) {
        const projectKeywords = [
            'proyecto', 'tarea', 'task', 'project', 'crear', 'nuevo', 'asignar',
            'prioridad', 'fecha', 'límite', 'deadline', 'estado', 'columna',
            'tablero', 'board', 'dashboard', 'miembro', 'equipo', 'team',
            'completar', 'eliminar', 'mover', 'buscar', 'encontrar', 'gestión',
            'organizar', 'planificar', 'sprint', 'scrum', 'ágil', 'agile',
            'revisión', 'review', 'progreso', 'progress', 'hecho', 'done',
            'pendiente', 'todo', 'por hacer', 'en progreso', 'completada',
            'ayuda', 'help', 'cómo', 'how', 'qué', 'what', 'cuándo', 'when',
            'dónde', 'where', 'por qué', 'why', 'explicar', 'explain',
            'funciona', 'works', 'uso', 'use', 'configurar', 'setup',
            'personalizar', 'customize', 'informe', 'report', 'estadística',
            'stat', 'métrica', 'metric', 'tiempo', 'time', 'calendario',
            'calendar', 'notificación', 'notification', 'recordatorio', 'reminder'
        ];
        
        const lowerMessage = message.toLowerCase();
        
        // Check for project-related keywords
        const hasKeyword = projectKeywords.some(keyword => 
            lowerMessage.includes(keyword.toLowerCase())
        );
        
        // Also check for command patterns
        const isCommand = isAICommand(message);
        
        // Check for question patterns
        const isQuestion = /^(cómo|qué|cuándo|dónde|por qué|quién|cuál|puedo|debo|necesito|quiero)/i.test(lowerMessage);
        
        return hasKeyword || isCommand || isQuestion || lowerMessage.length < 30;
    }

    // Create project directly from chatbot
    async function createProjectFromChat(name, description = '') {
        try {
            if (!name) {
                return { success: false, error: 'Se necesita un nombre para el proyecto' };
            }
            
            console.log('Chatbot: createProjectFromChat', name, description);
            console.log('ProjectAPI available?', typeof ProjectAPI);
            // Try using ProjectAPI first if available
            if (typeof ProjectAPI !== 'undefined') {
                const color = '#0904DB';
                const response = await ProjectAPI.create({ name, description, color });
                
                if (response.success) {
                    // Refresh projects in dashboard
                    if (typeof loadProjects === 'function') {
                        await loadProjects();
                    }
                    if (typeof loadStats === 'function') {
                        await loadStats();
                    }
                    
                    // Show toast notification
                    if (typeof showToast === 'function') {
                        showToast('✨ Proyecto creado exitosamente desde el chatbot');
                    }
                    
                    return { 
                        success: true, 
                        project: response.project,
                        message: `Proyecto "${name}" creado exitosamente.`
                    };
                } else {
                    return { success: false, error: response.message || 'Error al crear proyecto' };
                }
            } else {
                // Fallback to direct fetch API
                try {
                    console.log('Chatbot: using fetch fallback');
                    const response = await fetch('/api/projects', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ name, description, color: '#0904DB' })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        // Refresh projects if possible
                        if (typeof loadProjects === 'function') {
                            await loadProjects();
                        }
                        if (typeof loadStats === 'function') {
                            await loadStats();
                        }
                        
                        // Show toast notification if available
                        if (typeof showToast === 'function') {
                            showToast('✨ Proyecto creado exitosamente desde el chatbot');
                        }
                        
                        return { 
                            success: true, 
                            project: data.project,
                            message: `Proyecto "${name}" creado exitosamente.`
                        };
                    } else {
                        return { success: false, error: data.message || 'Error al crear proyecto' };
                    }
                } catch (fetchError) {
                    console.error('Error in fetch fallback:', fetchError);
                    return { success: false, error: 'Error de conexión con el servidor' };
                }
            }
        } catch (error) {
            console.error('Error creating project:', error);
            return { success: false, error: 'Error al crear proyecto' };
        }
    }

    // Send message to AI backend (project management)
    async function sendToAIBackend(message) {
        try {
            console.log('Chatbot: sendToAIBackend', message);
            const response = await fetch(AI_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ message })
            });
            return await response.json();
        } catch (error) {
            console.error('Error calling AI backend:', error);
            return { success: false, error: 'Connection error' };
        }
    }

    // Send message to DeepSeek API with project-focused context
    async function sendToDeepSeek(message, fileData = null) {
        // Prepare messages array in OpenAI format with system prompt
        const messages = [
            {
                role: "system",
                content: `Eres un asistente especializado en gestión de proyectos y tareas (TaskFlow). 
Tu función es ayudar EXCLUSIVAMENTE con temas de gestión de proyectos. 

RESPONSABILIDADES:
1. Ayudar a crear proyectos: Pide nombre y descripción. Ejemplo: "Voy a crear el proyecto 'Marketing Q4' con descripción 'Campañas para el último trimestre'"
2. Ayudar con tareas: Pide título, descripción, prioridad (alta/media/baja), fecha y asignación
3. Responder preguntas sobre cómo usar TaskFlow
4. Explicar funciones del dashboard: tablero, columnas, estadísticas
5. Sugerir mejores prácticas de gestión ágil

LÍMITES ESTRICTOS:
- NO respondas preguntas sobre otros temas (noticias, deportes, entretenimiento, etc.)
- Si el usuario pregunta algo no relacionado, responde: "Soy un asistente especializado en TaskFlow. Solo puedo ayudarte con gestión de proyectos y tareas."
- Mantén respuestas concisas (máximo 3 párrafos)
- Guía al usuario a proporcionar información específica para crear proyectos/tareas
- Usa ejemplos concretos de TaskFlow

FORMATO PARA CREAR PROYECTOS:
Cuando el usuario quiera crear un proyecto, pide:
1. Nombre del proyecto (ej: "Desarrollo App Móvil")
2. Descripción breve (opcional)
3. Luego confirma la creación

El sistema creará el proyecto automáticamente con los detalles proporcionados.`
            }
        ];
        
        // Add chat history context (last 5 messages, excluding system messages)
        const recentHistory = chatHistory.slice(-5);
        if (recentHistory.length > 0) {
            messages.push(...recentHistory);
        }
        
        // Add current user message (ignore fileData for DeepSeek as it doesn't support images in basic model)
        messages.push({ role: "user", content: message });
        
        const requestOptions = {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: messages,
                max_tokens: 1000,
                temperature: 0.7
            })
        };

        try {
            const response = await fetch(DEEPSEEK_API_URL, requestOptions);
            const data = await response.json();
            
            if (!response.ok) {
                // Check for authentication error
                if (data.error?.type === 'authentication_error') {
                    throw new Error('API Key inválida. Por favor obtén una clave válida de DeepSeek (https://platform.deepseek.com/api_keys) y reemplázala en el archivo chatbot.js línea 2.');
                }
                throw new Error(data.error?.message || 'API error');
            }
            
            const apiResponseText = data.choices[0].message.content.trim();
            
            // Add to chat history
            chatHistory.push({ role: "user", content: message });
            chatHistory.push({ role: "assistant", content: apiResponseText });
            
            return { success: true, text: apiResponseText };
        } catch (error) {
            console.error('DeepSeek API error:', error);
            return { success: false, error: error.message };
        }
    }

    // Generate bot response using appropriate API
    async function generateBotResponse(incomingMessageDiv) {
        const messageElement = incomingMessageDiv.querySelector(".message-text");
        const userMessage = userData.message;
        
        // First check if it's a direct project creation request
        const projectDetails = extractProjectCreationDetails(userMessage);
        console.log('Chatbot: projectDetails extracted:', projectDetails);
        if (projectDetails && projectDetails.name) {
            // Handle project creation directly
            const response = await createProjectFromChat(projectDetails.name, projectDetails.description);
            if (response.success) {
                messageElement.innerText = response.message;
                // Add to chat history
                chatHistory.push({ role: "user", content: userMessage });
                chatHistory.push({ role: "assistant", content: response.message });
            } else {
                messageElement.innerText = `Error: ${response.error}`;
                messageElement.style.color = "#ff0000";
            }
            
            // Reset file data and remove thinking indicator
            userData.file = {};
            incomingMessageDiv.classList.remove("thinking");
            scrollToLatestMessage();
            return;
        }
        
        // Determine which API to use for other commands
        const isCommand = isAICommand(userMessage);
        
        if (isCommand) {
            // Use project AI backend
            const response = await sendToAIBackend(userMessage);
            if (response.success) {
                const result = response.result;
                let displayText = result.message || 'Comando procesado.';
                // Format task/project info if present
                if (result.task) {
                    displayText += `\n\nTarea #${result.task.id}: ${result.task.title}`;
                    if (result.task.priority) displayText += `\nPrioridad: ${result.task.priority}`;
                    if (result.task.dueDate) displayText += `\nFecha límite: ${result.task.dueDate}`;
                }
                if (result.project) {
                    displayText += `\n\nProyecto creado: ${result.project.name}`;
                }
                messageElement.innerText = displayText;
                // Add to chat history
                chatHistory.push({ role: "user", content: userMessage });
                chatHistory.push({ role: "assistant", content: displayText });
            } else {
                messageElement.innerText = 'Lo siento, no pude procesar tu comando. Intenta de nuevo.';
                messageElement.style.color = "#ff0000";
            }
        } else {
            // Check if message is related to project management
            if (!isProjectRelated(userMessage)) {
                messageElement.innerText = 'Soy un asistente especializado en gestión de proyectos (TaskFlow). Solo puedo ayudarte con:\n\n• Creación y gestión de proyectos/tareas\n• Prioridades, fechas y asignaciones\n• Uso del dashboard y sus funciones\n• Preguntas sobre TaskFlow\n\n¿En qué puedo ayudarte con tu proyecto?';
                chatHistory.push({ role: "user", content: userMessage });
                chatHistory.push({ role: "assistant", content: messageElement.innerText });
            } else {
                // Use DeepSeek API for general project-related questions
                const response = await sendToDeepSeek(userMessage, userData.file);
                if (response.success) {
                    messageElement.innerText = response.text;
                } else {
                    messageElement.innerText = `Error: ${response.error}`;
                    messageElement.style.color = "#ff0000";
                }
            }
        }
        
        // Reset file data and remove thinking indicator
        userData.file = {};
        incomingMessageDiv.classList.remove("thinking");
        scrollToLatestMessage();
    }

    // Handle outgoing user messages
    const handleOutgoingMessage = (e) => {
        e.preventDefault();
        userData.message = messageInput.value.trim();
        if (!userData.message && !userData.file.data) return;
        
        messageInput.value = "";
        fileUploadWrapper.classList.remove("file-uploaded");
        messageInput.dispatchEvent(new Event("input"));

        // Create display user message
        const messageContent = `<div class="message-text"></div>
                                ${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment" />` : ""}`;

        const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
        outgoingMessageDiv.querySelector(".message-text").textContent = userData.message;
        chatBody.appendChild(outgoingMessageDiv);
        scrollToLatestMessage();

        // Simulate bot response with thinking indicator after a delay
        setTimeout(() => {
            const messageContent = `
                    <svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
                        <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"></path>
                    </svg>
                    <div class="message-text">
                        <div class="thinking-indicator">
                            <div class="dot"></div>
                            <div class="dot"></div>
                            <div class="dot"></div>
                        </div>
                    </div>`;

            const incomingMessageDiv = createMessageElement(messageContent, "bot-message", "thinking");
            chatBody.appendChild(incomingMessageDiv);
            scrollToLatestMessage();
            generateBotResponse(incomingMessageDiv);
        }, 600);
    };

    // Handle Enter key press for sending messages
    messageInput.addEventListener("keydown", (e) => {
        const userMessage = e.target.value.trim();
        if (e.key === "Enter" && userMessage && !e.shiftKey && window.innerWidth > 768) {
            handleOutgoingMessage(e);
        }
    });

    // Adjust input field height dynamically
    messageInput.addEventListener("input",() => {
        messageInput.style.height = `${initialInputHeight}px`;
        messageInput.style.height = `${messageInput.scrollHeight}px`;
        document.querySelector(".chat-form").style.borderRadius = messageInput.scrollHeight > initialInputHeight ? "15px" : "32px";
    });

    // Handle file input change and preview the selected file
    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (!file) return;
        
        // Limit to images
        if (!file.type.startsWith('image/')) {
            alert('Por favor selecciona solo imágenes.');
            fileInput.value = "";
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            fileUploadWrapper.querySelector("img").src = e.target.result;
            fileUploadWrapper.classList.add("file-uploaded");
            const base64String = e.target.result.split(",")[1];

            // Store file data in userData
            userData.file = {
                data: base64String,
                mime_type: file.type
            };

            fileInput.value = "";
        };

        reader.readAsDataURL(file);
    });

    // Cancel file upload
    fileCancelButton.addEventListener("click", () => {
        userData.file = {};
        fileUploadWrapper.classList.remove("file-uploaded");
    });

    // Initialize emoji picker
    let picker = null;
    if (typeof EmojiMart !== 'undefined') {
        picker = new EmojiMart.Picker({
            theme: "light",
            skinTonePosition: "none",
            previewPosition: "none",
            onEmojiSelect: (emoji) => {
                const { selectionStart: start, selectionEnd: end } = messageInput;
                messageInput.setRangeText(emoji.native, start, end, "end");
                messageInput.focus();
            },
            onClickOutside: (e) => {
                if (e.target.id === "emoji-picker") {
                    document.body.classList.toggle("show-emoji-picker");
                } else {
                    document.body.classList.remove("show-emoji-picker");
                }
            }
        });
        
        const chatForm = document.querySelector(".chat-form");
        if (chatForm && picker) {
            chatForm.appendChild(picker);
            picker.classList.add('emoji-mart');
        }
    }

    // Event listeners
    sendMessageButton.addEventListener("click", (e) => handleOutgoingMessage(e));
    document.querySelector("#file-upload").addEventListener("click", () => fileInput.click());
    
    // Chatbot toggler (if exists)
    if (chatbotToggler) {
        chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
    }
    
    if (closeChatbot) {
        closeChatbot.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
    }
    
    // Emoji picker toggle
    const emojiPickerBtn = document.querySelector("#emoji-picker");
    if (emojiPickerBtn) {
        emojiPickerBtn.addEventListener("click", () => {
            document.body.classList.toggle("show-emoji-picker");
        });
    }
    
    // Close emoji picker when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.emoji-mart') && !e.target.closest('#emoji-picker')) {
            document.body.classList.remove('show-emoji-picker');
        }
    });
    
    console.log('Dashboard chatbot initialized successfully.');
}