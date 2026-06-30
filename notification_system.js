// Sistema de notificações para FLOWER COINS
// Este arquivo contém as funções necessárias para o sistema de notificações

// Função para carregar a área de notificações no painel administrativo
async function loadNotifications() {
    try {
        const section = document.getElementById('notifications-section');
        if (!section) return;
        
        section.innerHTML = `
            <h2 class="text-2xl font-bold text-white mb-6">Notificações</h2>
            <div class="card p-6 mb-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold">Gerenciar Notificações</h3>
                    <button onclick="createNotification()" class="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg">
                        <i class="fas fa-bell mr-2"></i>Nova Notificação
                    </button>
                </div>
                <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <i class="fas fa-info-circle text-yellow-400"></i>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm text-yellow-700">
                                Utilize notificações para informar os funcionários sobre atualizações importantes, 
                                premiações ou alterações no sistema.
                            </p>
                        </div>
                    </div>
                </div>
                
                <div id="notifications-list" class="space-y-3 max-h-96 overflow-y-auto">
                    <div class="text-center p-6">
                        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500 mx-auto mb-4"></div>
                        <p class="text-gray-500">Carregando notificações...</p>
                    </div>
                </div>
            </div>
            
            <div class="card p-6">
                <h3 class="text-lg font-bold mb-4">Histórico de Atividades</h3>
                <p>Esta seção registra todos os eventos importantes do sistema:</p>
                <ul class="list-disc ml-6 mt-3 text-gray-700">
                    <li>Conclusões de tarefas</li>
                    <li>Resgates de premiações</li>
                    <li>Distribuições de pontos</li>
                    <li>Alterações nas regras</li>
                </ul>
                
                <div id="activity-logs" class="mt-6 max-h-96 overflow-y-auto">
                    <div class="text-center p-6">
                        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p class="text-gray-500">Carregando histórico de atividades...</p>
                    </div>
                </div>
            </div>
        `;
        
        // Verificar se a tabela de notificações existe
        try {
            // Verificar se a tabela notifications existe
            const { count, error: countError } = await supabaseClient
                .from('notifications')
                .select('*', { count: 'exact', head: true });
            
            // Se houver erro, provavelmente a tabela não existe
            if (countError) {
                console.log("Tabela 'notifications' não encontrada, criando tabela...");
                
                // Usar SQL direto para criar a tabela
                const { error: sqlError } = await supabaseClient.rpc('exec', { 
                    query: `
                    CREATE TABLE IF NOT EXISTS notifications (
                        id SERIAL PRIMARY KEY,
                        title TEXT NOT NULL,
                        message TEXT NOT NULL,
                        type TEXT NOT NULL DEFAULT 'info',
                        user_id UUID,
                        is_read BOOLEAN DEFAULT FALSE,
                        created_at TIMESTAMP DEFAULT NOW(),
                        expires_at TIMESTAMP
                    );`
                });
                
                if (sqlError) {
                    console.error("Erro ao criar tabela 'notifications':", sqlError);
                }
            } else {
                console.log("Tabela 'notifications' encontrada!");
            }
        } catch (error) {
            console.error("Erro ao verificar tabela 'notifications':", error);
        }
        
        // Carregar notificações
        loadNotificationsList();
        
        // Carregar histórico de atividades
        loadActivityLogs();
        
    } catch (error) {
        console.error("Erro ao inicializar área de notificações:", error);
        
        const section = document.getElementById('notifications-section');
        if (section) {
            section.innerHTML += `
                <div class="card bg-red-50 border border-red-300 p-6 mt-4">
                    <div class="flex items-center">
                        <div class="text-red-500 text-3xl mr-4">
                            <i class="fas fa-exclamation-circle"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold text-red-700 mb-2">Erro ao carregar notificações</h3>
                            <p class="text-red-600">${error.message || 'Erro desconhecido'}</p>
                            <button onclick="loadNotifications()" class="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded mt-3">
                                Tentar novamente
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }
}

// Função para carregar a lista de notificações
async function loadNotificationsList() {
    try {
        const container = document.getElementById('notifications-list');
        if (!container) return;
        
        // Buscar notificações
        const { data, error } = await supabaseClient
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Limpar container
        container.innerHTML = '';
        
        // Se não houver notificações
        if (!data || data.length === 0) {
            container.innerHTML = `
                <div class="text-center p-6 bg-gray-50 rounded-lg">
                    <div class="text-4xl mb-3 text-gray-300">
                        <i class="fas fa-bell-slash"></i>
                    </div>
                    <p class="text-gray-500">Nenhuma notificação encontrada</p>
                    <button onclick="createNotification()" class="bg-pink-100 text-pink-800 mt-4 px-4 py-2 rounded-lg hover:bg-pink-200 transition-all">
                        <i class="fas fa-plus mr-2"></i>Criar primeira notificação
                    </button>
                </div>
            `;
            return;
        }
        
        // Exibir notificações
        data.forEach(notification => {
            const notificationCard = document.createElement('div');
            
            // Determinar cor com base no tipo
            let typeColorClass, typeIcon;
            switch (notification.type) {
                case 'success':
                    typeColorClass = 'border-green-300 bg-green-50';
                    typeIcon = 'fa-check-circle text-green-500';
                    break;
                case 'warning':
                    typeColorClass = 'border-yellow-300 bg-yellow-50';
                    typeIcon = 'fa-exclamation-triangle text-yellow-500';
                    break;
                case 'error':
                    typeColorClass = 'border-red-300 bg-red-50';
                    typeIcon = 'fa-times-circle text-red-500';
                    break;
                default:
                    typeColorClass = 'border-blue-300 bg-blue-50';
                    typeIcon = 'fa-info-circle text-blue-500';
            }
            
            // Formatar data
            const createdAt = new Date(notification.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Verificar expiração
            const isExpired = notification.expires_at && new Date(notification.expires_at) < new Date();
            
            notificationCard.className = `p-4 border-l-4 ${typeColorClass} rounded-r-lg flex justify-between items-start ${isExpired ? 'opacity-60' : ''}`;
            notificationCard.innerHTML = `
                <div>
                    <div class="flex items-center mb-1">
                        <i class="fas ${typeIcon} mr-2"></i>
                        <h4 class="font-bold">${notification.title}</h4>
                        ${isExpired ? '<span class="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Expirada</span>' : ''}
                    </div>
                    <p class="text-sm text-gray-700 ml-6">${notification.message}</p>
                    <div class="text-xs text-gray-500 ml-6 mt-2">
                        ${createdAt}
                    </div>
                </div>
                <div class="flex space-x-1">
                    <button onclick="editNotification('${notification.id}')" class="text-blue-600 hover:text-blue-800 p-1" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteNotification('${notification.id}')" class="text-red-600 hover:text-red-800 p-1" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            container.appendChild(notificationCard);
        });
        
    } catch (error) {
        console.error("Erro ao carregar lista de notificações:", error);
        
        const container = document.getElementById('notifications-list');
        if (container) {
            container.innerHTML = `
                <div class="bg-red-100 text-red-800 p-4 rounded-lg">
                    <div class="font-bold mb-1">Erro ao carregar notificações</div>
                    <p class="text-sm">${error.message || 'Erro desconhecido'}</p>
                    <button onclick="loadNotificationsList()" class="bg-red-200 hover:bg-red-300 mt-2 px-3 py-1 rounded text-sm">
                        Tentar novamente
                    </button>
                </div>
            `;
        }
    }
}

