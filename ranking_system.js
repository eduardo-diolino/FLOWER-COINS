// Sistema de ranking para FLOWER COINS
// Este arquivo contém as funções para separar os rankings de Flower Coin e Flower Meta

// Função para carregar a área de rankings no painel administrativo
async function loadRankings() {
    try {
        const section = document.getElementById('rankings-section');
        if (!section) return;
        
        section.innerHTML = `
            <h2 class="text-2xl font-bold text-white mb-6">Rankings</h2>
            
            <!-- Abas de Ranking -->
            <div class="flex border-b border-gray-200 mb-6">
                <button class="ranking-tab active py-2 px-4 font-medium border-b-2 border-pink-500 text-pink-600" data-type="coins">
                    Flower Coins
                </button>
                <button class="ranking-tab py-2 px-4 font-medium border-b-2 border-transparent hover:text-gray-700" data-type="meta">
                    Flower Meta
                </button>
                <button class="ranking-tab py-2 px-4 font-medium border-b-2 border-transparent hover:text-gray-700" data-type="combined">
                    Ranking Combinado
                </button>
            </div>
            
            <!-- Conteúdo do Ranking (Flower Coins) -->
            <div id="ranking-coins" class="ranking-content">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <!-- Top 3 Cards -->
                    <div id="coins-top3-container" class="grid grid-cols-3 col-span-3 gap-4">
                        <div class="text-center col-span-3">
                            <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500 mx-auto"></div>
                            <p class="text-gray-500 mt-2">Carregando ranking...</p>
                        </div>
                    </div>
                    
                    <!-- Lista completa -->
                    <div class="col-span-3">
                        <div class="card p-6">
                            <h3 class="text-lg font-bold mb-4">Ranking Completo - Flower Coins</h3>
                            <div class="overflow-x-auto" id="coins-ranking-table">
                                <div class="text-center p-6">
                                    <div class="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-pink-500 mx-auto mb-2"></div>
                                    <p class="text-gray-500">Carregando ranking completo...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Conteúdo do Ranking (Flower Meta) -->
            <div id="ranking-meta" class="ranking-content hidden">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <!-- Top 3 Cards -->
                    <div id="meta-top3-container" class="grid grid-cols-3 col-span-3 gap-4">
                        <div class="text-center col-span-3">
                            <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500 mx-auto"></div>
                            <p class="text-gray-500 mt-2">Carregando ranking...</p>
                        </div>
                    </div>
                    
                    <!-- Lista completa -->
                    <div class="col-span-3">
                        <div class="card p-6">
                            <h3 class="text-lg font-bold mb-4">Ranking Completo - Flower Meta</h3>
                            <div class="overflow-x-auto" id="meta-ranking-table">
                                <div class="text-center p-6">
                                    <div class="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-yellow-500 mx-auto mb-2"></div>
                                    <p class="text-gray-500">Carregando ranking completo...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Conteúdo do Ranking (Combinado) -->
            <div id="ranking-combined" class="ranking-content hidden">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <!-- Top 3 Cards -->
                    <div id="combined-top3-container" class="grid grid-cols-3 col-span-3 gap-4">
                        <div class="text-center col-span-3">
                            <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                            <p class="text-gray-500 mt-2">Carregando ranking...</p>
                        </div>
                    </div>
                    
                    <!-- Lista completa -->
                    <div class="col-span-3">
                        <div class="card p-6">
                            <h3 class="text-lg font-bold mb-4">Ranking Completo - Pontuação Total</h3>
                            <div class="overflow-x-auto" id="combined-ranking-table">
                                <div class="text-center p-6">
                                    <div class="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500 mx-auto mb-2"></div>
                                    <p class="text-gray-500">Carregando ranking completo...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Configurações de Ranking -->
            <div class="card p-6">
                <h3 class="text-lg font-bold mb-4">Configurações de Ranking</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 class="text-md font-medium mb-2">Exibição no Painel do Funcionário</h4>
                        <div class="space-y-2">
                            <label class="flex items-center">
                                <input type="checkbox" id="show-coins-ranking" checked class="mr-2">
                                <span>Mostrar ranking de Flower Coins</span>
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" id="show-meta-ranking" checked class="mr-2">
                                <span>Mostrar ranking de Flower Meta</span>
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" id="show-combined-ranking" class="mr-2">
                                <span>Mostrar ranking combinado</span>
                            </label>
                        </div>
                    </div>
                    <div>
                        <h4 class="text-md font-medium mb-2">Premiações Automáticas</h4>
                        <div class="space-y-2">
                            <label class="flex items-center">
                                <input type="checkbox" id="enable-auto-rewards" class="mr-2">
                                <span>Habilitar premiações automáticas para os TOP 3</span>
                            </label>
                            <div class="pl-6 text-sm text-gray-500 mt-1">
                                <p>Define bônus automáticos para os 3 primeiros colocados no final de cada mês.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mt-4 flex justify-end">
                    <button onclick="saveRankingSettings()" class="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg">
                        <i class="fas fa-save mr-2"></i>Salvar Configurações
                    </button>
                </div>
            </div>
        `;
        
        // Adicionar eventos para as abas de ranking
        const tabs = document.querySelectorAll('.ranking-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remover classe active de todas as abas
                tabs.forEach(t => {
                    t.classList.remove('active');
                    t.classList.remove('border-pink-500', 'text-pink-600');
                    t.classList.add('border-transparent', 'hover:text-gray-700');
                });
                
                // Adicionar classe active na aba clicada
                tab.classList.add('active', 'border-pink-500', 'text-pink-600');
                tab.classList.remove('border-transparent', 'hover:text-gray-700');
                
                // Mostrar conteúdo correspondente
                const type = tab.getAttribute('data-type');
                document.querySelectorAll('.ranking-content').forEach(content => {
                    content.classList.add('hidden');
                });
                document.getElementById(`ranking-${type}`).classList.remove('hidden');
                
                // Carregar dados do ranking correspondente
                if (type === 'coins') {
                    loadCoinsRanking();
                } else if (type === 'meta') {
                    loadMetaRanking();
                } else {
                    loadCombinedRanking();
                }
            });
        });
        
        // Inicializar com ranking de Flower Coins
        loadCoinsRanking();
        loadRankingSettings();
        
    } catch (error) {
        console.error("Erro ao inicializar área de Rankings:", error);
        
        const section = document.getElementById('rankings-section');
        if (section) {
            section.innerHTML += `
                <div class="card bg-red-50 border border-red-300 p-6 mt-4">
                    <div class="flex items-center">
                        <div class="text-red-500 text-3xl mr-4">
                            <i class="fas fa-exclamation-circle"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold text-red-700 mb-2">Erro ao carregar rankings</h3>
                            <p class="text-red-600">${error.message || 'Erro desconhecido'}</p>
                            <button onclick="loadRankings()" class="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded mt-3">
                                Tentar novamente
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }
}

// Função para carregar ranking de Flower Coins
async function loadCoinsRanking() {
    try {
        // Buscar estatísticas de usuários
        const { data: userStats, error: statsError } = await supabaseClient
            .from('user_stats')
            .select(`
                user_id,
                total_points,
                users (
                    username,
                    avatar,
                    department,
                    is_active
                )
            `)
            .order('total_points', { ascending: false });
        
        if (statsError) throw statsError;
        
        // Filtrar apenas usuários ativos
        const activeUsers = userStats.filter(stat => stat.users?.is_active !== false);
        
        // Criar top 3
        const top3Container = document.getElementById('coins-top3-container');
        createTop3(top3Container, activeUsers, 'total_points', 'coin');
        
        // Criar tabela de ranking completo
        const rankingTable = document.getElementById('coins-ranking-table');
        createRankingTable(rankingTable, activeUsers, 'total_points', 'coin');
        
    } catch (error) {
        console.error("Erro ao carregar ranking de Flower Coins:", error);
        showRankingError('coins');
    }
}

// Função para carregar ranking de Flower Meta
async function loadMetaRanking() {
    try {
        // Buscar estatísticas de usuários
        const { data: userStats, error: statsError } = await supabaseClient
            .from('user_stats')
            .select(`
                user_id,
                meta_points,
                users (
                    username,
                    avatar,
                    department,
                    is_active
                )
            `)
            .order('meta_points', { ascending: false });
        
        if (statsError) throw statsError;
        
        // Filtrar apenas usuários ativos
        const activeUsers = userStats.filter(stat => stat.users?.is_active !== false);
        
        // Criar top 3
        const top3Container = document.getElementById('meta-top3-container');
        createTop3(top3Container, activeUsers, 'meta_points', 'meta');
        
        // Criar tabela de ranking completo
        const rankingTable = document.getElementById('meta-ranking-table');
        createRankingTable(rankingTable, activeUsers, 'meta_points', 'meta');
        
    } catch (error) {
        console.error("Erro ao carregar ranking de Flower Meta:", error);
        showRankingError('meta');
    }
}

// Função para carregar ranking combinado
async function loadCombinedRanking() {
    try {
        // Buscar estatísticas de usuários
        const { data: userStats, error: statsError } = await supabaseClient
            .from('user_stats')
            .select(`
                user_id,
                total_points,
                meta_points,
                users (
                    username,
                    avatar,
                    department,
                    is_active
                )
            `);
        
        if (statsError) throw statsError;
        
        // Filtrar apenas usuários ativos e calcular pontos totais
        const activeUsers = userStats
            .filter(stat => stat.users?.is_active !== false)
            .map(stat => ({
                ...stat,
                combined_points: (stat.total_points || 0) + (stat.meta_points || 0)
            }))
            .sort((a, b) => b.combined_points - a.combined_points);
        
        // Criar top 3
        const top3Container = document.getElementById('combined-top3-container');
        createTop3(top3Container, activeUsers, 'combined_points', 'combined');
        
        // Criar tabela de ranking completo
        const rankingTable = document.getElementById('combined-ranking-table');
        createRankingTable(rankingTable, activeUsers, 'combined_points', 'combined');
        
    } catch (error) {
        console.error("Erro ao carregar ranking combinado:", error);
        showRankingError('combined');
    }
}

// Função para criar top 3 cards
function createTop3(container, users, pointsField, type) {
    if (!container) return;
    
    // Limpar container
    container.innerHTML = '';
    
    // Se não houver usuários suficientes
    if (!users || users.length === 0) {
        container.innerHTML = `
            <div class="col-span-3 text-center p-6 bg-gray-50 rounded-lg">
                <div class="text-4xl mb-3 text-gray-300">
                    <i class="fas fa-trophy"></i>
                </div>
                <p class="text-gray-500">Nenhum funcionário encontrado no ranking</p>
            </div>
        `;
        return;
    }
    
    // Cores específicas para cada tipo de ranking
    let colors = {
        main: '',
        light: '',
        icon: ''
    };
    
    switch (type) {
        case 'coin':
            colors.main = 'bg-green-500';
            colors.light = 'bg-green-100';
            colors.text = 'text-green-800';
            colors.icon = 'fa-coins';
            break;
        case 'meta':
            colors.main = 'bg-yellow-500';
            colors.light = 'bg-yellow-100';
            colors.text = 'text-yellow-800';
            colors.icon = 'fa-star';
            break;
        case 'combined':
            colors.main = 'bg-purple-500';
            colors.light = 'bg-purple-100';
            colors.text = 'text-purple-800';
            colors.icon = 'fa-crown';
            break;
    }
    
    // Ordenar usuários por pontuação
    const topUsers = [...users].slice(0, 3);
    
    // Criar cards para o top 3
    const positions = [
        { order: 2, medal: '🥇', class: 'first-place' },
        { order: 1, medal: '🥈', class: 'second-place' },
        { order: 3, medal: '🥉', class: 'third-place' }
    ];
    
    positions.forEach((pos, index) => {
        const user = topUsers[pos.order - 1];
        if (!user) return; // Pular se não houver usuário para esta posição
        
        const points = user[pointsField] || 0;
        const username = user.users?.username || 'Funcionário';
        const department = user.users?.department || 'COSTURA';
        const avatar = user.users?.avatar;
        
        // Estilos específicos para cada posição
        let cardClass = '';
        let pointsClass = '';
        
        switch (pos.order) {
            case 1:
                cardClass = 'col-span-3 md:col-span-1 order-1 md:order-2 transform md:scale-110 z-10 shadow-lg bg-gradient-to-b from-yellow-50 to-yellow-100 border-yellow-300';
                pointsClass = 'text-4xl text-yellow-600';
                break;
            case 2:
                cardClass = 'col-span-3 md:col-span-1 order-2 md:order-1 bg-gradient-to-b from-gray-50 to-gray-100 border-gray-300';
                pointsClass = 'text-3xl text-gray-600';
                break;
            case 3:
                cardClass = 'col-span-3 md:col-span-1 order-3 bg-gradient-to-b from-amber-50 to-amber-100 border-amber-300';
                pointsClass = 'text-3xl text-amber-600';
                break;
        }
        
        const card = document.createElement('div');
        card.className = `${cardClass} border rounded-lg p-4 flex flex-col items-center`;
        
        // Avatar do usuário
        const avatarHtml = avatar ? 
            `<img src="${avatar}" alt="${username}" class="h-20 w-20 rounded-full object-cover mb-2 border-4 border-white shadow">` : 
            `<div class="h-20 w-20 bg-gray-200 rounded-full flex items-center justify-center mb-2 border-4 border-white shadow">
                <span class="text-2xl text-gray-700 font-bold">${username.charAt(0).toUpperCase()}</span>
            </div>`;
        
        card.innerHTML = `
            <div class="text-4xl mb-1">${pos.medal}</div>
            ${avatarHtml}
            <h3 class="font-bold text-lg mb-1">${username}</h3>
            <p class="text-sm text-gray-500 mb-3">${department}</p>
            <div class="flex items-center justify-center ${colors.light} ${colors.text} px-4 py-2 rounded-full">
                <i class="fas ${colors.icon} mr-2"></i>
                <span class="font-bold">${points}</span>
                <span class="ml-1 text-sm">${type === 'coin' ? 'coins' : type === 'meta' ? 'meta' : 'pontos'}</span>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Função para criar tabela de ranking completo
function createRankingTable(container, users, pointsField, type) {
    if (!container) return;
    
    // Limpar container
    container.innerHTML = '';
    
    // Se não houver usuários
    if (!users || users.length === 0) {
        container.innerHTML = `
            <div class="text-center p-6 bg-gray-50 rounded-lg">
                <p class="text-gray-500">Nenhum funcionário encontrado no ranking</p>
            </div>
        `;
        return;
    }
    
    // Cores específicas para cada tipo de ranking
    let colors = {
        header: '',
        text: ''
    };
    
    switch (type) {
        case 'coin':
            colors.header = 'bg-green-50';
            colors.text = 'text-green-800';
            break;
        case 'meta':
            colors.header = 'bg-yellow-50';
            colors.text = 'text-yellow-800';
            break;
        case 'combined':
            colors.header = 'bg-purple-50';
            colors.text = 'text-purple-800';
            break;
    }
    
    // Criar tabela
    const table = document.createElement('table');
    table.className = 'min-w-full bg-white rounded-lg overflow-hidden';
    
    // Cabeçalho da tabela
    table.innerHTML = `
        <thead class="${colors.header}">
            <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posição</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Funcionário</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departamento</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pontos</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
        </tbody>
    `;
    
    const tbody = table.querySelector('tbody');
    
    // Adicionar linhas para cada usuário
    users.forEach((user, index) => {
        const points = user[pointsField] || 0;
        const username = user.users?.username || 'Funcionário';
        const department = user.users?.department || 'COSTURA';
        const avatar = user.users?.avatar;
        
        // Destacar top 3
        let rowClass = '';
        let medalHtml = '';
        
        if (index === 0) {
            rowClass = 'bg-yellow-50';
            medalHtml = '<span class="text-lg mr-1">🥇</span>';
        } else if (index === 1) {
            rowClass = 'bg-gray-50';
            medalHtml = '<span class="text-lg mr-1">🥈</span>';
        } else if (index === 2) {
            rowClass = 'bg-amber-50';
            medalHtml = '<span class="text-lg mr-1">🥉</span>';
        }
        
        // Avatar do usuário
        const avatarHtml = avatar ? 
            `<img src="${avatar}" alt="${username}" class="h-10 w-10 rounded-full object-cover">` : 
            `<div class="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span class="text-gray-700 font-medium">${username.charAt(0).toUpperCase()}</span>
            </div>`;
        
        const row = document.createElement('tr');
        row.className = `${rowClass} hover:bg-gray-50`;
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center">
                    ${medalHtml}
                    <span>${index + 1}º</span>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                        ${avatarHtml}
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${username}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${department}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
                <span class="font-bold ${colors.text}">${points}</span>
                <span class="text-sm text-gray-500">${type === 'coin' ? 'coins' : type === 'meta' ? 'meta' : 'pontos'}</span>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    container.appendChild(table);
}

// Função para mostrar erro ao carregar ranking
function showRankingError(type) {
    // Limpar containers
    const top3Container = document.getElementById(`${type}-top3-container`);
    const rankingTable = document.getElementById(`${type}-ranking-table`);
    
    if (top3Container) {
        top3Container.innerHTML = `
            <div class="col-span-3 bg-red-100 text-red-800 p-4 rounded-lg">
                <div class="flex items-center">
                    <div class="flex-shrink-0 text-red-500 mr-2">
                        <i class="fas fa-exclamation-circle"></i>
                    </div>
                    <div>
                        <p class="font-bold">Erro ao carregar ranking</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    if (rankingTable) {
        rankingTable.innerHTML = `
            <div class="bg-red-100 text-red-800 p-4 rounded-lg">
                <div class="flex items-center">
                    <div class="flex-shrink-0 text-red-500 mr-2">
                        <i class="fas fa-exclamation-circle"></i>
                    </div>
                    <div>
                        <p class="font-bold">Erro ao carregar ranking</p>
                        <button onclick="load${type.charAt(0).toUpperCase() + type.slice(1)}Ranking()" class="bg-red-200 hover:bg-red-300 mt-2 px-3 py-1 rounded text-sm">
                            Tentar novamente
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

// Função para carregar configurações de ranking
async function loadRankingSettings() {
    try {
        // Buscar configurações
        const { data, error } = await supabaseClient
            .from('system_settings')
            .select('*')
            .eq('category', 'rankings')
            .single();
        
        if (error) {
            // Se a tabela ou registro não existir, criar
            if (error.code === 'PGRST116') {
                console.log("Configurações de rankings não encontradas, criando...");
                
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
                        show_coins_ranking: true,
                        show_meta_ranking: true,
                        show_combined_ranking: false,
                        enable_auto_rewards: false
                    };
                    
                    await supabaseClient
                        .from('system_settings')
                        .insert([{
                            category: 'rankings',
                            settings: defaultSettings,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }]);
                    
                    // Definir nos elementos da página
                    document.getElementById('show-coins-ranking').checked = defaultSettings.show_coins_ranking;
                    document.getElementById('show-meta-ranking').checked = defaultSettings.show_meta_ranking;
                    document.getElementById('show-combined-ranking').checked = defaultSettings.show_combined_ranking;
                    document.getElementById('enable-auto-rewards').checked = defaultSettings.enable_auto_rewards;
                    
                } catch (createError) {
                    console.error("Erro ao criar configurações de rankings:", createError);
                }
            } else {
                console.error("Erro ao buscar configurações de rankings:", error);
            }
            return;
        }
        
        // Se encontrou configurações, definir nos elementos da página
        if (data && data.settings) {
            const settings = data.settings;
            document.getElementById('show-coins-ranking').checked = settings.show_coins_ranking !== false;
            document.getElementById('show-meta-ranking').checked = settings.show_meta_ranking !== false;
            document.getElementById('show-combined-ranking').checked = settings.show_combined_ranking === true;
            document.getElementById('enable-auto-rewards').checked = settings.enable_auto_rewards === true;
        }
        
    } catch (error) {
        console.error("Erro ao carregar configurações de rankings:", error);
    }
}

// Função para salvar configurações de ranking
async function saveRankingSettings() {
    try {
        const showCoinsRanking = document.getElementById('show-coins-ranking').checked;
        const showMetaRanking = document.getElementById('show-meta-ranking').checked;
        const showCombinedRanking = document.getElementById('show-combined-ranking').checked;
        const enableAutoRewards = document.getElementById('enable-auto-rewards').checked;
        
        const settings = {
            show_coins_ranking: showCoinsRanking,
            show_meta_ranking: showMetaRanking,
            show_combined_ranking: showCombinedRanking,
            enable_auto_rewards: enableAutoRewards
        };
        
        // Verificar se já existe registro
        const { data, error } = await supabaseClient
            .from('system_settings')
            .select('*')
            .eq('category', 'rankings')
            .single();
        
        if (error) {
            // Se não existir, inserir
            await supabaseClient
                .from('system_settings')
                .insert([{
                    category: 'rankings',
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
        
        alert('Configurações de ranking salvas com sucesso!');
        
    } catch (error) {
        console.error("Erro ao salvar configurações de ranking:", error);
        alert(`Erro ao salvar configurações: ${error.message || 'Erro desconhecido'}`);
    }
}

// Função para carregar rankings no painel do funcionário
async function loadEmployeeRankings() {
    try {
        // Buscar configurações de ranking
        const { data: settingsData, error: settingsError } = await supabaseClient
            .from('system_settings')
            .select('settings')
            .eq('category', 'rankings')
            .single();
            
        // Definir configurações padrão se não encontrar
        let settings = {
            show_coins_ranking: true,
            show_meta_ranking: true,
            show_combined_ranking: false
        };
        
        if (!settingsError && settingsData && settingsData.settings) {
            settings = settingsData.settings;
        }
        
        // Container de ranking
        const rankingContainer = document.getElementById('ranking-tabs');
        if (!rankingContainer) return;
        
        // Criar abas com base nas configurações
        let tabsHtml = '';
        let contentHtml = '';
        
        // Adicionar abas e conteúdo para cada tipo de ranking habilitado
        if (settings.show_coins_ranking) {
            tabsHtml += `
                <button class="ranking-tab active py-2 px-4 font-medium border-b-2 border-pink-500 text-pink-600" data-type="coins">
                    Flower Coins
                </button>
            `;
            
            contentHtml += `
                <div id="ranking-coins-tab" class="ranking-content">
                    <div id="coins-ranking" class="space-y-2 mt-4">
                        <div class="text-center py-4">
                            <div class="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-pink-500 mx-auto mb-2"></div>
                            <p class="text-gray-500">Carregando ranking de Flower Coins...</p>
                        </div>
                    </div>
                </div>
            `;
        }
        
        if (settings.show_meta_ranking) {
            tabsHtml += `
                <button class="ranking-tab ${!settings.show_coins_ranking ? 'active border-pink-500 text-pink-600' : 'border-transparent hover:text-gray-700'} py-2 px-4 font-medium border-b-2" data-type="meta">
                    Flower Meta
                </button>
            `;
            
            contentHtml += `
                <div id="ranking-meta-tab" class="ranking-content ${settings.show_coins_ranking ? 'hidden' : ''}">
                    <div id="meta-ranking" class="space-y-2 mt-4">
                        <div class="text-center py-4">
                            <div class="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-yellow-500 mx-auto mb-2"></div>
                            <p class="text-gray-500">Carregando ranking de Flower Meta...</p>
                        </div>
                    </div>
                </div>
            `;
        }
        
        if (settings.show_combined_ranking) {
            tabsHtml += `
                <button class="ranking-tab ${!settings.show_coins_ranking && !settings.show_meta_ranking ? 'active border-pink-500 text-pink-600' : 'border-transparent hover:text-gray-700'} py-2 px-4 font-medium border-b-2" data-type="combined">
                    Ranking Total
                </button>
            `;
            
            contentHtml += `
                <div id="ranking-combined-tab" class="ranking-content ${settings.show_coins_ranking || settings.show_meta_ranking ? 'hidden' : ''}">
                    <div id="combined-ranking" class="space-y-2 mt-4">
                        <div class="text-center py-4">
                            <div class="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500 mx-auto mb-2"></div>
                            <p class="text-gray-500">Carregando ranking combinado...</p>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Inserir HTML no container
        rankingContainer.innerHTML = `
            <div class="flex border-b border-gray-200">
                ${tabsHtml}
            </div>
            ${contentHtml}
        `;
        
        // Adicionar eventos para as abas
        const tabs = document.querySelectorAll('.ranking-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remover classe active de todas as abas
                tabs.forEach(t => {
                    t.classList.remove('active');
                    t.classList.remove('border-pink-500', 'text-pink-600');
                    t.classList.add('border-transparent', 'hover:text-gray-700');
                });
                
                // Adicionar classe active na aba clicada
                tab.classList.add('active', 'border-pink-500', 'text-pink-600');
                tab.classList.remove('border-transparent', 'hover:text-gray-700');
                
                // Mostrar conteúdo correspondente
                const type = tab.getAttribute('data-type');
                document.querySelectorAll('.ranking-content').forEach(content => {
                    content.classList.add('hidden');
                });
                document.getElementById(`ranking-${type}-tab`).classList.remove('hidden');
            });
        });
        
        // Carregar dados para os rankings habilitados
        if (settings.show_coins_ranking) {
            loadEmployeeCoinsRanking();
        }
        
        if (settings.show_meta_ranking) {
            loadEmployeeMetaRanking();
        }
        
        if (settings.show_combined_ranking) {
            loadEmployeeCombinedRanking();
        }
        
    } catch (error) {
        console.error("Erro ao carregar rankings para funcionário:", error);
        
        const rankingContainer = document.getElementById('ranking-tabs');
        if (rankingContainer) {
            rankingContainer.innerHTML = `
                <div class="bg-red-100 text-red-800 p-4 rounded-lg">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 text-red-500 mr-2">
                            <i class="fas fa-exclamation-circle"></i>
                        </div>
                        <div>
                            <p class="font-bold">Erro ao carregar rankings</p>
                            <button onclick="loadEmployeeRankings()" class="bg-red-200 hover:bg-red-300 mt-2 px-3 py-1 rounded text-sm">
                                Tentar novamente
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }
}

// Função para carregar ranking de Flower Coins para funcionário
async function loadEmployeeCoinsRanking() {
    try {
        const container = document.getElementById('coins-ranking');
        if (!container) return;
        
        // Buscar estatísticas de usuários
        const { data: userStats, error: statsError } = await supabaseClient
            .from('user_stats')
            .select(`
                user_id,
                total_points,
                users (
                    username,
                    avatar,
                    department,
                    is_active
                )
            `)
            .order('total_points', { ascending: false });
        
        if (statsError) throw statsError;
        
        // Filtrar apenas usuários ativos
        const activeUsers = userStats.filter(stat => stat.users?.is_active !== false);
        
        // Encontrar posição do usuário atual
        const currentUserIndex = activeUsers.findIndex(user => user.user_id === currentUser.id);
        const currentUserRank = currentUserIndex !== -1 ? currentUserIndex + 1 : null;
        const currentUserStats = currentUserIndex !== -1 ? activeUsers[currentUserIndex] : null;
        
        // Renderizar ranking
        renderEmployeeRanking(container, activeUsers, 'total_points', 'coin', currentUserRank, currentUserStats);
        
    } catch (error) {
        console.error("Erro ao carregar ranking de Flower Coins para funcionário:", error);
        
        const container = document.getElementById('coins-ranking');
        if (container) {
            container.innerHTML = `
                <div class="bg-red-100 text-red-800 p-4 rounded-lg">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 text-red-500 mr-2">
                            <i class="fas fa-exclamation-circle"></i>
                        </div>
                        <div>
                            <p class="font-bold">Erro ao carregar ranking</p>
                            <button onclick="loadEmployeeCoinsRanking()" class="bg-red-200 hover:bg-red-300 mt-2 px-3 py-1 rounded text-sm">
                                Tentar novamente
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }
}

// Função para carregar ranking de Flower Meta para funcionário
async function loadEmployeeMetaRanking() {
    try {
        const container = document.getElementById('meta-ranking');
        if (!container) return;
        
        // Buscar estatísticas de usuários
        const { data: userStats, error: statsError } = await supabaseClient
            .from('user_stats')
            .select(`
                user_id,
                meta_points,
                users (
                    username,
                    avatar,
                    department,
                    is_active
                )
            `)
            .order('meta_points', { ascending: false });
        
        if (statsError) throw statsError;
        
        // Filtrar apenas usuários ativos
        const activeUsers = userStats.filter(stat => stat.users?.is_active !== false);
        
        // Encontrar posição do usuário atual
        const currentUserIndex = activeUsers.findIndex(user => user.user_id === currentUser.id);
        const currentUserRank = currentUserIndex !== -1 ? currentUserIndex + 1 : null;
        const currentUserStats = currentUserIndex !== -1 ? activeUsers[currentUserIndex] : null;
        
        // Renderizar ranking
        renderEmployeeRanking(container, activeUsers, 'meta_points', 'meta', currentUserRank, currentUserStats);
        
    } catch (error) {
        console.error("Erro ao carregar ranking de Flower Meta para funcionário:", error);
        
        const container = document.getElementById('meta-ranking');
        if (container) {
            container.innerHTML = `
                <div class="bg-red-100 text-red-800 p-4 rounded-lg">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 text-red-500 mr-2">
                            <i class="fas fa-exclamation-circle"></i>
                        </div>
                        <div>
                            <p class="font-bold">Erro ao carregar ranking</p>
                            <button onclick="loadEmployeeMetaRanking()" class="bg-red-200 hover:bg-red-300 mt-2 px-3 py-1 rounded text-sm">
                                Tentar novamente
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }
}

// Função para carregar ranking combinado para funcionário
async function loadEmployeeCombinedRanking() {
    try {
        const container = document.getElementById('combined-ranking');
        if (!container) return;
        
        // Buscar estatísticas de usuários
        const { data: userStats, error: statsError } = await supabaseClient
            .from('user_stats')
            .select(`
                user_id,
                total_points,
                meta_points,
                users (
                    username,
                    avatar,
                    department,
                    is_active
                )
            `);
        
        if (statsError) throw statsError;
        
        // Filtrar apenas usuários ativos e calcular pontos totais
        const activeUsers = userStats
            .filter(stat => stat.users?.is_active !== false)
            .map(stat => ({
                ...stat,
                combined_points: (stat.total_points || 0) + (stat.meta_points || 0)
            }))
            .sort((a, b) => b.combined_points - a.combined_points);
        
        // Encontrar posição do usuário atual
        const currentUserIndex = activeUsers.findIndex(user => user.user_id === currentUser.id);
        const currentUserRank = currentUserIndex !== -1 ? currentUserIndex + 1 : null;
        const currentUserStats = currentUserIndex !== -1 ? activeUsers[currentUserIndex] : null;
        
        // Renderizar ranking
        renderEmployeeRanking(container, activeUsers, 'combined_points', 'combined', currentUserRank, currentUserStats);
        
    } catch (error) {
        console.error("Erro ao carregar ranking combinado para funcionário:", error);
        
        const container = document.getElementById('combined-ranking');
        if (container) {
            container.innerHTML = `
                <div class="bg-red-100 text-red-800 p-4 rounded-lg">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 text-red-500 mr-2">
                            <i class="fas fa-exclamation-circle"></i>
                        </div>
                        <div>
                            <p class="font-bold">Erro ao carregar ranking</p>
                            <button onclick="loadEmployeeCombinedRanking()" class="bg-red-200 hover:bg-red-300 mt-2 px-3 py-1 rounded text-sm">
                                Tentar novamente
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }
}

// Função para renderizar ranking para funcionário
function renderEmployeeRanking(container, users, pointsField, type, currentUserRank, currentUserStats) {
    if (!container) return;
    
    // Limpar container
    container.innerHTML = '';
    
    // Se não houver usuários
    if (!users || users.length === 0) {
        container.innerHTML = `
            <div class="text-center p-6 bg-gray-50 rounded-lg">
                <p class="text-gray-500">Nenhum funcionário encontrado no ranking</p>
            </div>
        `;
        return;
    }
    
    // Cores específicas para cada tipo de ranking
    let colors = {
        bg: '',
        text: '',
        icon: ''
    };
    
    switch (type) {
        case 'coin':
            colors.bg = 'bg-green-100';
            colors.text = 'text-green-800';
            colors.icon = 'fa-coins';
            break;
        case 'meta':
            colors.bg = 'bg-yellow-100';
            colors.text = 'text-yellow-800';
            colors.icon = 'fa-star';
            break;
        case 'combined':
            colors.bg = 'bg-purple-100';
            colors.text = 'text-purple-800';
            colors.icon = 'fa-crown';
            break;
    }
    
    // Mostrar status do usuário atual
    if (currentUserStats) {
        const points = currentUserStats[pointsField] || 0;
        
        const userStatusCard = document.createElement('div');
        userStatusCard.className = `${colors.bg} rounded-lg p-4 mb-4`;
        
        userStatusCard.innerHTML = `
            <div class="flex justify-between items-center">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-12 w-12 ${colors.bg} rounded-full flex items-center justify-center mr-3">
                        <i class="fas ${colors.icon} text-xl ${colors.text}"></i>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Sua posição</p>
                        <p class="text-2xl font-bold ${colors.text}">${currentUserRank}º lugar</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-sm text-gray-600">${type === 'coin' ? 'Flower Coins' : type === 'meta' ? 'Flower Meta' : 'Pontuação Total'}</p>
                    <p class="text-2xl font-bold ${colors.text}">${points}</p>
                </div>
            </div>
        `;
        
        container.appendChild(userStatusCard);
    }
    
    // Criar lista do top 10
    const top10Card = document.createElement('div');
    top10Card.className = 'bg-white rounded-lg shadow-sm border border-gray-100';
    
    // Cabeçalho
    top10Card.innerHTML = `
        <div class="px-4 py-3 border-b bg-gradient-to-r from-gray-50 to-white">
            <h3 class="font-bold">Top 10 Funcionários</h3>
        </div>
    `;
    
    // Lista de usuários
    const userList = document.createElement('div');
    userList.className = 'divide-y divide-gray-100';
    
    // Limitar ao top 10
    const topUsers = users.slice(0, 10);
    
    topUsers.forEach((user, index) => {
        const points = user[pointsField] || 0;
        const username = user.users?.username || 'Funcionário';
        const department = user.users?.department || 'COSTURA';
        const avatar = user.users?.avatar;
        
        // Verificar se é o usuário atual
        const isCurrentUser = user.user_id === currentUser.id;
        
        // Medalhas para top 3
        let medal = '';
        if (index === 0) {
            medal = '🥇';
        } else if (index === 1) {
            medal = '🥈';
        } else if (index === 2) {
            medal = '🥉';
        }
        
        // Avatar do usuário
        const avatarHtml = avatar ? 
            `<img src="${avatar}" alt="${username}" class="h-10 w-10 rounded-full object-cover">` : 
            `<div class="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span class="text-gray-700 font-medium">${username.charAt(0).toUpperCase()}</span>
            </div>`;
        
        const item = document.createElement('div');
        item.className = `px-4 py-3 flex justify-between items-center ${isCurrentUser ? 'bg-blue-50' : ''}`;
        
        item.innerHTML = `
            <div class="flex items-center">
                <div class="w-6 text-center mr-2">
                    ${medal ? `<span class="text-lg">${medal}</span>` : `<span class="text-gray-500 font-medium">${index + 1}</span>`}
                </div>
                <div class="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden mr-3">
                    ${avatarHtml}
                </div>
                <div>
                    <p class="font-medium ${isCurrentUser ? 'text-blue-700' : 'text-gray-800'}">${username}</p>
                    <p class="text-xs text-gray-500">${department}</p>
                </div>
            </div>
            <div>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${colors.bg} ${colors.text}">
                    <i class="fas ${colors.icon} text-xs mr-1"></i>
                    ${points}
                </span>
            </div>
        `;
        
        userList.appendChild(item);
    });
    
    top10Card.appendChild(userList);
    container.appendChild(top10Card);
}