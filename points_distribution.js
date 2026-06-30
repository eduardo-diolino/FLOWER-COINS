// Sistema de distribuição de pontos para FLOWER COINS
// Este arquivo contém as funções para distribuir pontos entre funcionários

// Função para carregar a área de distribuição de pontos
async function loadPoints() {
    try {
        const section = document.getElementById('points-section');
        if (!section) return;
        
        section.innerHTML = `
            <h2 class="text-2xl font-bold text-white mb-6">Distribuição de Pontos</h2>
            
            <!-- Distribuição individual -->
            <div class="card p-6 mb-6">
                <h3 class="text-lg font-bold mb-4">Distribuir Pontos Individualmente</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-4">
                        <div>
                            <label for="individualEmployee" class="block text-sm font-medium text-gray-700 mb-1">Funcionário</label>
                            <select id="individualEmployee" class="w-full px-3 py-2 border rounded-lg">
                                <option value="" disabled selected>Selecione um funcionário...</option>
                                <!-- Opções serão adicionadas dinamicamente -->
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Pontos</label>
                            <div class="flex gap-4">
                                <label class="flex items-center">
                                    <input type="radio" name="individualPointType" value="coins" checked class="mr-2">
                                    <span>Flower Coins</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="radio" name="individualPointType" value="meta" class="mr-2">
                                    <span>Flower Meta</span>
                                </label>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Ação</label>
                            <div class="flex gap-4">
                                <label class="flex items-center">
                                    <input type="radio" name="individualAction" value="add" checked class="mr-2">
                                    <span class="text-green-600">Adicionar</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="radio" name="individualAction" value="remove" class="mr-2">
                                    <span class="text-red-600">Remover</span>
                                </label>
                            </div>
                        </div>
                        
                        <div>
                            <label for="individualAmount" class="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                            <input type="number" id="individualAmount" min="1" value="10" class="w-full px-3 py-2 border rounded-lg">
                        </div>
                    </div>
                    
                    <div class="space-y-4">
                        <div>
                            <label for="individualReason" class="block text-sm font-medium text-gray-700 mb-1">Motivo (opcional)</label>
                            <textarea id="individualReason" rows="3" class="w-full px-3 py-2 border rounded-lg" 
                                placeholder="Ex: Bônus por desempenho excepcional"></textarea>
                        </div>
                        
                        <div>
                            <label for="individualNotify" class="flex items-center">
                                <input type="checkbox" id="individualNotify" checked class="mr-2">
                                <span>Notificar funcionário</span>
                            </label>
                        </div>
                        
                        <div class="pt-4">
                            <button onclick="distributeIndividualPoints()" class="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg">
                                <i class="fas fa-coins mr-2"></i>Distribuir Pontos
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Distribuição em massa -->
            <div class="card p-6 mb-6">
                <h3 class="text-lg font-bold mb-4">Distribuir Pontos em Massa</h3>
                
                <div class="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <i class="fas fa-info-circle text-yellow-400"></i>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm text-yellow-700">
                                Use esta função para distribuir pontos para vários funcionários de uma vez.
                                Isso é útil para bonificações em grupo ou premiações de equipe.
                            </p>
                        </div>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-4">
                        <div>
                            <label for="massPointType" class="block text-sm font-medium text-gray-700 mb-1">Tipo de Pontos</label>
                            <select id="massPointType" class="w-full px-3 py-2 border rounded-lg">
                                <option value="coins">Flower Coins</option>
                                <option value="meta">Flower Meta</option>
                            </select>
                        </div>
                        
                        <div>
                            <label for="massAmount" class="block text-sm font-medium text-gray-700 mb-1">Quantidade por Funcionário</label>
                            <input type="number" id="massAmount" min="1" value="10" class="w-full px-3 py-2 border rounded-lg">
                        </div>
                        
                        <div>
                            <label for="massReason" class="block text-sm font-medium text-gray-700 mb-1">Motivo (opcional)</label>
                            <input type="text" id="massReason" class="w-full px-3 py-2 border rounded-lg" 
                                placeholder="Ex: Bônus de equipe">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Selecionar Funcionários</label>
                        <div class="border rounded-lg p-3 h-48 overflow-y-auto" id="massEmployeeList">
                            <div class="flex justify-between items-center mb-2 pb-2 border-b">
                                <label class="flex items-center">
                                    <input type="checkbox" id="selectAllEmployees" class="mr-2">
                                    <span class="font-medium">Selecionar todos</span>
                                </label>
                                <span class="text-xs text-gray-500" id="selectedCount">0 selecionados</span>
                            </div>
                            <div id="employeesCheckboxes" class="space-y-1">
                                <div class="text-center py-4 text-gray-500">
                                    <div class="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-pink-500 mb-2"></div>
                                    <p>Carregando funcionários...</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mt-4">
                            <button onclick="distributeMassPoints()" class="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg w-full">
                                <i class="fas fa-users mr-2"></i>Distribuir para Selecionados
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Histórico de distribuições -->
            <div class="card p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold">Histórico de Distribuições</h3>
                    <button onclick="loadPointsHistory()" class="text-blue-500 hover:text-blue-700">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="min-w-full bg-white rounded-lg overflow-hidden">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data/Hora</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Funcionário</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pontos</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo</th>
                            </tr>
                        </thead>
                        <tbody id="pointsHistoryTableBody" class="divide-y divide-gray-200">
                            <tr>
                                <td colspan="5" class="px-6 py-4 text-center">
                                    <div class="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-pink-500 mr-2"></div>
                                    Carregando histórico de pontos...
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        // Inicializar componentes
        loadEmployeesForPoints();
        loadPointsHistory();
        
        // Adicionar event listeners
        document.getElementById('selectAllEmployees').addEventListener('change', function(e) {
            const checkboxes = document.querySelectorAll('#employeesCheckboxes input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = e.target.checked;
            });
            updateSelectedCount();
        });
        
    } catch (error) {
        console.error("Erro ao inicializar área de Distribuição de Pontos:", error);
        
        const section = document.getElementById('points-section');
        if (section) {
            section.innerHTML += `
                <div class="card bg-red-50 border border-red-300 p-6 mt-4">
                    <div class="flex items-center">
                        <div class="text-red-500 text-3xl mr-4">
                            <i class="fas fa-exclamation-circle"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold text-red-700 mb-2">Erro ao carregar sistema de distribuição de pontos</h3>
                            <p class="text-red-600">${error.message || 'Erro desconhecido'}</p>
                            <button onclick="loadPoints()" class="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded mt-3">
                                Tentar novamente
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }
}

