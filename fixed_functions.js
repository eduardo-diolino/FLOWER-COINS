// Função corrigida para criar premiações no banco de dados
async function createPremio() {
    try {
        console.log("Criando nova premiação...");
        
        // Pegar valores do formulário
        const title = document.getElementById('premioTitle').value.trim();
        const description = document.getElementById('premioDescription').value.trim();
        const costCoins = parseInt(document.getElementById('premioCostCoins').value) || 0;
        const costMeta = parseInt(document.getElementById('premioCostMeta').value) || 0;
        const quantity = parseInt(document.getElementById('premioQuantity').value) || 1;
        const expiryDate = document.getElementById('premioExpiryDate').value || null;
        const imageInput = document.getElementById('premioImage');
        
        // Validações básicas
        if (!title || !description || (costCoins <= 0 && costMeta <= 0)) {
            alert("Por favor, preencha todos os campos obrigatórios e defina pelo menos um custo (Coins ou Meta).");
            return;
        }
        
        if (!imageInput.files || !imageInput.files[0]) {
            alert("Por favor, selecione uma imagem para a premiação.");
            return;
        }
        
        // Mostrar indicador de carregamento
        const createButton = document.querySelector('button[onclick="createPremio()"]');
        if (createButton) {
            createButton.disabled = true;
            createButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Criando...';
        }
        
        // Primeiro, verificar se a tabela rewards existe
        try {
            const { count, error: countError } = await supabaseClient
                .from('rewards')
                .select('*', { count: 'exact', head: true });
            
            // Se não houver erro, a tabela existe
            console.log("Tabela 'rewards' encontrada.");
        } catch (tableError) {
            // Se der erro, provavelmente a tabela não existe
            console.log("Tabela 'rewards' não encontrada, criando tabela...");
            
            // Usar SQL direto para criar a tabela
            const { error: sqlError } = await supabaseClient.rpc('exec', { 
                query: `
                CREATE TABLE IF NOT EXISTS rewards (
                    id SERIAL PRIMARY KEY,
                    title TEXT NOT NULL,
                    description TEXT,
                    image TEXT,
                    cost_coins INTEGER DEFAULT 0,
                    cost_meta INTEGER DEFAULT 0,
                    quantity INTEGER DEFAULT 1,
                    expiry_date TIMESTAMP,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW(),
                    is_active BOOLEAN DEFAULT TRUE
                );`
            });
            
            if (sqlError) {
                console.error("Erro ao criar tabela 'rewards':", sqlError);
                // Continuar mesmo com erro, talvez a tabela já exista
            }
        }
        
        // Fazer upload da imagem para o storage do Supabase (ou usar caminho padrão para simplicidade)
        let imagePath = 'assets/img/flor-logo.jpeg'; // Caminho padrão
        
        if (imageInput.files && imageInput.files[0]) {
            try {
                const file = imageInput.files[0];
                const fileExt = file.name.split('.').pop();
                const fileName = `premio_${Date.now()}.${fileExt}`;
                
                const { data: uploadData, error: uploadError } = await supabaseClient
                    .storage
                    .from('rewards')
                    .upload(fileName, file);
                
                if (uploadError) throw uploadError;
                
                // Obter URL pública para a imagem
                const { data: { publicUrl } } = supabaseClient
                    .storage
                    .from('rewards')
                    .getPublicUrl(fileName);
                
                if (publicUrl) {
                    imagePath = publicUrl;
                }
            } catch (uploadError) {
                console.error("Erro ao fazer upload da imagem, usando imagem padrão:", uploadError);
                // Continuar com a imagem padrão
            }
        }
        
        // Preparar dados da premiação
        const rewardData = {
            title,
            description,
            image: imagePath,
            cost_coins: costCoins,
            cost_meta: costMeta,
            quantity,
            expiry_date: expiryDate ? new Date(expiryDate).toISOString() : null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true
        };
        
        // Inserir no banco de dados
        const { data, error } = await supabaseClient
            .from('rewards')
            .insert([rewardData]);
        
        if (error) throw error;
        
        console.log("Premiação criada com sucesso:", rewardData);
        alert(`Premiação "${title}" criada com sucesso!`);
        
        // Limpar formulário
        document.getElementById('createPremioForm').reset();
        
        // Recarregar lista de premiações
        loadPremios();
        
    } catch (error) {
        console.error("Erro ao criar premiação:", error);
        alert(`Erro ao criar premiação: ${error.message || 'Erro desconhecido'}`);
    } finally {
        // Restaurar botão
        const createButton = document.querySelector('button[onclick="createPremio()"]');
        if (createButton) {
            createButton.disabled = false;
            createButton.innerHTML = '<i class="fas fa-plus mr-2"></i> Criar Premiação';
        }
    }
}

