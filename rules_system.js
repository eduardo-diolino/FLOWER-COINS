// Sistema de regras para FLOWER COINS
// Este arquivo contém as funções para gerenciar regras do sistema, substituindo a antiga área de penalidades

// Função para carregar a área de regras
async function loadRules() {
    try {
        const section = document.getElementById('rules-section');
        if (!section) return;
        
        section.innerHTML = `
            <h2 class="text-2xl font-bold text-white mb-6">Regras do Sistema</h2>
            
            <!-- Explicação -->
            <div class="card p-6 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div class="flex items-start">
                    <div class="flex-shrink-0 text-blue-500 text-4xl mr-4">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold mb-2 text-blue-700">Sobre as Regras</h3>
                        <p class="text-gray-600 mb-3">
                            As regras do sistema definem o funcionamento e as expectativas de uso da plataforma FLOWER COINS.
                            Estas regras são sincronizadas automaticamente com a área dos funcionários, garantindo que todos 
                            estejam sempre alinhados às políticas atuais.
                        </p>
                        <p class="text-sm text-blue-600 font-medium">
                            Qualquer alteração nas regras será imediatamente refletida para todos os funcionários.
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- Lista de regras -->
            <div class="card p-6 mb-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold">Lista de Regras</h3>
                    <button onclick="createRule()" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
                        <i class="fas fa-plus mr-2"></i>Nova Regra
                    </button>
                </div>
                
                <div id="rules-list" class="space-y-4 max-h-96 overflow-y-auto">
                    <div class="text-center p-6">
                        <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p class="text-gray-500">Carregando regras...</p>
                    </div>
                </div>
            </div>
            
            <!-- Configurações -->
            <div class="card p-6">
                <h3 class="text-lg font-bold mb-4">Configurações de Regras</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-4">
                        <div class="mb-4">
                            <label for="rules-visibility" class="block text-sm font-medium text-gray-700 mb-1">
                                Visibilidade das Regras
                            </label>
                            <select id="rules-visibility" class="w-full px-3 py-2 border rounded-lg">
                                <option value="all">Mostrar todas as regras para todos os funcionários</option>
                                <option value="active">Mostrar apenas regras ativas</option>
                                <option value="department">Mostrar regras específicas por departamento</option>
                            </select>
                        </div>
                        
                        <div>
                            <label for="rules-notification" class="block text-sm font-medium text-gray-700 mb-1">
                                Notificações de Novas Regras
                            </label>
                            <select id="rules-notification" class="w-full px-3 py-2 border rounded-lg">
                                <option value="yes">Notificar funcionários sobre novas regras</option>
                                <option value="no">Não enviar notificações</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                            <div class="flex">
                                <div class="flex-shrink-0">
                                    <i class="fas fa-exclamation-triangle text-yellow-400"></i>
                                </div>
                                <div class="ml-3">
                                    <p class="text-sm text-yellow-700">
                                        Lembre-se de que regras claras e justas melhoram o engajamento dos funcionários com o sistema.
                                        Evite regras muito restritivas ou difíceis de entender.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mt-4">
                            <button onclick="saveRuleSettings()" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg w-full">
                                <i class="fas fa-save mr-2"></i>Salvar Configurações
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Inicializar componentes
        loadRulesList();
        loadRuleSettings();
        
    } catch (error) {
        console.error("Erro ao inicializar área de Regras:", error);
        
        const section = document.getElementById('rules-section');
        if (section) {
            section.innerHTML += `
                <div class="card bg-red-50 border border-red-300 p-6 mt-4">
                    <div class="flex items-center">
                        <div class="text-red-500 text-3xl mr-4">
                            <i class="fas fa-exclamation-circle"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold text-red-700 mb-2">Erro ao carregar sistema de regras</h3>
                            <p class="text-red-600">${error.message || 'Erro desconhecido'}</p>
                            <button onclick="loadRules()" class="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded mt-3">
                                Tentar novamente
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }
}