// Função para carregar funcionários para distribuição de pontos
async function loadEmployeesForPoints() {
    try {
        // Carregar funcionários
        const { data: employees, error: employeesError } = await supabaseClient
            .from('users')
            .select('id, username, department')
            .eq('is_admin', false)
            .eq('is_active', true) // Apenas funcionários ativos
            .order('username');
        
        if (employeesError) throw employeesError;
        
        // Preencher select de funcionário individual
        const individualSelect = document.getElementById('individualEmployee');
        if (individualSelect) {
            individualSelect.innerHTML = '<option value="" disabled selected>Selecione um funcionário...</option>';
            
            if (employees && employees.length > 0) {
                employees.forEach(emp => {
                    const option = document.createElement('option');
                    option.value = emp.id;
                    option.textContent = `${emp.username} - ${emp.department || 'COSTURA'}`;
                    individualSelect.appendChild(option);
                });
            } else {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'Nenhum funcionário disponível';
                option.disabled = true;
                individualSelect.appendChild(option);
            }
        }
        
        // Preencher lista de checkboxes para distribuição em massa
        const checkboxesContainer = document.getElementById('employeesCheckboxes');
        if (checkboxesContainer) {
            checkboxesContainer.innerHTML = '';
            
            if (employees && employees.length > 0) {
                employees.forEach(emp => {
                    const div = document.createElement('div');
                    div.className = 'flex items-center';
                    div.innerHTML = `
                        <label class="flex items-center w-full py-1 px-2 hover:bg-gray-50 rounded">
                            <input type="checkbox" value="${emp.id}" class="mr-2 employee-checkbox">
                            <span>${emp.username}</span>
                            <span class="text-xs text-gray-500 ml-1">${emp.department || 'COSTURA'}</span>
                        </label>
                    `;
                    checkboxesContainer.appendChild(div);
                });
                
                // Adicionar event listeners para checkboxes
                const checkboxes = document.querySelectorAll('.employee-checkbox');
                checkboxes.forEach(checkbox => {
                    checkbox.addEventListener('change', updateSelectedCount);
                });
            } else {
                checkboxesContainer.innerHTML = `
                    <div class="text-center py-4 text-gray-500">
                        <i class="fas fa-user-slash text-2xl mb-2"></i>
                        <p>Nenhum funcionário ativo disponível</p>
                    </div>
                `;
            }
        }
        
    } catch (error) {
        console.error("Erro ao carregar funcionários:", error);
        
        const individualSelect = document.getElementById('individualEmployee');
        if (individualSelect) {
            individualSelect.innerHTML = `
                <option value="" disabled selected>Erro ao carregar funcionários</option>
            `;
        }
        
        const checkboxesContainer = document.getElementById('employeesCheckboxes');
        if (checkboxesContainer) {
            checkboxesContainer.innerHTML = `
                <div class="text-center py-4 text-red-500">
                    <i class="fas fa-exclamation-circle text-2xl mb-2"></i>
                    <p>Erro ao carregar funcionários</p>
                    <button onclick="loadEmployeesForPoints()" class="mt-2 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm">
                        Tentar novamente
                    </button>
                </div>
            `;
        }
    }
}