// Função corrigida para carregar histórico de resgates
async function loadRedemptionHistory() {
    try {
        console.log("Carregando histórico de resgates do Supabase...");
        
        const tbody = document.getElementById('redemptionHistoryTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4"><i class="fas fa-spinner fa-spin mr-2"></i> Carregando...</td></tr>';
        
        // Verificar se a tabela reward_redemptions existe
        try {
            const { data: schemaData, error: schemaError } = await supabaseClient.rpc('get_schema_info');
            
            let tableExists = false;
            if (!schemaError && schemaData) {
                tableExists = schemaData.some(table => table.table_name === 'reward_redemptions');
            }
            
            // Se a tabela não existe, criar
            if (!tableExists) {
                console.log("Tabela 'reward_redemptions' não existe. Criando tabela...");
                
                const { error: sqlError } = await supabaseClient.rpc('exec', { 
                    query: `
                    CREATE TABLE IF NOT EXISTS reward_redemptions (
                        id SERIAL PRIMARY KEY,
                        user_id UUID REFERENCES auth.users(id),
                        reward_id INTEGER REFERENCES rewards(id),
                        redeemed_at TIMESTAMP DEFAULT NOW(),
                        status TEXT DEFAULT 'pending',
                        updated_at TIMESTAMP DEFAULT NOW()
                    );
                    
                    -- Adicionar comentário sobre relações para o Supabase detectar
                    COMMENT ON TABLE reward_redemptions IS E'@graphql({"foreign_keys": [{"column": "user_id", "table": "users"}, {"column": "reward_id", "table": "rewards"}]})';
                    `
                });
                
                if (sqlError) {
                    console.error("Erro ao criar tabela 'reward_redemptions':", sqlError);
                    // Continuar mesmo com erro, para mostrar dados de exemplo
                }
            }
        } catch (error) {
            console.error("Erro ao verificar schema:", error);
        }
        
        // Tentar buscar histórico de resgates
        try {
            // Primeiro tentar uma consulta simples sem join
            const { data: simpleData, error: simpleError } = await supabaseClient
                .from('reward_redemptions')
                .select('*')
                .order('redeemed_at', { ascending: false });
            
            // Se não conseguir fazer a consulta simples, a tabela pode não existir
            if (simpleError) {
                throw simpleError;
            }
            
            // Tentar agora com os joins
            const { data: redemptions, error } = await supabaseClient
                .from('reward_redemptions')
                .select(`
                    id, 
                    user_id, 
                    reward_id, 
                    redeemed_at, 
                    status,
                    users:user_id (username, avatar),
                    rewards:reward_id (title)
                `)
                .order('redeemed_at', { ascending: false });
            
            if (error) throw error;
            
            tbody.innerHTML = '';
            
            // Se não houver resgates, mostrar dados de exemplo
            if (!redemptions || redemptions.length === 0) {
                console.log("Nenhum resgate encontrado. Mostrando dados de exemplo.");
                
                // Dados de exemplo para visualização
                const historyDemo = [
                    {
                        id: '1',
                        user: 'Maria Silva',
                        premio: 'Vale-presente R$50',
                        date: '2023-08-12',
                        status: 'Pendente'
                    },
                    {
                        id: '2',
                        user: 'João Pereira',
                        premio: 'Dia de folga',
                        date: '2023-08-10',
                        status: 'Entregue'
                    }
                ];
                
                // Adicionar aviso de dados de exemplo
                const warningRow = document.createElement('tr');
                warningRow.innerHTML = `
                    <td colspan="5" class="bg-yellow-100 text-yellow-800 px-4 py-4">
                        <p class="font-bold">Atenção: Mostrando dados de exemplo</p>
                        <p class="text-sm">Não foram encontrados resgates reais no banco de dados.</p>
                    </td>
                `;
                tbody.appendChild(warningRow);
                
                // Adicionar os dados de exemplo
                historyDemo.forEach(item => {
                    const row = createRedemptionRow(item, true); // true indica que é dado de exemplo
                    tbody.appendChild(row);
                });
            } else {
                console.log(`Encontrados ${redemptions.length} resgates no banco de dados.`);
                
                // Criar linhas para os dados reais do banco
                redemptions.forEach(redemption => {
                    // Adaptação dos dados do banco para o formato esperado
                    const formattedRedemption = {
                        id: redemption.id,
                        user: redemption.users ? redemption.users.username : 'Usuário desconhecido',
                        premio: redemption.rewards ? redemption.rewards.title : 'Premiação desconhecida',
                        date: new Date(redemption.redeemed_at).toLocaleDateString('pt-BR'),
                        status: redemption.status || 'Pendente'
                    };
                    
                    const row = createRedemptionRow(formattedRedemption, false); // false indica que é dado real
                    tbody.appendChild(row);
                });
            }
        } catch (error) {
            console.error("Erro ao consultar reward_redemptions:", error);
            
            // Mostrar dados de exemplo com aviso de erro
            tbody.innerHTML = '';
            
            const errorRow = document.createElement('tr');
            errorRow.innerHTML = `
                <td colspan="5" class="bg-red-100 text-red-800 px-4 py-4">
                    <p class="font-bold">Erro ao carregar histórico de resgates</p>
                    <p class="text-sm">${error.message || 'Erro desconhecido'}</p>
                    <p class="text-xs mt-2">Mostrando dados de exemplo</p>
                </td>
            `;
            tbody.appendChild(errorRow);
            
            // Dados de exemplo para visualização
            const historyDemo = [
                {
                    id: '1',
                    user: 'Maria Silva',
                    premio: 'Vale-presente R$50',
                    date: '2023-08-12',
                    status: 'Pendente'
                },
                {
                    id: '2',
                    user: 'João Pereira',
                    premio: 'Dia de folga',
                    date: '2023-08-10',
                    status: 'Entregue'
                }
            ];
            
            // Adicionar os dados de exemplo
            historyDemo.forEach(item => {
                const row = createRedemptionRow(item, true);
                tbody.appendChild(row);
            });
        }
        
        console.log("Histórico de resgates processado!");
    } catch (error) {
        console.error("Erro geral ao processar histórico de resgates:", error);
        
        // Exibir mensagem de erro na interface
        const tbody = document.getElementById('redemptionHistoryTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-4 py-4 text-center bg-red-100 text-red-800">
                        <p class="font-bold">Erro ao carregar histórico de resgates</p>
                        <p class="text-sm">${error.message || 'Erro desconhecido'}</p>
                        <button onclick="loadRedemptionHistory()" class="mt-2 bg-red-200 text-red-800 px-4 py-1 rounded">
                            Tentar novamente
                        </button>
                    </td>
                </tr>
            `;
        }
    }
}

// Função para carregar fotos dos funcionários corretamente
async function loadEmployees() {
    try {
        const sectionElement = document.getElementById('employees-section');
        if (!sectionElement) return;
        
        sectionElement.innerHTML = `
        <h2 class="text-2xl font-bold text-white mb-6">Funcionários</h2>
        <div class="card p-6 mb-6">
            <h3 class="text-lg font-bold mb-4">Lista de Funcionários</h3>
            <div class="overflow-x-auto">
                <table class="min-w-full bg-white rounded-lg overflow-hidden">
                    <thead class="bg-gray-100">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departamento</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pontos</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nível</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody id="employeesList" class="divide-y divide-gray-200">
                        <tr><td colspan="6" class="px-6 py-4 text-center">Carregando funcionários...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
        `;
        
        // Carregar dados dos funcionários do Supabase
        const { data: users, error: usersError } = await supabaseClient
            .from('users')
            .select('id, username, department, avatar, created_at, is_active')
            .eq('is_admin', false);
        
        if (usersError) throw usersError;
        
        // Buscar estatísticas dos usuários
        const { data: stats, error: statsError } = await supabaseClient
            .from('user_stats')
            .select('user_id, total_points, meta_points');
        
        if (statsError) throw statsError;
        
        // Criar um mapa de id do usuário para estatísticas
        const statsMap = {};
        if (stats) {
            stats.forEach(stat => {
                statsMap[stat.user_id] = stat;
            });
        }
        
        const tbody = document.getElementById('employeesList');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (!users || users.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-4 text-center">Nenhum funcionário encontrado</td></tr>`;
            return;
        }
        
        users.forEach(user => {
            const userStats = statsMap[user.id] || { total_points: 0, meta_points: 0 };
            const totalPoints = (userStats.total_points || 0) + (userStats.meta_points || 0);
            const level = Math.floor(totalPoints / 100) + 1;
            
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            
            // Status do funcionário
            const isActive = user.is_active !== false; // Se is_active não existir ou for true
            const statusClass = isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
            const statusText = isActive ? 'Ativo' : 'Inativo';
            
            // Avatar do funcionário
            const avatarHtml = user.avatar ? 
                `<img src="${user.avatar}" alt="${user.username}" class="h-10 w-10 rounded-full object-cover">` :
                `<div class="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span class="text-gray-700 font-medium">${user.username.charAt(0).toUpperCase()}</span>
                </div>`;
            
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                            ${avatarHtml}
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${user.username}</div>
                            <div class="text-sm text-gray-500">Desde ${new Date(user.created_at).toLocaleDateString('pt-BR')}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${user.department || 'COSTURA'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm">
                        <span class="text-green-600 font-medium">${userStats.total_points || 0}</span> coins / 
                        <span class="text-yellow-600 font-medium">${userStats.meta_points || 0}</span> meta
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Nível ${level}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                        ${statusText}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="viewEmployeeDetails('${user.id}')" class="text-blue-600 hover:text-blue-900 mr-3">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${isActive ? 
                        `<button onclick="toggleEmployeeStatus('${user.id}', false)" class="text-red-600 hover:text-red-900" title="Desativar">
                            <i class="fas fa-user-slash"></i>
                        </button>` :
                        `<button onclick="toggleEmployeeStatus('${user.id}', true)" class="text-green-600 hover:text-green-900" title="Ativar">
                            <i class="fas fa-user-check"></i>
                        </button>`
                    }
                </td>
            `;
            
            tbody.appendChild(row);
        });
        
        console.log("Funcionários carregados com sucesso!");
    } catch (error) {
        console.error("Erro ao carregar funcionários:", error);
        const employeesList = document.getElementById('employeesList');
        if (employeesList) {
            employeesList.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-4 text-center text-red-500">
                        Erro ao carregar funcionários: ${error.message || 'Erro desconhecido'}
                    </td>
                </tr>
            `;
        }
    }
}

// Função para ativar/desativar funcionário
async function toggleEmployeeStatus(userId, activate) {
    try {
        if (!confirm(`Deseja ${activate ? 'ativar' : 'desativar'} este funcionário?`)) return;
        
        const { error } = await supabaseClient
            .from('users')
            .update({ is_active: activate, updated_at: new Date().toISOString() })
            .eq('id', userId);
        
        if (error) throw error;
        
        alert(`Funcionário ${activate ? 'ativado' : 'desativado'} com sucesso!`);
        loadEmployees(); // Recarregar lista
        
    } catch (error) {
        console.error("Erro ao alterar status do funcionário:", error);
        alert(`Erro ao alterar status: ${error.message || 'Erro desconhecido'}`);
    }
}

// Função para visualizar detalhes do funcionário
function viewEmployeeDetails(userId) {
    alert(`Visualizando detalhes do funcionário ID: ${userId} - Esta funcionalidade será implementada em breve.`);
}

// Função para adicionar botão de reativar tarefa
async function loadTasks() {
    try {
        const sectionElement = document.getElementById('tasks-section');
        if (!sectionElement) return;
        
        sectionElement.innerHTML = `
        <h2 class="text-2xl font-bold text-white mb-6">Tarefas</h2>
        <div class="card p-6 mb-6">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-bold">Lista de Tarefas</h3>
                <button onclick="openCreateTaskModal()" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
                    <i class="fas fa-plus mr-2"></i>Nova Tarefa
                </button>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full bg-white rounded-lg overflow-hidden">
                    <thead class="bg-gray-100">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridade</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody id="tasksList" class="divide-y divide-gray-200">
                        <tr><td colspan="5" class="px-6 py-4 text-center">Carregando tarefas...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
        `;
        
        // Carregar tarefas do Supabase
        const { data: tasks, error } = await supabaseClient
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const tbody = document.getElementById('tasksList');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (!tasks || tasks.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center">Nenhuma tarefa encontrada</td></tr>`;
            return;
        }
        
        tasks.forEach(task => {
            // Mapear prioridade para estilo visual
            let priorityClass, priorityText;
            switch (task.priority?.toLowerCase() || 'média') {
                case 'alta':
                case 'critical':
                case 'high':
                    priorityClass = 'bg-red-100 text-red-800';
                    priorityText = 'Alta';
                    break;
                case 'baixa':
                case 'low':
                    priorityClass = 'bg-green-100 text-green-800';
                    priorityText = 'Baixa';
                    break;
                default:
                    priorityClass = 'bg-yellow-100 text-yellow-800';
                    priorityText = 'Média';
            }
            
            // Mapear status para estilo visual
            let statusClass, statusText;
            if (task.is_active) {
                statusClass = 'bg-blue-100 text-blue-800';
                statusText = 'Ativa';
            } else {
                statusClass = 'bg-gray-100 text-gray-800';
                statusText = 'Inativa';
            }
            
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${task.title}</div>
                    <div class="text-xs text-gray-500">${task.description?.substring(0, 50) || ''} ${task.description?.length > 50 ? '...' : ''}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${task.type || 'Diária'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${priorityClass}">
                        ${priorityText}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                        ${statusText}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="editTask('${task.id}')" class="text-blue-600 hover:text-blue-900 mr-2" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${task.is_active ? 
                        `<button onclick="toggleTaskStatus('${task.id}', false)" class="text-red-600 hover:text-red-900 mr-2" title="Desativar">
                            <i class="fas fa-times-circle"></i>
                        </button>` :
                        `<button onclick="toggleTaskStatus('${task.id}', true)" class="text-green-600 hover:text-green-900 mr-2" title="Reativar">
                            <i class="fas fa-check-circle"></i>
                        </button>`
                    }
                    <button onclick="deleteTask('${task.id}')" class="text-red-800 hover:text-red-900" title="Excluir permanentemente">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
        
        console.log("Tarefas carregadas com sucesso!");
    } catch (error) {
        console.error("Erro ao carregar tarefas:", error);
        const tasksList = document.getElementById('tasksList');
        if (tasksList) {
            tasksList.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-4 text-center text-red-500">
                        Erro ao carregar tarefas: ${error.message || 'Erro desconhecido'}
                    </td>
                </tr>
            `;
        }
    }
}

// Função para excluir tarefa permanentemente
async function deleteTask(id) {
    try {
        if (!confirm("ATENÇÃO: Esta ação irá excluir permanentemente a tarefa e todo seu histórico associado. Deseja continuar?")) return;
        
        const { error } = await supabaseClient
            .from('tasks')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        alert("Tarefa excluída com sucesso!");
        loadTasks();
    } catch (error) {
        console.error("Erro ao excluir tarefa:", error);
        alert(`Erro ao excluir tarefa: ${error.message || 'Erro desconhecido'}`);
    }
}