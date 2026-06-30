// Sistema de gerenciamento de ações para FLOWER COINS
// Este arquivo contém as funções para transformar a área de "Ações de Funcionários" na principal área de gerenciamento

// Função para carregar a área de ações de funcionários
async function loadActions() {
    try {
        const section = document.getElementById('actions-section');
        if (!section) return;
        
        section.innerHTML = `
            <h2 class="text-2xl font-bold text-white mb-6">Gerenciamento de Funcionários</h2>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <!-- Estatísticas gerais -->
                <div class="card p-6">
                    <h3 class="text-lg font-bold mb-4 flex items-center">
                        <i class="fas fa-chart-bar text-pink-500 mr-2"></i>
                        Estatísticas de Funcionários
                    </h3>
                    <div class="space-y-4" id="employee-stats">
                        <div class="flex justify-between border-b pb-2">
                            <span class="text-gray-600">Total de Funcionários:</span>
                            <span class="font-bold" id="total-employees-count">Carregando...</span>
                        </div>
                        <div class="flex justify-between border-b pb-2">
                            <span class="text-gray-600">Funcionários Ativos:</span>
                            <span class="font-bold text-green-600" id="active-employees-count">Carregando...</span>
                        </div>
                        <div class="flex justify-between border-b pb-2">
                            <span class="text-gray-600">Funcionários Inativos:</span>
                            <span class="font-bold text-red-600" id="inactive-employees-count">Carregando...</span>
                        </div>
                        <div class="flex justify-between border-b pb-2">
                            <span class="text-gray-600">Média de Pontos:</span>
                            <span class="font-bold text-blue-600" id="average-points">Carregando...</span>
                        </div>
                    </div>
                </div>
                
                <!-- Busca e filtros -->
                <div class="card p-6 lg:col-span-2">
                    <h3 class="text-lg font-bold mb-4 flex items-center">
                        <i class="fas fa-search text-pink-500 mr-2"></i>
                        Buscar Funcionário
                    </h3>
                    <div class="flex flex-wrap gap-4">
                        <div class="flex-1 min-w-[200px]">
                            <input type="text" id="employee-search" placeholder="Nome do funcionário..." 
                                class="w-full px-4 py-2 border rounded-lg">
                        </div>
                        <div>
                            <select id="employee-status-filter" class="px-4 py-2 border rounded-lg">
                                <option value="all">Todos</option>
                                <option value="active">Ativos</option>
                                <option value="inactive">Inativos</option>
                            </select>
                        </div>
                        <div>
                            <button onclick="searchEmployees()" class="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg">
                                <i class="fas fa-search mr-2"></i>Buscar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Lista de funcionários -->
            <div class="card p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold">Lista de Funcionários</h3>
                    <div>
                        <button onclick="exportEmployeeList()" class="text-gray-600 hover:text-gray-800 mr-2" title="Exportar lista">
                            <i class="fas fa-file-export"></i>
                        </button>
                        <button onclick="showCreateEmployeeModal()" class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg">
                            <i class="fas fa-user-plus mr-1"></i> Novo Funcionário
                        </button>
                    </div>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="min-w-full bg-white rounded-lg overflow-hidden">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credenciais</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departamento</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pontos</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody id="employees-table-body" class="divide-y divide-gray-200">
                            <tr>
                                <td colspan="6" class="px-6 py-4 text-center">
                                    <div class="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-pink-500 mr-2"></div>
                                    Carregando funcionários...
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        // Inicializar componentes
        loadEmployeeData();
        
        // Adicionar event listeners
        document.getElementById('employee-search').addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                searchEmployees();
            }
        });
        
        document.getElementById('employee-status-filter').addEventListener('change', searchEmployees);
        
    } catch (error) {
        console.error("Erro ao inicializar área de Ações de Funcionários:", error);
        
        const section = document.getElementById('actions-section');
        if (section) {
            section.innerHTML += `
                <div class="card bg-red-50 border border-red-300 p-6 mt-4">
                    <div class="flex items-center">
                        <div class="text-red-500 text-3xl mr-4">
                            <i class="fas fa-exclamation-circle"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold text-red-700 mb-2">Erro ao carregar gerenciamento de funcionários</h3>
                            <p class="text-red-600">${error.message || 'Erro desconhecido'}</p>
                            <button onclick="loadActions()" class="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded mt-3">
                                Tentar novamente
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }
}