// Função para atualizar contador de selecionados
function updateSelectedCount() {
    const checkboxes = document.querySelectorAll('.employee-checkbox:checked');
    const countElement = document.getElementById('selectedCount');
    if (countElement) {
        countElement.textContent = `${checkboxes.length} selecionados`;
    }
}

// Função para distribuir pontos para um funcionário individual
async function distributeIndividualPoints() {
    try {
        const employeeId = document.getElementById('individualEmployee').value;
        const pointType = document.querySelector('input[name="individualPointType"]:checked').value;
        const action = document.querySelector('input[name="individualAction"]:checked').value;
        const amount = parseInt(document.getElementById('individualAmount').value) || 0;
        const reason = document.getElementById('individualReason').value.trim();
        const shouldNotify = document.getElementById('individualNotify').checked;
        
        // Validações
        if (!employeeId) {
            alert('Por favor, selecione um funcionário.');
            return;
        }
        
        if (amount <= 0) {
            alert('A quantidade deve ser maior que zero.');
            return;
        }
        
        // Confirmar ação
        const actionText = action === 'add' ? 'adicionar' : 'remover';
        const pointTypeText = pointType === 'coins' ? 'FLOWER COINS' : 'FLOWER META';
        
        if (!confirm(`Você está prestes a ${actionText} ${amount} ${pointTypeText} para este funcionário. Confirmar?`)) {
            return;
        }
        
        // Buscar usuário para obter nome
        const { data: userData, error: userError } = await supabaseClient
            .from('users')
            .select('username')
            .eq('id', employeeId)
            .single();
        
        if (userError) throw userError;
        
        const username = userData ? userData.username : 'Funcionário';
        
        // Buscar estatísticas atuais do usuário
        const { data: userStats, error: statsError } = await supabaseClient
            .from('user_stats')
            .select('*')
            .eq('user_id', employeeId)
            .single();
        
        if (statsError) throw statsError;
        
        // Se não existirem estatísticas, criar um registro
        if (!userStats) {
            const newStatsData = {
                user_id: employeeId,
                total_points: pointType === 'coins' ? (action === 'add' ? amount : 0) : 0,
                meta_points: pointType === 'meta' ? (action === 'add' ? amount : 0) : 0,
                level: 1,
                created_at: new Date().toISOString()
            };
            
            const { error: createError } = await supabaseClient
                .from('user_stats')
                .insert([newStatsData]);
            
            if (createError) throw createError;
        } else {
            // Calcular novos valores
            const field = pointType === 'coins' ? 'total_points' : 'meta_points';
            const currentValue = userStats[field] || 0;
            let newValue;
            
            if (action === 'add') {
                newValue = currentValue + amount;
            } else { // remove
                newValue = Math.max(0, currentValue - amount); // Não permitir valores negativos
            }
            
            // Atualizar no banco de dados
            const updateData = {
                [field]: newValue,
                updated_at: new Date().toISOString()
            };
            
            const { error: updateError } = await supabaseClient
                .from('user_stats')
                .update(updateData)
                .eq('user_id', employeeId);
            
            if (updateError) throw updateError;
        }
        
        // Criar registro no histórico de pontos
        const pointsHistoryData = {
            user_id: employeeId,
            points: action === 'add' ? amount : -amount,
            point_type: pointType,
            reason: reason || (action === 'add' ? 'Adição manual de pontos' : 'Remoção manual de pontos'),
            admin_id: currentAdmin.id,
            created_at: new Date().toISOString()
        };
        
        // Verificar se a tabela points_history existe
        try {
            const { error: historyError } = await supabaseClient
                .from('points_history')
                .insert([pointsHistoryData]);
            
            if (historyError) {
                console.log('Erro ao registrar histórico de pontos, possivelmente tabela não existe:', historyError);
                
                // Criar tabela se não existir
                const { error: sqlError } = await supabaseClient.rpc('exec', { 
                    query: `
                    CREATE TABLE IF NOT EXISTS points_history (
                        id SERIAL PRIMARY KEY,
                        user_id UUID REFERENCES auth.users(id),
                        admin_id UUID REFERENCES auth.users(id),
                        points INTEGER NOT NULL,
                        point_type TEXT NOT NULL,
                        reason TEXT,
                        created_at TIMESTAMP DEFAULT NOW()
                    );`
                });
                
                if (sqlError) {
                    console.error("Erro ao criar tabela 'points_history':", sqlError);
                } else {
                    // Tentar inserir novamente
                    await supabaseClient
                        .from('points_history')
                        .insert([pointsHistoryData]);
                }
            }
        } catch (historyError) {
            console.error('Erro ao verificar/criar tabela points_history:', historyError);
        }
        
        // Notificar o usuário se selecionado
        if (shouldNotify) {
            try {
                const notificationType = action === 'add' ? 'success' : 'warning';
                const notificationTitle = action === 'add' ? 'Pontos adicionados' : 'Pontos removidos';
                
                const notificationData = {
                    title: notificationTitle,
                    message: `${action === 'add' ? 'Adicionados' : 'Removidos'} ${amount} pontos ${pointTypeText}${reason ? `: ${reason}` : ''}`,
                    type: notificationType,
                    user_id: employeeId,
                    created_at: new Date().toISOString(),
                    is_read: false,
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dias
                };
                
                await supabaseClient
                    .from('notifications')
                    .insert([notificationData]);
            } catch (notifError) {
                console.error('Erro ao criar notificação:', notifError);
                // Não interromper o fluxo principal por causa desse erro
            }
        }
        
        alert(`Pontos ${action === 'add' ? 'adicionados' : 'removidos'} com sucesso para ${username}!`);
        
        // Resetar campos
        document.getElementById('individualReason').value = '';
        
        // Recarregar histórico
        loadPointsHistory();
        
    } catch (error) {
        console.error("Erro ao distribuir pontos:", error);
        alert(`Erro ao distribuir pontos: ${error.message || 'Erro desconhecido'}`);
    }
}