// Função para carregar histórico de atividades
async function loadActivityLogs() {
    try {
        const container = document.getElementById('activity-logs');
        if (!container) return;
        
        // Buscar atividades recentes (completar tarefas, resgates, etc)
        // Primeiramente, buscamos as tarefas completadas
        const { data: taskProgress, error: taskError } = await supabaseClient
            .from('user_progress')
            .select(`
                id,
                user_id,
                task_id,
                completed_at,
                users (username),
                tasks (title, points)
            `)
            .order('completed_at', { ascending: false })
            .limit(20);
        
        // Também buscamos os resgates de premiações
        const { data: redemptions, error: redemptionsError } = await supabaseClient
            .from('reward_redemptions')
            .select(`
                id,
                user_id,
                reward_id,
                redeemed_at,
                status,
                users (username),
                rewards (title)
            `)
            .order('redeemed_at', { ascending: false })
            .limit(10);
        
        // Combinar os dois tipos de atividades em uma única lista
        let activities = [];
        
        // Adicionar progresso de tarefas
        if (taskProgress && !taskError) {
            activities = activities.concat(taskProgress.map(item => ({
                type: 'task',
                timestamp: new Date(item.completed_at),
                user: item.users?.username || 'Usuário',
                title: item.tasks?.title || 'Tarefa',
                points: item.tasks?.points || 0,
                id: item.id
            })));
        }
        
        // Adicionar resgates
        if (redemptions && !redemptionsError) {
            activities = activities.concat(redemptions.map(item => ({
                type: 'redemption',
                timestamp: new Date(item.redeemed_at),
                user: item.users?.username || 'Usuário',
                title: item.rewards?.title || 'Premiação',
                status: item.status || 'Pendente',
                id: item.id
            })));
        }
        
        // Ordenar por data (mais recentes primeiro)
        activities.sort((a, b) => b.timestamp - a.timestamp);
        
        // Limpar container
        container.innerHTML = '';
        
        // Se não houver atividades
        if (activities.length === 0) {
            container.innerHTML = `
                <div class="text-center p-6 bg-gray-50 rounded-lg">
                    <div class="text-4xl mb-3 text-gray-300">
                        <i class="fas fa-history"></i>
                    </div>
                    <p class="text-gray-500">Nenhuma atividade registrada</p>
                    <p class="text-sm text-gray-400 mt-1">As atividades aparecerão aqui quando os funcionários completarem tarefas ou resgatarem premiações</p>
                </div>
            `;
            return;
        }
        
        // Criar lista de atividades
        const timeline = document.createElement('div');
        timeline.className = 'relative';
        
        // Adicionar linha vertical
        const verticalLine = document.createElement('div');
        verticalLine.className = 'absolute left-5 top-5 bottom-5 w-0.5 bg-gray-200';
        timeline.appendChild(verticalLine);
        
        // Adicionar atividades
        activities.forEach(activity => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'flex gap-4 mb-5 relative z-10';
            
            // Definir ícone e cor com base no tipo de atividade
            let iconClass, bgColor, textColor;
            if (activity.type === 'task') {
                iconClass = 'fa-check-circle';
                bgColor = 'bg-green-100';
                textColor = 'text-green-700';
            } else { // redemption
                if (activity.status === 'approved' || activity.status === 'Entregue' || activity.status === 'completed') {
                    iconClass = 'fa-gift';
                    bgColor = 'bg-purple-100';
                    textColor = 'text-purple-700';
                } else if (activity.status === 'rejected' || activity.status === 'Rejeitado') {
                    iconClass = 'fa-times-circle';
                    bgColor = 'bg-red-100';
                    textColor = 'text-red-700';
                } else {
                    iconClass = 'fa-clock';
                    bgColor = 'bg-yellow-100';
                    textColor = 'text-yellow-700';
                }
            }
            
            // Formatar data
            const formattedDate = activity.timestamp.toLocaleDateString('pt-BR', {
                day: '2-digit', 
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            timelineItem.innerHTML = `
                <div class="flex-none">
                    <div class="h-10 w-10 rounded-full ${bgColor} ${textColor} flex items-center justify-center">
                        <i class="fas ${iconClass}"></i>
                    </div>
                </div>
                <div class="flex-1">
                    <div class="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                        <div class="flex justify-between items-start">
                            <p class="font-medium">${activity.user}</p>
                            <span class="text-xs text-gray-500">${formattedDate}</span>
                        </div>
                        <p class="text-gray-700 text-sm">
                            ${activity.type === 'task' ? 
                                `Completou a tarefa <strong>${activity.title}</strong> (+${activity.points} pontos)` : 
                                `Resgatou a premiação <strong>${activity.title}</strong> <span class="inline-block px-2 py-0.5 text-xs rounded-full ${
                                    activity.status === 'approved' || activity.status === 'Entregue' || activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    activity.status === 'rejected' || activity.status === 'Rejeitado' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }">${
                                    activity.status === 'approved' || activity.status === 'Entregue' || activity.status === 'completed' ? 'Entregue' :
                                    activity.status === 'rejected' || activity.status === 'Rejeitado' ? 'Rejeitado' :
                                    'Pendente'
                                }</span>`
                            }
                        </p>
                    </div>
                </div>
            `;
            
            timeline.appendChild(timelineItem);
        });
        
        container.appendChild(timeline);
        
    } catch (error) {
        console.error("Erro ao carregar histórico de atividades:", error);
        
        const container = document.getElementById('activity-logs');
        if (container) {
            container.innerHTML = `
                <div class="bg-red-100 text-red-800 p-4 rounded-lg">
                    <div class="font-bold mb-1">Erro ao carregar histórico de atividades</div>
                    <p class="text-sm">${error.message || 'Erro desconhecido'}</p>
                    <button onclick="loadActivityLogs()" class="bg-red-200 hover:bg-red-300 mt-2 px-3 py-1 rounded text-sm">
                        Tentar novamente
                    </button>
                </div>
            `;
        }
    }
}