// Função para carregar lista de regras
async function loadRulesList() {
    try {
        const container = document.getElementById('rules-list');
        if (!container) return;
        
        // Verificar se a tabela rules existe
        try {
            // Verificar se a tabela rules existe
            const { count, error: countError } = await supabaseClient
                .from('rules')
                .select('*', { count: 'exact', head: true });
            
            // Se houver erro, provavelmente a tabela não existe
            if (countError) {
                console.log("Tabela 'rules' não encontrada, criando tabela...");
                
                // Usar SQL direto para criar a tabela
                const { error: sqlError } = await supabaseClient.rpc('exec', { 
                    query: `
                    CREATE TABLE IF NOT EXISTS rules (
                        id SERIAL PRIMARY KEY,
                        title TEXT NOT NULL,
                        description TEXT NOT NULL,
                        category TEXT,
                        is_active BOOLEAN DEFAULT TRUE,
                        department TEXT,
                        created_at TIMESTAMP DEFAULT NOW(),
                        updated_at TIMESTAMP DEFAULT NOW(),
                        order_index INTEGER DEFAULT 0
                    );`
                });
                
                if (sqlError) {
                    console.error("Erro ao criar tabela 'rules':", sqlError);
                }
            } else {
                console.log("Tabela 'rules' encontrada!");
            }
        } catch (error) {
            console.error("Erro ao verificar tabela 'rules':", error);
        }
        
        // Buscar regras
        const { data, error } = await supabaseClient
            .from('rules')
            .select('*')
            .order('order_index', { ascending: true })
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Limpar container
        container.innerHTML = '';
        
        // Se não houver regras
        if (!data || data.length === 0) {
            container.innerHTML = `
                <div class="text-center p-6 bg-gray-50 rounded-lg">
                    <div class="text-4xl mb-3 text-gray-300">
                        <i class="fas fa-scroll"></i>
                    </div>
                    <p class="text-gray-500">Nenhuma regra encontrada</p>
                    <button onclick="createRule()" class="bg-blue-100 text-blue-800 mt-4 px-4 py-2 rounded-lg hover:bg-blue-200 transition-all">
                        <i class="fas fa-plus mr-2"></i>Criar primeira regra
                    </button>
                </div>
            `;
            
            // Inserir regras padrão
            createDefaultRules();
            return;
        }
        
        // Agrupar regras por categoria
        const categories = {};
        data.forEach(rule => {
            const category = rule.category || 'Geral';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(rule);
        });
        
        // Criar seções para cada categoria
        Object.keys(categories).forEach(category => {
            const categoryRules = categories[category];
            
            // Criar cabeçalho de categoria
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'mb-4';
            categoryHeader.innerHTML = `
                <h4 class="text-md font-bold text-gray-700 mb-2 flex items-center">
                    <i class="fas fa-folder mr-2 text-blue-500"></i>
                    ${category}
                </h4>
            `;
            container.appendChild(categoryHeader);
            
            // Criar cards para cada regra na categoria
            categoryRules.forEach(rule => {
                // Determinar cor com base no status
                let statusClass = rule.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
                let statusText = rule.is_active ? 'Ativa' : 'Inativa';
                
                const ruleCard = document.createElement('div');
                ruleCard.className = 'border rounded-lg p-4 mb-3 bg-white hover:shadow-md transition-all';
                ruleCard.innerHTML = `
                    <div class="flex justify-between items-start">
                        <div>
                            <h5 class="font-bold text-gray-800 mb-1">${rule.title}</h5>
                            <p class="text-sm text-gray-600 mb-2">${rule.description}</p>
                            <div class="flex items-center text-xs text-gray-500">
                                ${rule.department ? 
                                    `<span class="mr-3"><i class="fas fa-users mr-1"></i>${rule.department}</span>` : ''}
                                <span class="mr-3"><i class="fas fa-clock mr-1"></i>${new Date(rule.updated_at).toLocaleDateString('pt-BR')}</span>
                                <span class="px-2 py-0.5 rounded-full ${statusClass}">${statusText}</span>
                            </div>
                        </div>
                        <div class="flex space-x-1">
                            <button onclick="editRule('${rule.id}')" class="text-blue-600 hover:text-blue-800 p-1" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="toggleRuleStatus('${rule.id}', ${!rule.is_active})" class="text-gray-600 hover:text-gray-800 p-1" title="${rule.is_active ? 'Desativar' : 'Ativar'}">
                                <i class="fas ${rule.is_active ? 'fa-toggle-on text-green-500' : 'fa-toggle-off text-gray-400'}"></i>
                            </button>
                            <button onclick="deleteRule('${rule.id}')" class="text-red-600 hover:text-red-800 p-1" title="Excluir">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
                container.appendChild(ruleCard);
            });
        });
        
    } catch (error) {
        console.error("Erro ao carregar lista de regras:", error);
        
        const container = document.getElementById('rules-list');
        if (container) {
            container.innerHTML = `
                <div class="bg-red-100 text-red-800 p-4 rounded-lg">
                    <div class="font-bold mb-1">Erro ao carregar regras</div>
                    <p class="text-sm">${error.message || 'Erro desconhecido'}</p>
                    <button onclick="loadRulesList()" class="bg-red-200 hover:bg-red-300 mt-2 px-3 py-1 rounded text-sm">
                        Tentar novamente
                    </button>
                </div>
            `;
        }
    }
}

// Função para criar regras padrão
async function createDefaultRules() {
    try {
        const defaultRules = [
            {
                title: 'Concluir Tarefas com Qualidade',
                description: 'Todas as tarefas devem ser concluídas com alta qualidade e dentro dos padrões estabelecidos para serem validadas.',
                category: 'Tarefas',
                is_active: true,
                order_index: 1
            },
            {
                title: 'Uso Responsável de Pontos',
                description: 'Os pontos acumulados devem ser utilizados de acordo com o sistema de recompensas oficial da empresa.',
                category: 'Pontos',
                is_active: true,
                order_index: 2
            },
            {
                title: 'Respeito aos Prazos',
                description: 'O cumprimento dos prazos é essencial. Tarefas concluídas após o prazo podem ter sua pontuação reduzida.',
                category: 'Tarefas',
                is_active: true,
                order_index: 3
            },
            {
                title: 'Metas de Desempenho',
                description: 'Atingir as metas semanais garante bônus de pontos e possibilidades de recompensas especiais.',
                category: 'Metas',
                is_active: true,
                order_index: 4
            }
        ];
        
        for (const rule of defaultRules) {
            await supabaseClient
                .from('rules')
                .insert([{
                    ...rule,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }]);
        }
        
        console.log('Regras padrão criadas com sucesso!');
        loadRulesList(); // Recarregar lista
        
    } catch (error) {
        console.error('Erro ao criar regras padrão:', error);
    }
}

// Função para carregar configurações de regras
async function loadRuleSettings() {
    try {
        // Buscar configurações
        const { data, error } = await supabaseClient
            .from('system_settings')
            .select('*')
            .eq('category', 'rules')
            .single();
        
        if (error) {
            // Se a tabela ou registro não existir, criar
            if (error.code === 'PGRST116') {
                console.log("Configurações de regras não encontradas, criando...");
                
                // Verificar se a tabela existe
                try {
                    const { count, error: countError } = await supabaseClient
                        .from('system_settings')
                        .select('*', { count: 'exact', head: true });
                    
                    // Se houver erro, provavelmente a tabela não existe
                    if (countError) {
                        console.log("Tabela 'system_settings' não encontrada, criando...");
                        
                        // Criar tabela
                        const { error: sqlError } = await supabaseClient.rpc('exec', { 
                            query: `
                            CREATE TABLE IF NOT EXISTS system_settings (
                                id SERIAL PRIMARY KEY,
                                category TEXT NOT NULL,
                                settings JSONB,
                                created_at TIMESTAMP DEFAULT NOW(),
                                updated_at TIMESTAMP DEFAULT NOW()
                            );`
                        });
                        
                        if (sqlError) {
                            console.error("Erro ao criar tabela 'system_settings':", sqlError);
                        }
                    }
                    
                    // Inserir configurações padrão
                    const defaultSettings = {
                        rules_visibility: 'all',
                        rules_notification: 'yes'
                    };
                    
                    await supabaseClient
                        .from('system_settings')
                        .insert([{
                            category: 'rules',
                            settings: defaultSettings,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }]);
                    
                    // Definir nos elementos da página
                    document.getElementById('rules-visibility').value = defaultSettings.rules_visibility;
                    document.getElementById('rules-notification').value = defaultSettings.rules_notification;
                    
                } catch (createError) {
                    console.error("Erro ao criar configurações de regras:", createError);
                }
            } else {
                console.error("Erro ao buscar configurações de regras:", error);
            }
            return;
        }
        
        // Se encontrou configurações, definir nos elementos da página
        if (data && data.settings) {
            const settings = data.settings;
            document.getElementById('rules-visibility').value = settings.rules_visibility || 'all';
            document.getElementById('rules-notification').value = settings.rules_notification || 'yes';
        }
        
    } catch (error) {
        console.error("Erro ao carregar configurações de regras:", error);
    }
}

// Função para salvar configurações de regras
async function saveRuleSettings() {
    try {
        const visibility = document.getElementById('rules-visibility').value;
        const notification = document.getElementById('rules-notification').value;
        
        const settings = {
            rules_visibility: visibility,
            rules_notification: notification
        };
        
        // Verificar se já existe registro
        const { data, error } = await supabaseClient
            .from('system_settings')
            .select('*')
            .eq('category', 'rules')
            .single();
        
        if (error) {
            // Se não existir, inserir
            await supabaseClient
                .from('system_settings')
                .insert([{
                    category: 'rules',
                    settings,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }]);
        } else {
            // Se existir, atualizar
            await supabaseClient
                .from('system_settings')
                .update({
                    settings,
                    updated_at: new Date().toISOString()
                })
                .eq('id', data.id);
        }
        
        alert('Configurações de regras salvas com sucesso!');
        
    } catch (error) {
        console.error("Erro ao salvar configurações de regras:", error);
        alert(`Erro ao salvar configurações: ${error.message || 'Erro desconhecido'}`);
    }
}

// Função para criar uma nova regra
function createRule() {
    try {
        // Modal para criar regra
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.id = 'ruleModal';
        
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div class="p-4 border-b flex justify-between items-center">
                    <h3 class="text-lg font-bold">Nova Regra</h3>
                    <button onclick="document.getElementById('ruleModal').remove()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="p-6">
                    <form id="ruleForm" class="space-y-4">
                        <div>
                            <label for="ruleTitle" class="block text-sm font-medium text-gray-700 mb-1">Título da Regra *</label>
                            <input type="text" id="ruleTitle" class="w-full px-3 py-2 border rounded-lg" required>
                        </div>
                        <div>
                            <label for="ruleDescription" class="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
                            <textarea id="ruleDescription" rows="3" class="w-full px-3 py-2 border rounded-lg" required></textarea>
                        </div>
                        <div>
                            <label for="ruleCategory" class="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                            <input type="text" id="ruleCategory" class="w-full px-3 py-2 border rounded-lg" placeholder="Ex: Geral, Tarefas, Pontos" value="Geral">
                        </div>
                        <div>
                            <label for="ruleDepartment" class="block text-sm font-medium text-gray-700 mb-1">Departamento (opcional)</label>
                            <input type="text" id="ruleDepartment" class="w-full px-3 py-2 border rounded-lg" placeholder="Ex: COSTURA, ADMINISTRAÇÃO">
                        </div>
                        <div>
                            <label for="ruleStatus" class="flex items-center">
                                <input type="checkbox" id="ruleStatus" checked class="mr-2">
                                <span>Regra ativa</span>
                            </label>
                        </div>
                        <div class="flex justify-end pt-4">
                            <button type="button" onclick="document.getElementById('ruleModal').remove()" class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg mr-2">
                                Cancelar
                            </button>
                            <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
                                <i class="fas fa-plus mr-1"></i> Criar Regra
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Adicionar evento de submit ao formulário
        document.getElementById('ruleForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const title = document.getElementById('ruleTitle').value.trim();
            const description = document.getElementById('ruleDescription').value.trim();
            const category = document.getElementById('ruleCategory').value.trim();
            const department = document.getElementById('ruleDepartment').value.trim() || null;
            const isActive = document.getElementById('ruleStatus').checked;
            
            // Validação
            if (!title || !description) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return;
            }
            
            try {
                // Desabilitar botão de submit
                const submitButton = document.querySelector('#ruleForm button[type="submit"]');
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Salvando...';
                
                // Contar o total de regras para definir ordem
                const { count, error: countError } = await supabaseClient
                    .from('rules')
                    .select('*', { count: 'exact' });
                
                const orderIndex = countError ? 0 : (count || 0);
                
                // Preparar dados
                const ruleData = {
                    title,
                    description,
                    category,
                    department,
                    is_active: isActive,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    order_index: orderIndex
                };
                
                // Inserir no banco de dados
                const { error } = await supabaseClient
                    .from('rules')
                    .insert([ruleData]);
                
                if (error) throw error;
                
                console.log("Regra criada com sucesso!");
                
                // Verificar configuração de notificações
                const { data: settings } = await supabaseClient
                    .from('system_settings')
                    .select('settings')
                    .eq('category', 'rules')
                    .single();
                
                // Se notificações estiverem habilitadas, criar notificação para os funcionários
                if (settings?.settings?.rules_notification === 'yes') {
                    try {
                        // Criar notificação para todos os funcionários
                        const { data: users, error: usersError } = await supabaseClient
                            .from('users')
                            .select('id')
                            .eq('is_admin', false)
                            .eq('is_active', true);
                        
                        if (!usersError && users && users.length > 0) {
                            // Para cada usuário, criar uma notificação
                            const notifications = users.map(user => ({
                                title: 'Nova regra adicionada',
                                message: `Nova regra: ${title}`,
                                type: 'info',
                                user_id: user.id,
                                created_at: new Date().toISOString(),
                                is_read: false,
                                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dias
                            }));
                            
                            await supabaseClient
                                .from('notifications')
                                .insert(notifications);
                        }
                    } catch (notifError) {
                        console.error("Erro ao criar notificações:", notifError);
                    }
                }
                
                // Fechar modal e recarregar lista
                document.getElementById('ruleModal').remove();
                loadRulesList();
                
            } catch (error) {
                console.error("Erro ao criar regra:", error);
                alert(`Erro ao criar regra: ${error.message || 'Erro desconhecido'}`);
                
                // Re-habilitar botão de submit
                const submitButton = document.querySelector('#ruleForm button[type="submit"]');
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-plus mr-1"></i> Criar Regra';
            }
        });
        
    } catch (error) {
        console.error("Erro ao abrir modal de regra:", error);
        alert(`Erro ao abrir modal: ${error.message || 'Erro desconhecido'}`);
    }
}

// Função para editar uma regra
async function editRule(id) {
    try {
        // Buscar regra
        const { data, error } = await supabaseClient
            .from('rules')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        if (!data) throw new Error('Regra não encontrada');
        
        // Modal para editar regra
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.id = 'ruleModal';
        
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div class="p-4 border-b flex justify-between items-center">
                    <h3 class="text-lg font-bold">Editar Regra</h3>
                    <button onclick="document.getElementById('ruleModal').remove()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="p-6">
                    <form id="ruleForm" class="space-y-4">
                        <div>
                            <label for="ruleTitle" class="block text-sm font-medium text-gray-700 mb-1">Título da Regra *</label>
                            <input type="text" id="ruleTitle" class="w-full px-3 py-2 border rounded-lg" required value="${data.title}">
                        </div>
                        <div>
                            <label for="ruleDescription" class="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
                            <textarea id="ruleDescription" rows="3" class="w-full px-3 py-2 border rounded-lg" required>${data.description}</textarea>
                        </div>
                        <div>
                            <label for="ruleCategory" class="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                            <input type="text" id="ruleCategory" class="w-full px-3 py-2 border rounded-lg" value="${data.category || 'Geral'}">
                        </div>
                        <div>
                            <label for="ruleDepartment" class="block text-sm font-medium text-gray-700 mb-1">Departamento (opcional)</label>
                            <input type="text" id="ruleDepartment" class="w-full px-3 py-2 border rounded-lg" value="${data.department || ''}">
                        </div>
                        <div>
                            <label for="ruleStatus" class="flex items-center">
                                <input type="checkbox" id="ruleStatus" ${data.is_active ? 'checked' : ''} class="mr-2">
                                <span>Regra ativa</span>
                            </label>
                        </div>
                        <div class="flex justify-end pt-4">
                            <button type="button" onclick="document.getElementById('ruleModal').remove()" class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg mr-2">
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
        document.getElementById('ruleForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const title = document.getElementById('ruleTitle').value.trim();
            const description = document.getElementById('ruleDescription').value.trim();
            const category = document.getElementById('ruleCategory').value.trim();
            const department = document.getElementById('ruleDepartment').value.trim() || null;
            const isActive = document.getElementById('ruleStatus').checked;
            
            // Validação
            if (!title || !description) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return;
            }
            
            try {
                // Desabilitar botão de submit
                const submitButton = document.querySelector('#ruleForm button[type="submit"]');
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Salvando...';
                
                // Atualizar no banco de dados
                const { error } = await supabaseClient
                    .from('rules')
                    .update({
                        title,
                        description,
                        category,
                        department,
                        is_active: isActive,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', id);
                
                if (error) throw error;
                
                console.log("Regra atualizada com sucesso!");
                
                // Fechar modal e recarregar lista
                document.getElementById('ruleModal').remove();
                loadRulesList();
                
            } catch (error) {
                console.error("Erro ao atualizar regra:", error);
                alert(`Erro ao atualizar regra: ${error.message || 'Erro desconhecido'}`);
                
                // Re-habilitar botão de submit
                const submitButton = document.querySelector('#ruleForm button[type="submit"]');
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-save mr-1"></i> Salvar Alterações';
            }
        });
        
    } catch (error) {
        console.error("Erro ao carregar regra para edição:", error);
        alert(`Erro ao carregar regra: ${error.message || 'Erro desconhecido'}`);
    }
}

// Função para ativar/desativar uma regra
async function toggleRuleStatus(id, newStatus) {
    try {
        // Atualizar status
        const { error } = await supabaseClient
            .from('rules')
            .update({
                is_active: newStatus,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);
        
        if (error) throw error;
        
        console.log(`Regra ${newStatus ? 'ativada' : 'desativada'} com sucesso!`);
        loadRulesList(); // Recarregar lista
        
    } catch (error) {
        console.error("Erro ao alterar status da regra:", error);
        alert(`Erro ao alterar status: ${error.message || 'Erro desconhecido'}`);
    }
}

// Função para excluir uma regra
async function deleteRule(id) {
    try {
        if (!confirm('Tem certeza que deseja excluir esta regra?')) return;
        
        // Excluir regra
        const { error } = await supabaseClient
            .from('rules')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        console.log("Regra excluída com sucesso!");
        loadRulesList(); // Recarregar lista
        
    } catch (error) {
        console.error("Erro ao excluir regra:", error);
        alert(`Erro ao excluir regra: ${error.message || 'Erro desconhecido'}`);
    }
}

// Carregar área de regras para funcionários
async function loadRulesForEmployee() {
    try {
        const container = document.getElementById('rules-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="text-center py-6">
                <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500 mx-auto mb-4"></div>
                <p class="text-gray-500">Carregando regras...</p>
            </div>
        `;
        
        // Buscar configurações de regras
        let visibility = 'all'; // Padrão
        
        try {
            const { data, error } = await supabaseClient
                .from('system_settings')
                .select('settings')
                .eq('category', 'rules')
                .single();
            
            if (!error && data && data.settings) {
                visibility = data.settings.rules_visibility || 'all';
            }
        } catch (settingsError) {
            console.error("Erro ao buscar configurações de regras:", settingsError);
        }
        
        // Buscar regras
        let query = supabaseClient
            .from('rules')
            .select('*')
            .order('order_index', { ascending: true })
            .order('created_at', { ascending: false });
        
        // Aplicar filtros de visibilidade
        if (visibility === 'active') {
            query = query.eq('is_active', true);
        } else if (visibility === 'department' && currentUser && currentUser.department) {
            query = query.or(`department.eq.${currentUser.department},department.is.null`).eq('is_active', true);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Limpar container
        container.innerHTML = '';
        
        // Se não houver regras
        if (!data || data.length === 0) {
            container.innerHTML = `
                <div class="text-center py-6 bg-gray-50 rounded-lg">
                    <div class="text-4xl mb-3 text-gray-300">
                        <i class="fas fa-scroll"></i>
                    </div>
                    <p class="text-gray-500">Nenhuma regra disponível no momento</p>
                </div>
            `;
            return;
        }
        
        // Agrupar regras por categoria
        const categories = {};
        data.forEach(rule => {
            const category = rule.category || 'Geral';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(rule);
        });
        
        // Criar accordion para cada categoria
        const accordion = document.createElement('div');
        accordion.className = 'space-y-2';
        
        Object.keys(categories).forEach((category, index) => {
            const categoryRules = categories[category];
            const isFirst = index === 0;
            
            const categorySection = document.createElement('div');
            categorySection.className = 'border rounded-lg overflow-hidden';
            
            categorySection.innerHTML = `
                <div class="category-header cursor-pointer bg-gray-100 px-4 py-3 flex justify-between items-center ${isFirst ? 'category-active bg-pink-50' : ''}">
                    <h3 class="font-bold ${isFirst ? 'text-pink-700' : 'text-gray-700'}">
                        <i class="fas ${getCategoryIcon(category)} mr-2"></i>
                        ${category}
                    </h3>
                    <i class="fas ${isFirst ? 'fa-chevron-up text-pink-500' : 'fa-chevron-down text-gray-500'}"></i>
                </div>
                <div class="category-content px-4 py-3 ${isFirst ? '' : 'hidden'}">
                    <ul class="space-y-3">
                        ${categoryRules.map(rule => `
                            <li class="flex">
                                <i class="fas fa-check-circle text-green-500 mt-1 mr-2 flex-shrink-0"></i>
                                <div>
                                    <h4 class="font-medium">${rule.title}</h4>
                                    <p class="text-sm text-gray-600">${rule.description}</p>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
            
            // Adicionar evento de clique para abrir/fechar accordion
            categorySection.querySelector('.category-header').addEventListener('click', function() {
                const content = this.nextElementSibling;
                const icon = this.querySelector('.fas');
                
                // Toggle content
                if (content.classList.contains('hidden')) {
                    content.classList.remove('hidden');
                    icon.classList.remove('fa-chevron-down');
                    icon.classList.add('fa-chevron-up');
                    this.classList.add('category-active', 'bg-pink-50');
                    this.querySelector('h3').classList.add('text-pink-700');
                    this.querySelector('h3').classList.remove('text-gray-700');
                    icon.classList.add('text-pink-500');
                    icon.classList.remove('text-gray-500');
                } else {
                    content.classList.add('hidden');
                    icon.classList.remove('fa-chevron-up');
                    icon.classList.add('fa-chevron-down');
                    this.classList.remove('category-active', 'bg-pink-50');
                    this.querySelector('h3').classList.remove('text-pink-700');
                    this.querySelector('h3').classList.add('text-gray-700');
                    icon.classList.remove('text-pink-500');
                    icon.classList.add('text-gray-500');
                }
            });
            
            accordion.appendChild(categorySection);
        });
        
        container.appendChild(accordion);
        
    } catch (error) {
        console.error("Erro ao carregar regras para funcionário:", error);
        
        const container = document.getElementById('rules-container');
        if (container) {
            container.innerHTML = `
                <div class="bg-red-100 text-red-800 p-4 rounded-lg">
                    <div class="font-bold mb-1">Erro ao carregar regras</div>
                    <p class="text-sm">${error.message || 'Erro desconhecido'}</p>
                    <button onclick="loadRulesForEmployee()" class="bg-red-200 hover:bg-red-300 mt-2 px-3 py-1 rounded text-sm">
                        Tentar novamente
                    </button>
                </div>
            `;
        }
    }
}

// Função para obter ícone de categoria
function getCategoryIcon(category) {
    const normalizedCategory = category.toLowerCase();
    
    if (normalizedCategory.includes('tarefa')) return 'fa-tasks';
    if (normalizedCategory.includes('ponto')) return 'fa-coins';
    if (normalizedCategory.includes('meta')) return 'fa-bullseye';
    if (normalizedCategory.includes('premia')) return 'fa-gift';
    if (normalizedCategory.includes('comportamento')) return 'fa-user-check';
    
    return 'fa-scroll';
}