// Função para distribuir pontos em massa
async function distributeMassPoints() {
    try {
        const selectedEmployees = Array.from(document.querySelectorAll('.employee-checkbox:checked')).map(cb => cb.value);
        const pointType = document.getElementById('massPointType').value;
        const amount = parseInt(document.getElementById('massAmount').value) || 0;
        const reason = document.getElementById('massReason').value.trim();
        
        // Validações
        if (selectedEmployees.length === 0) {
            alert('Por favor, selecione pelo menos um funcionário.');
            return;
        }
        
        if (amount <= 0) {
            alert('A quantidade deve ser maior que zero.');
            return;
        }
        
        // Confirmar ação
        const pointTypeText = pointType === 'coins' ? 'FLOWER COINS' : 'FLOWER META';
        
        if (!confirm(`Você está prestes a adicionar ${amount} ${pointTypeText} para ${selectedEmployees.length} funcionários. Confirmar?`)) {
            return;
        }
        
        // Mostrar indicador de progresso
        const massButton = document.querySelector('#points-section button:last-child');
        const originalButtonText = massButton.innerHTML;
        massButton.disabled = true;
        massButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processando...';
        
        // Processar cada funcionário
        let successCount = 0;
        let errorCount = 0;
        
        for (const employeeId of selectedEmployees) {
            try {
                // Buscar estatísticas atuais do usuário
                const { data: userStats, error: statsError } = await supabaseClient
                    .from('user_stats')
                    .select('*')
                    .eq('user_id', employeeId)
                    .single();
                
                // Se não existirem estatísticas, criar um registro
                if (!userStats || statsError) {
                    const newStatsData = {
                        user_id: employeeId,
                        total_points: pointType === 'coins' ? amount : 0,
                        meta_points: pointType === 'meta' ? amount : 0,
                        level: 1,
                        created_at: new Date().toISOString()
                    };
                    
                    await supabaseClient
                        .from('user_stats')
                        .insert([newStatsData]);
                } else {
                    // Atualizar estatísticas existentes
                    const field = pointType === 'coins' ? 'total_points' : 'meta_points';
                    const currentValue = userStats[field] || 0;
                    const newValue = currentValue + amount;
                    
                    const updateData = {
                        [field]: newValue,
                        updated_at: new Date().toISOString()
                    };
                    
                    await supabaseClient
                        .from('user_stats')
                        .update(updateData)
                        .eq('user_id', employeeId);
                }
                
                // Registrar no histórico
                const pointsHistoryData = {
                    user_id: employeeId,
                    points: amount,
                    point_type: pointType,
                    reason: reason || 'Distribuição em massa',
                    admin_id: currentAdmin.id,
                    created_at: new Date().toISOString()
                };
                
                await supabaseClient
                    .from('points_history')
                    .insert([pointsHistoryData])
                    .then(null, (error) => console.log('Erro no histórico, possivelmente tabela não existe:', error));
                
                // Criar notificação para o usuário
                const notificationData = {
                    title: 'Pontos adicionados',
                    message: `Adicionados ${amount} pontos ${pointType === 'coins' ? 'FLOWER COINS' : 'FLOWER META'}${reason ? `: ${reason}` : ''}`,
                    type: 'success',
                    user_id: employeeId,
                    created_at: new Date().toISOString(),
                    is_read: false,
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dias
                };
                
                await supabaseClient
                    .from('notifications')
                    .insert([notificationData])
                    .then(null, (error) => console.log('Erro ao criar notificação:', error));
                
                successCount++;
                
            } catch (empError) {
                console.error(`Erro ao processar funcionário ${employeeId}:`, empError);
                errorCount++;
            }
        }
        
        // Restaurar botão
        massButton.disabled = false;
        massButton.innerHTML = originalButtonText;
        
        // Mostrar resultado
        if (errorCount > 0) {
            alert(`Distribuição concluída com alertas:\n${successCount} funcionários processados com sucesso\n${errorCount} erros encontrados`);
        } else {
            alert(`Distribuição concluída com sucesso para ${successCount} funcionários!`);
        }
        
        // Resetar seleção
        document.getElementById('selectAllEmployees').checked = false;
        document.querySelectorAll('.employee-checkbox').forEach(cb => {
            cb.checked = false;
        });
        updateSelectedCount();
        
        // Resetar campos
        document.getElementById('massReason').value = '';
        
        // Recarregar histórico
        loadPointsHistory();
        
    } catch (error) {
        console.error("Erro ao distribuir pontos em massa:", error);
        alert(`Erro ao distribuir pontos: ${error.message || 'Erro desconhecido'}`);
        
        // Restaurar botão
        const massButton = document.querySelector('#points-section button:last-child');
        if (massButton) {
            massButton.disabled = false;
            massButton.innerHTML = '<i class="fas fa-users mr-2"></i>Distribuir para Selecionados';
        }
    }
}