// Função para criar uma nova notificação
async function createNotification() {
    try {
        // Modal para criar notificação
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.id = 'notificationModal';
        
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div class="p-4 border-b flex justify-between items-center">
                    <h3 class="text-lg font-bold">Nova Notificação</h3>
                    <button onclick="document.getElementById('notificationModal').remove()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="p-6">
                    <form id="notificationForm" class="space-y-4">
                        <div>
                            <label for="notificationTitle" class="block text-sm font-medium text-gray-700 mb-1">Título</label>
                            <input type="text" id="notificationTitle" class="w-full px-3 py-2 border rounded-lg" required>
                        </div>
                        <div>
                            <label for="notificationMessage" class="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
                            <textarea id="notificationMessage" rows="3" class="w-full px-3 py-2 border rounded-lg" required></textarea>
                        </div>
                        <div>
                            <label for="notificationType" class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                            <select id="notificationType" class="w-full px-3 py-2 border rounded-lg">
                                <option value="info">Informação</option>
                                <option value="success">Sucesso</option>
                                <option value="warning">Aviso</option>
                                <option value="error">Erro</option>
                            </select>
                        </div>
                        <div>
                            <label for="notificationExpiry" class="block text-sm font-medium text-gray-700 mb-1">Data de expiração (opcional)</label>
                            <input type="datetime-local" id="notificationExpiry" class="w-full px-3 py-2 border rounded-lg">
                        </div>
                        <div class="flex justify-end pt-4">
                            <button type="button" onclick="document.getElementById('notificationModal').remove()" class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg mr-2">
                                Cancelar
                            </button>
                            <button type="submit" class="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg">
                                <i class="fas fa-plus mr-1"></i> Criar Notificação
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Adicionar evento de submit ao formulário
        document.getElementById('notificationForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const title = document.getElementById('notificationTitle').value.trim();
            const message = document.getElementById('notificationMessage').value.trim();
            const type = document.getElementById('notificationType').value;
            const expiryInput = document.getElementById('notificationExpiry').value;
            
            // Validação
            if (!title || !message) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return;
            }
            
            // Preparar dados
            const notificationData = {
                title,
                message,
                type,
                created_at: new Date().toISOString(),
                is_read: false
            };
            
            if (expiryInput) {
                notificationData.expires_at = new Date(expiryInput).toISOString();
            }
            
            try {
                // Desabilitar botão de submit
                const submitButton = document.querySelector('#notificationForm button[type="submit"]');
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Salvando...';
                
                // Inserir no banco de dados
                const { data, error } = await supabaseClient
                    .from('notifications')
                    .insert([notificationData]);
                
                if (error) throw error;
                
                console.log("Notificação criada com sucesso!");
                
                // Fechar modal e recarregar lista
                document.getElementById('notificationModal').remove();
                loadNotificationsList();
                
            } catch (error) {
                console.error("Erro ao criar notificação:", error);
                alert(`Erro ao criar notificação: ${error.message || 'Erro desconhecido'}`);
                
                // Re-habilitar botão de submit
                const submitButton = document.querySelector('#notificationForm button[type="submit"]');
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-plus mr-1"></i> Criar Notificação';
            }
        });
        
    } catch (error) {
        console.error("Erro ao abrir modal de notificação:", error);
        alert(`Erro ao abrir modal: ${error.message || 'Erro desconhecido'}`);
    }
}