// Função para carregar dados dos funcionários
async function loadEmployeeData() {
    try {
        // Carregar funcionários
        const { data: employees, error: employeesError } = await supabaseClient
            .from('users')
            .select('id, username, email, department, avatar, created_at, is_active, password_text')
            .eq('is_admin', false);
        
        if (employeesError) throw employeesError;
        
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
        
        // Atualizar estatísticas
        const totalEmployees = employees ? employees.length : 0;
        const activeEmployees = employees ? employees.filter(emp => emp.is_active !== false).length : 0;
        const inactiveEmployees = totalEmployees - activeEmployees;
        
        let totalPoints = 0;
        if (stats && stats.length > 0) {
            stats.forEach(stat => {
                totalPoints += (stat.total_points || 0) + (stat.meta_points || 0);
            });
        }
        
        const averagePoints = totalEmployees > 0 ? Math.round(totalPoints / totalEmployees) : 0;
        
        document.getElementById('total-employees-count').textContent = totalEmployees;
        document.getElementById('active-employees-count').textContent = activeEmployees;
        document.getElementById('inactive-employees-count').textContent = inactiveEmployees;
        document.getElementById('average-points').textContent = averagePoints;
        
        // Renderizar tabela de funcionários
        renderEmployeeTable(employees, statsMap);
        
    } catch (error) {
        console.error("Erro ao carregar dados dos funcionários:", error);
        
        // Atualizar elementos com erro
        document.getElementById('total-employees-count').textContent = 'Erro';
        document.getElementById('active-employees-count').textContent = 'Erro';
        document.getElementById('inactive-employees-count').textContent = 'Erro';
        document.getElementById('average-points').textContent = 'Erro';
        
        const tableBody = document.getElementById('employees-table-body');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-4 text-center text-red-500">
                        Erro ao carregar funcionários: ${error.message || 'Erro desconhecido'}
                        <div class="mt-2">
                            <button onclick="loadEmployeeData()" class="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm">
                                Tentar novamente
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }
    }
}