// Função para carregar histórico de pontos
async function loadPointsHistory() {
    try {
        const tbody = document.getElementById('pointsHistoryTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-4 text-center">
                    <div class="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-pink-500 mr-2"></div>
                    Carregando histórico de pontos...
                </td>
            </tr>
        `;
        
        // Verificar se a tabela points_history existe
        let tableExists = false;
        try {
            const { data: schemaData, error: schemaError } = await supabaseClient.rpc('get_schema_info');
            
            if (!schemaError && schemaData) {
                tableExists = schemaData.some(table => table.table_name === 'points_history');
            }
            
            // Se a tabela não existe, criar
            if (!tableExists) {
                console.log("Tabela 'points_history' não existe. Criando tabela...");
                
                const { error: sqlError } = await supabaseClient.rpc('exec', { 
                    query: `
                    CREATE TABLE IF NOT EXISTS points_history (
                        id SERIAL PRIMARY KEY,
                        user_id UUID REFERENCES auth.users(id),
                        admin_id UUID REFERENCES auth.users(id),
                        points INTEGER NOT NULL,
                        point_type TEXT NOT NULL,
                        reason TEXT,
                        created_at TIMESTAMP DEFAULT NOW()
                    );
                    
                    -- Adicionar comentário sobre relações para o Supabase detectar
                    COMMENT ON TABLE points_history IS E'@graphql({"foreign_keys": [{"column": "user_id", "table": "users"}, {"column": "admin_id", "table": "users"}]})';
                    `
                });
                
                if (sqlError) {
                    console.error("Erro ao criar tabela 'points_history':", sqlError);
                }
            }
        } catch (error) {
            console.error("Erro ao verificar schema:", error);
        }
        
        // Buscar histórico
        let history = [];
        
        try {
            // Primeiro, tentar buscar o histórico com joins
            const { data, error } = await supabaseClient
                .from('points_history')
                .select(`
                    id, 
                    user_id, 
                    admin_id, 
                    points, 
                    point_type,
                    reason,
                    created_at,
                    users:user_id (username)
                `)
                .order('created_at', { ascending: false })
                .limit(50);
            
            if (!error && data) {
                history = data;
            }
        } catch (historyError) {
            console.error("Erro ao buscar histórico de pontos:", historyError);
        }
        
        // Renderizar histórico
        tbody.innerHTML = '';
        
        if (history.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-4 text-center">
                        Nenhum registro de distribuição de pontos encontrado
                    </td>
                </tr>
            `;
            return;
        }
        
        history.forEach(item => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            
            // Formatar data
            const date = new Date(item.created_at);
            const formattedDate = date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Determinar classe de pontos
            const isPositive = item.points > 0;
            const pointsClass = isPositive ? 'text-green-600' : 'text-red-600';
            const pointsPrefix = isPositive ? '+' : '';
            
            // Determinar tipo de ponto
            const pointTypeText = item.point_type === 'coins' ? 'FLOWER COINS' : 'FLOWER META';
            
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${formattedDate}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${item.users?.username || 'Funcionário'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium ${pointsClass}">${pointsPrefix}${item.points}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.point_type === 'coins' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }">
                        ${pointTypeText}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${item.reason || '-'}
                </td>
            `;
            
            tbody.appendChild(row);
        });
        
    } catch (error) {
        console.error("Erro ao carregar histórico de pontos:", error);
        
        const tbody = document.getElementById('pointsHistoryTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-4 text-center text-red-500">
                        Erro ao carregar histórico: ${error.message || 'Erro desconhecido'}
                        <div class="mt-2">
                            <button onclick="loadPointsHistory()" class="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm">
                                Tentar novamente
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }
    }
}