// Função para editar uma notificação
async function editNotification(id) {
    try {
        // Buscar notificação
        const { data, error } = await supabaseClient
            .from('notifications')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        if (!data) throw new Error('Notificação não encontrada');
        
        // Modal para editar notificação
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.id = 'notificationModal';
        
        // Formatar data de expiração para o input datetime-local
        let expiryValue = '';
        if (data.expires_at) {
            const expiryDate = new Date(data.expires_at);
            expiryValue = expiryDate.toISOString().slice(0, 16); // Formato YYYY-MM-DDTHH:MM
        }
        
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div class="p-4 border-b flex justify-between items-center">
                    <h3 class="text-lg font-bold">Editar Notificação</h3>
                    <button onclick="document.getElementById('notificationModal').remove()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="p-6">
                    <form id="notificationForm" class="space-y-4">
                        <div>
                            <label for="notificationTitle" class="block text-sm font-medium text-gray-700 mb-1">Título</label>
                            <input type="text" id="notificationTitle" class="w-full px-3 py-2 border rounded-lg" required value="${data.title}">
                        </div>
                        <div>
                            <label for="notificationMessage" class="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
                            <textarea id="notificationMessage" rows="3" class="w-full px-3 py-2 border rounded-lg" required>${data.message}</textarea>
                        </div>
                        <div>
                            <label for="notificationType" class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                            <select id="notificationType" class="w-full px-3 py-2 border rounded-lg">
                                <option value="info" ${data.type === 'info' ? 'selected' : ''}>Informação</option>
                                <option value="success" ${data.type === 'success' ? 'selected' : ''}>Sucesso</option>
                                <option value="warning" ${data.type === 'warning' ? 'selected' : ''}>Aviso</option>
                                <option value="error" ${data.type === 'error' ? 'selected' : ''}>Erro</option>
                            </select>
                        </div>
                        <div>
                            <label for="notificationExpiry" class="block text-sm font-medium text-gray-700 mb-1">Data de expiração (opcional)</label>
                            <input type="datetime-local" id="notificationExpiry" class="w-full px-3 py-2 border rounded-lg" value="${expiryValue}">
                        </div>
                        <div class="flex justify-end pt-4">
                            <button type="button" onclick="document.getElementById('notificationModal').remove()" class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg mr-2">
                                Cancelar
                            </button>
                            <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
                                <i class="fas fa-save mr-1"></i> Salvar Alterações
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Adicionar evento de submit ao formulário
        document.getElementById('notificationForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const title = document.getElementById('notificationTitle').value.trim();
            const message = document.getElementById('notificationMessage').value.trim();
            const type = document.getElementById('notificationType').value;
            const expiryInput = document.getElementById('notificationExpiry').value;
            
            // Validação
            if (!title || !message) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return;
            }
            
            // Preparar dados
            const notificationData = {
                title,
                message,
                type,
                updated_at: new Date().toISOString()
            };
            
            if (expiryInput) {
                notificationData.expires_at = new Date(expiryInput).toISOString();
            } else {
                // Se o campo estiver vazio, remover a expiração
                notificationData.expires_at = null;
            }
            
            try {
                // Desabilitar botão de submit
                const submitButton = document.querySelector('#notificationForm button[type="submit"]');
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Salvando...';
                
                // Atualizar no banco de dados
                const { data, error } = await supabaseClient
                    .from('notifications')
                    .update(notificationData)
                    .eq('id', id);
                
                if (error) throw error;
                
                console.log("Notificação atualizada com sucesso!");
                
                // Fechar modal e recarregar lista
                document.getElementById('notificationModal').remove();
                loadNotificationsList();
                
            } catch (error) {
                console.error("Erro ao atualizar notificação:", error);
                alert(`Erro ao atualizar notificação: ${error.message || 'Erro desconhecido'}`);
                
                // Re-habilitar botão de submit
                const submitButton = document.querySelector('#notificationForm button[type="submit"]');
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-save mr-1"></i> Salvar Alterações';
            }
        });
        
    } catch (error) {
        console.error("Erro ao carregar notificação para edição:", error);
        alert(`Erro ao carregar notificação: ${error.message || 'Erro desconhecido'}`);
    }
}

