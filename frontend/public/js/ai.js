(() => {
    const API_BASE = '/api/ai';

    async function sendMessage(message, projectId = null) {
        const response = await fetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, projectId })
        });
        return response.json();
    }

    class AIChat {
        constructor(containerId) {
            this.container = document.getElementById(containerId);
            this.messages = [];
            this.currentProjectId = null;
            this.pendingAction = null;
            this.pendingData = null;
            this.initialize();
        }

        initialize() {
            if (!this.container) return;
            
            this.addWelcomeMessage();
            this.setupEventListeners();
        }

        setProject(projectId) {
            this.currentProjectId = projectId;
        }

        addWelcomeMessage() {
            this.addMessage({
                type: 'ai',
                text: '¡Hola! Soy tu asistente de IA. Puedo ayudarte a crear y gestionar tareas. Prueba decir:\n\n• "crear tarea Diseñar logo"\n• "asignar a Juan"\n• "cambiar prioridad alta"\n• "crear proyecto MiApp"'
            });
        }

        addMessage(message) {
            this.messages.push(message);
            this.render();
        }

        async sendMessage(text) {
            if (!text.trim()) return;

            this.addMessage({ type: 'user', text });

            try {
                const response = await sendMessage(text, this.currentProjectId);

                if (response.success) {
                    const result = response.result;
                    
                    if (result.type === 'task_created') {
                        this.addMessage({
                            type: 'ai',
                            text: result.message,
                            task: result.task
                        });
                        if (this.onTaskCreated) {
                            this.onTaskCreated(result.task);
                        }
                    } else if (result.type === 'project_created') {
                        this.addMessage({
                            type: 'ai',
                            text: result.message,
                            project: result.project
                        });
                        if (this.onProjectCreated) {
                            this.onProjectCreated(result.project);
                        }
                    } else if (result.type === 'task_updated') {
                        this.addMessage({
                            type: 'ai',
                            text: result.message,
                            task: result.task
                        });
                        if (this.onTaskUpdated) {
                            this.onTaskUpdated(result.task);
                        }
                    } else if (result.type === 'help') {
                        this.addMessage({
                            type: 'ai',
                            text: result.message
                        });
                    } else if (result.type === 'search_results') {
                        this.addMessage({
                            type: 'ai',
                            text: result.message,
                            tasks: result.tasks
                        });
                    } else if (result.type === 'error') {
                        this.addMessage({
                            type: 'ai',
                            text: result.message,
                            isError: true
                        });
                    } else if (result.type === 'awaiting_task_id') {
                        this.pendingAction = result.pendingAction;
                        this.pendingData = result;
                        this.addMessage({
                            type: 'ai',
                            text: result.message
                        });
                    }
                } else {
                    this.addMessage({
                        type: 'ai',
                        text: 'Lo siento, hubo un error. Por favor intenta de nuevo.',
                        isError: true
                    });
                }
            } catch (error) {
                console.error('Error sending message:', error);
                this.addMessage({
                    type: 'ai',
                    text: 'Error de conexión. Por favor intenta de nuevo.',
                    isError: true
                });
            }
        }

        setupEventListeners() {
            const input = this.container.querySelector('.chat-input');
            const sendBtn = this.container.querySelector('.chat-send');

            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        this.sendMessage(input.value);
                        input.value = '';
                    }
                });
            }

            if (sendBtn) {
                sendBtn.addEventListener('click', () => {
                    if (input) {
                        this.sendMessage(input.value);
                        input.value = '';
                    }
                });
            }
        }

        render() {
            if (!this.container) return;

            const messagesContainer = this.container.querySelector('.chat-messages');
            if (!messagesContainer) return;

            messagesContainer.innerHTML = this.messages.map(msg => this.renderMessage(msg)).join('');
            
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        renderMessage(msg) {
            const isUser = msg.type === 'user';
            
            return `
                <div class="chat-message ${msg.type}">
                    <div class="message-avatar">
                        ${isUser ? '👤' : '🤖'}
                    </div>
                    <div class="message-content">
                        <div class="message-text ${msg.isError ? 'error' : ''}">${this.formatText(msg.text)}</div>
                        ${msg.task ? this.renderTaskPreview(msg.task) : ''}
                    </div>
                </div>
            `;
        }

        renderTaskPreview(task) {
            return `
                <div class="task-preview" onclick="window.openTask(${task.id})">
                    <div class="task-preview-header">
                        <span class="task-preview-id">#${task.id}</span>
                        <span class="task-preview-priority priority-${task.priority}">${task.priority}</span>
                    </div>
                    <div class="task-preview-title">${task.title}</div>
                </div>
            `;
        }

        formatText(text) {
            return text
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n/g, '<br>')
                .replace(/📋/g, '<span class="icon">📋</span>')
                .replace(/✅/g, '<span class="icon">✅</span>')
                .replace(/⚡/g, '<span class="icon">⚡</span>')
                .replace(/📅/g, '<span class="icon">📅</span>')
                .replace(/👤/g, '<span class="icon">👤</span>')
                .replace(/📁/g, '<span class="icon">📁</span>')
                .replace(/🔑/g, '<span class="icon">🔑</span>');
        }
    }

    window.AIChat = AIChat;
})();