// Função para renderizar a tabela de funcionários
function renderEmployeeTable(employees, statsMap) {
    const tableBody = document.getElementById('employees-table-body');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (!employees || employees.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-4 text-center">
                    Nenhum funcionário encontrado
                </td>
            </tr>
        `;
        return;
    }
    
    employees.forEach(employee => {
        const userStats = statsMap[employee.user_id] || { total_points: 0, meta_points: 0 };
        const totalPoints = (userStats.total_points || 0) + (userStats.meta_points || 0);
        
        // Avatar do funcionário
        const avatarHtml = employee.avatar ? 
            `<img src="${employee.avatar}" alt="${employee.username}" class="h-10 w-10 rounded-full object-cover">` :
            `<div class="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span class="text-gray-700 font-medium">${employee.username.charAt(0).toUpperCase()}</span>
            </div>`;
        
        // Status do funcionário
        const isActive = employee.is_active !== false;
        const statusClass = isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
        const statusText = isActive ? 'Ativo' : 'Inativo';
        
        // Credenciais (nome de usuário e senha)
        const passwordText = employee.password_text || 'Senha personalizada';
        
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                        ${avatarHtml}
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${employee.username}</div>
                        <div class="text-xs text-gray-500">${employee.email || 'Sem email'}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm">
                    <div class="font-medium">Login: ${employee.username}</div>
                    <div class="text-gray-500 flex items-center">
                        <span class="password-mask mr-1">••••••••</span>
                        <button onclick="togglePasswordVisibility(this, '${passwordText}')" class="text-blue-500 hover:text-blue-700 text-xs">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${employee.department || 'COSTURA'}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm">
                    <div><span class="text-green-600 font-medium">${userStats.total_points || 0}</span> coins</div>
                    <div><span class="text-yellow-600 font-medium">${userStats.meta_points || 0}</span> meta</div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                    ${statusText}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                    <button onclick="editEmployee('${employee.id}')" class="text-blue-600 hover:text-blue-900" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${isActive ? 
                        `<button onclick="toggleEmployeeStatus('${employee.id}', false)" class="text-red-600 hover:text-red-900" title="Desativar">
                            <i class="fas fa-user-slash"></i>
                        </button>` :
                        `<button onclick="toggleEmployeeStatus('${employee.id}', true)" class="text-green-600 hover:text-green-900" title="Ativar">
                            <i class="fas fa-user-check"></i>
                        </button>`
                    }
                    <button onclick="managePoints('${employee.id}', '${employee.username}')" class="text-yellow-600 hover:text-yellow-900" title="Gerenciar pontos">
                        <i class="fas fa-coins"></i>
                    </button>
                    <button onclick="deleteEmployee('${employee.id}', '${employee.username}')" class="text-red-800 hover:text-red-900" title="Excluir">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Função para alternar visibilidade da senha
function togglePasswordVisibility(buttonElement, password) {
    const passwordSpan = buttonElement.parentElement.querySelector('.password-mask');
    const icon = buttonElement.querySelector('i');
    
    if (passwordSpan.textContent === '••••••••') {
        passwordSpan.textContent = password;
        icon.className = 'fas fa-eye-slash';
    } else {
        passwordSpan.textContent = '••••••••';
        icon.className = 'fas fa-eye';
    }
}

// Função para buscar funcionários
function searchEmployees() {
    const searchTerm = document.getElementById('employee-search').value.toLowerCase();
    const statusFilter = document.getElementById('employee-status-filter').value;
    
    const tableRows = document.querySelectorAll('#employees-table-body tr');
    let matchCount = 0;
    
    tableRows.forEach(row => {
        if (row.cells.length < 2) return; // Ignorar linhas de mensagem
        
        const nameText = row.cells[0].textContent.toLowerCase();
        const statusText = row.cells[4].textContent.trim().toLowerCase();
        
        // Verificar filtro de busca
        const matchesSearch = searchTerm === '' || nameText.includes(searchTerm);
        
        // Verificar filtro de status
        let matchesStatus = true;
        if (statusFilter === 'active') {
            matchesStatus = statusText === 'ativo';
        } else if (statusFilter === 'inactive') {
            matchesStatus = statusText === 'inativo';
        }
        
        // Mostrar ou ocultar com base nos filtros
        if (matchesSearch && matchesStatus) {
            row.style.display = '';
            matchCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    // Se nenhum resultado for encontrado, mostrar mensagem
    const tbody = document.getElementById('employees-table-body');
    if (matchCount === 0 && tbody) {
        // Remover mensagem anterior se existir
        const existingMessage = tbody.querySelector('.no-results-message');
        if (existingMessage) existingMessage.remove();
        
        const messageRow = document.createElement('tr');
        messageRow.className = 'no-results-message';
        messageRow.innerHTML = `
            <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                Nenhum funcionário encontrado com os filtros selecionados
            </td>
        `;
        tbody.appendChild(messageRow);
    } else {
        // Remover mensagem se existir e houver resultados
        const existingMessage = tbody.querySelector('.no-results-message');
        if (existingMessage) existingMessage.remove();
    }
}

// Função para exportar lista de funcionários
function exportEmployeeList() {
    try {
        const table = document.querySelector('#employees-table-body').parentElement;
        if (!table) return;
        
        // Criar string CSV
        let csv = [];
        
        // Cabeçalho
        const header = ['Nome', 'Email', 'Departamento', 'Pontos Coins', 'Pontos Meta', 'Status'];
        csv.push(header.join(','));
        
        // Linhas
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            if (row.style.display === 'none' || row.cells.length < 6) return; // Ignorar linhas ocultas ou mensagens
            
            const name = row.cells[0].textContent.trim().split('\n')[0];
            const email = row.cells[0].textContent.trim().split('\n')[1] || '';
            const department = row.cells[2].textContent.trim();
            
            const pointsText = row.cells[3].textContent.trim();
            const coinsMatch = pointsText.match(/(\d+)\s+coins/);
            const metaMatch = pointsText.match(/(\d+)\s+meta/);
            const pointsCoins = coinsMatch ? coinsMatch[1] : '0';
            const pointsMeta = metaMatch ? metaMatch[1] : '0';
            
            const status = row.cells[4].textContent.trim();
            
            csv.push([name, email, department, pointsCoins, pointsMeta, status].join(','));
        });
        
        // Criar blob e link para download
        const csvContent = csv.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', `funcionarios_flower_coins_${new Date().toISOString().split('T')[0]}.csv`);
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error("Erro ao exportar lista de funcionários:", error);
        alert(`Erro ao exportar lista: ${error.message || 'Erro desconhecido'}`);
    }
}

// Função para excluir funcionário
async function deleteEmployee(id, username) {
    try {
        if (!confirm(`ATENÇÃO: Você está prestes a excluir permanentemente o funcionário "${username}" e todos os seus dados. Esta ação não pode ser desfeita!\n\nDeseja continuar?`)) {
            return;
        }
        
        // Verificar segunda confirmação
        if (!confirm(`Última chance: Tem certeza que deseja excluir definitivamente o funcionário "${username}"?`)) {
            return;
        }
        
        // Excluir funcionário
        const { error } = await supabaseClient
            .from('users')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        alert(`Funcionário "${username}" excluído com sucesso!`);
        loadEmployeeData(); // Recarregar dados
        
    } catch (error) {
        console.error("Erro ao excluir funcionário:", error);
        alert(`Erro ao excluir funcionário: ${error.message || 'Erro desconhecido'}`);
    }
}

// Função para mostrar modal de gerenciamento de pontos
function managePoints(userId, username) {
    try {
        // Criar modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.id = 'pointsModal';
        
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div class="p-4 border-b flex justify-between items-center">
                    <h3 class="text-lg font-bold">Gerenciar Pontos: ${username}</h3>
                    <button onclick="document.getElementById('pointsModal').remove()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="p-6">
                    <form id="pointsForm" class="space-y-4">
                        <div class="mb-4">
                            <label class="block text-gray-700 font-medium mb-2">Tipo de Pontos</label>
                            <div class="flex gap-4">
                                <label class="flex items-center">
                                    <input type="radio" name="pointType" value="coins" checked class="mr-2">
                                    <span>Flower Coins</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="radio" name="pointType" value="meta" class="mr-2">
                                    <span>Flower Meta</span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="mb-4">
                            <label class="block text-gray-700 font-medium mb-2">Ação</label>
                            <div class="flex gap-4">
                                <label class="flex items-center">
                                    <input type="radio" name="action" value="add" checked class="mr-2">
                                    <span class="text-green-600">Adicionar</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="radio" name="action" value="remove" class="mr-2">
                                    <span class="text-red-600">Remover</span>
                                </label>
                            </div>
                        </div>
                        
                        <div>
                            <label for="pointsAmount" class="block text-gray-700 font-medium mb-2">Quantidade</label>
                            <input type="number" id="pointsAmount" min="1" value="10" class="w-full px-3 py-2 border rounded-lg">
                        </div>
                        
                        <div>
                            <label for="pointsReason" class="block text-gray-700 font-medium mb-2">Motivo (opcional)</label>
                            <textarea id="pointsReason" rows="2" class="w-full px-3 py-2 border rounded-lg" 
                                placeholder="Ex: Bônus por desempenho excepcional"></textarea>
                        </div>
                        
                        <div>
                            <label for="notifyUser" class="flex items-center">
                                <input type="checkbox" id="notifyUser" checked class="mr-2">
                                <span>Notificar funcionário</span>
                            </label>
                        </div>
                        
                        <div class="flex justify-end pt-4">
                            <button type="button" onclick="document.getElementById('pointsModal').remove()" class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg mr-2">
                                Cancelar
                            </button>
                            <button type="submit" class="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg">
                                <i class="fas fa-check mr-1"></i> Confirmar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Adicionar evento de submit ao formulário
        document.getElementById('pointsForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const pointType = document.querySelector('input[name="pointType"]:checked').value;
            const action = document.querySelector('input[name="action"]:checked').value;
            const amount = parseInt(document.getElementById('pointsAmount').value) || 0;
            const reason = document.getElementById('pointsReason').value.trim();
            const shouldNotify = document.getElementById('notifyUser').checked;
            
            // Validação
            if (amount <= 0) {
                alert('A quantidade deve ser maior que zero.');
                return;
            }
            
            try {
                // Desabilitar botão de submit
                const submitButton = document.querySelector('#pointsForm button[type="submit"]');
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Processando...';
                
                // Buscar estatísticas atuais do usuário
                const { data: userStats, error: statsError } = await supabaseClient
                    .from('user_stats')
                    .select('*')
                    .eq('user_id', userId)
                    .single();
                
                if (statsError) throw statsError;
                
                // Se não existirem estatísticas, criar um registro
                if (!userStats) {
                    throw new Error('Estatísticas do usuário não encontradas');
                }
                
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
                    .eq('user_id', userId);
                
                if (updateError) throw updateError;
                
                // Criar registro no histórico de pontos
                const pointsHistoryData = {
                    user_id: userId,
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
                        const pointTypeText = pointType === 'coins' ? 'FLOWER COINS' : 'FLOWER META';
                        
                        const notificationData = {
                            title: notificationTitle,
                            message: `${action === 'add' ? 'Adicionados' : 'Removidos'} ${amount} pontos ${pointTypeText}${reason ? `: ${reason}` : ''}`,
                            type: notificationType,
                            user_id: userId,
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
                
                alert(`Pontos ${action === 'add' ? 'adicionados' : 'removidos'} com sucesso!`);
                document.getElementById('pointsModal').remove();
                loadEmployeeData(); // Recarregar dados
                
            } catch (error) {
                console.error("Erro ao gerenciar pontos:", error);
                alert(`Erro ao gerenciar pontos: ${error.message || 'Erro desconhecido'}`);
                
                // Re-habilitar botão de submit
                const submitButton = document.querySelector('#pointsForm button[type="submit"]');
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = '<i class="fas fa-check mr-1"></i> Confirmar';
                }
            }
        });
        
    } catch (error) {
        console.error("Erro ao abrir modal de gerenciamento de pontos:", error);
        alert(`Erro ao abrir modal: ${error.message || 'Erro desconhecido'}`);
    }
}

// Função para mostrar modal de criação de funcionário
function showCreateEmployeeModal() {
    try {
        // Modal para criar funcionário
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.id = 'createEmployeeModal';
        
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div class="p-4 border-b flex justify-between items-center">
                    <h3 class="text-lg font-bold">Novo Funcionário</h3>
                    <button onclick="document.getElementById('createEmployeeModal').remove()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="p-6">
                    <form id="createEmployeeForm" class="space-y-4">
                        <div>
                            <label for="newUsername" class="block text-sm font-medium text-gray-700 mb-1">Nome de usuário *</label>
                            <input type="text" id="newUsername" class="w-full px-3 py-2 border rounded-lg" required>
                        </div>
                        <div>
                            <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">Senha *</label>
                            <input type="password" id="newPassword" class="w-full px-3 py-2 border rounded-lg" required>
                        </div>
                        <div>
                            <label for="newEmail" class="block text-sm font-medium text-gray-700 mb-1">Email (opcional)</label>
                            <input type="email" id="newEmail" class="w-full px-3 py-2 border rounded-lg">
                        </div>
                        <div>
                            <label for="newDepartment" class="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                            <input type="text" id="newDepartment" class="w-full px-3 py-2 border rounded-lg" value="COSTURA">
                        </div>
                        <div class="flex justify-end pt-4">
                            <button type="button" onclick="document.getElementById('createEmployeeModal').remove()" class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg mr-2">
                                Cancelar
                            </button>
                            <button type="submit" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg">
                                <i class="fas fa-plus mr-1"></i> Criar Funcionário
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Adicionar evento de submit ao formulário
        document.getElementById('createEmployeeForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('newUsername').value.trim();
            const password = document.getElementById('newPassword').value.trim();
            const email = document.getElementById('newEmail').value.trim();
            const department = document.getElementById('newDepartment').value.trim();
            
            // Validação
            if (!username || !password) {
                alert('Por favor, preencha o nome de usuário e senha.');
                return;
            }
            
            try {
                // Desabilitar botão de submit
                const submitButton = document.querySelector('#createEmployeeForm button[type="submit"]');
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Criando...';
                
                // Verificar se usuário já existe
                const { data: existingUsers, error: checkError } = await supabaseClient
                    .from('users')
                    .select('id')
                    .eq('username', username);
                
                if (checkError) throw checkError;
                
                if (existingUsers && existingUsers.length > 0) {
                    alert(`Usuário "${username}" já existe!`);
                    submitButton.disabled = false;
                    submitButton.innerHTML = '<i class="fas fa-plus mr-1"></i> Criar Funcionário';
                    return;
                }
                
                // Criar usuário
                const userData = {
                    username,
                    email: email || null,
                    department,
                    is_admin: false,
                    is_active: true,
                    password_text: password, // Guardar em texto para referência
                    created_at: new Date().toISOString()
                };
                
                // Inserir usuário no banco
                const { data, error } = await supabaseClient
                    .from('users')
                    .insert([userData])
                    .select();
                
                if (error) throw error;
                
                // Criar registro de estatísticas
                if (data && data[0]) {
                    const newUserId = data[0].id;
                    
                    const statsData = {
                        user_id: newUserId,
                        total_points: 0,
                        meta_points: 0,
                        level: 1,
                        created_at: new Date().toISOString()
                    };
                    
                    await supabaseClient
                        .from('user_stats')
                        .insert([statsData]);
                }
                
                alert(`Funcionário "${username}" criado com sucesso!`);
                document.getElementById('createEmployeeModal').remove();
                loadEmployeeData(); // Recarregar dados
                
            } catch (error) {
                console.error("Erro ao criar funcionário:", error);
                alert(`Erro ao criar funcionário: ${error.message || 'Erro desconhecido'}`);
                
                // Re-habilitar botão de submit
                const submitButton = document.querySelector('#createEmployeeForm button[type="submit"]');
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = '<i class="fas fa-plus mr-1"></i> Criar Funcionário';
                }
            }
        });
        
    } catch (error) {
        console.error("Erro ao abrir modal de criação de funcionário:", error);
        alert(`Erro ao abrir modal: ${error.message || 'Erro desconhecido'}`);
    }
}