// Função para excluir uma notificação
async function deleteNotification(id) {
    try {
        if (!confirm('Tem certeza que deseja excluir esta notificação?')) return;
        
        // Excluir notificação
        const { error } = await supabaseClient
            .from('notifications')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        console.log("Notificação excluída com sucesso!");
        loadNotificationsList(); // Recarregar lista
        
    } catch (error) {
        console.error("Erro ao excluir notificação:", error);
        alert(`Erro ao excluir notificação: ${error.message || 'Erro desconhecido'}`);
    }
}

// Função para criar notificação de administrador após completar tarefa
async function createAdminNotification(taskId, points) {
    try {
        if (!currentUser || !currentUser.id) return;
        
        // Buscar informações da tarefa
        const { data: taskData, error: taskError } = await supabaseClient
            .from('tasks')
            .select('title')
            .eq('id', taskId)
            .single();
        
        if (taskError) throw taskError;
        
        const taskTitle = taskData ? taskData.title : 'Tarefa desconhecida';
        
        // Criar notificação para o admin
        const notificationData = {
            title: 'Tarefa completada',
            message: `${currentUser.username} completou a tarefa "${taskTitle}" e ganhou ${points} pontos.`,
            type: 'success',
            created_at: new Date().toISOString(),
            is_read: false,
            // Expira em 7 dias
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        // Verificar se a tabela notifications existe
        try {
            const { data, error } = await supabaseClient
                .from('notifications')
                .insert([notificationData]);
            
            if (error) {
                console.error("Erro ao criar notificação para o admin:", error);
                // Não interromper o fluxo principal por causa desse erro
            } else {
                console.log("Notificação criada para o admin com sucesso!");
            }
        } catch (error) {
            console.error("Erro ao verificar tabela de notificações:", error);
        }
        
    } catch (error) {
        console.error("Erro ao criar notificação para o admin:", error);
        // Não interromper o fluxo principal por causa desse erro
    }
}