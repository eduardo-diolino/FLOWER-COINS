// FLOWER COINS - Gerenciador de Sincronização
// Sincronização completa com Supabase

class FlowerCoinsSync {
    constructor() {
        this.supabaseUrl = 'https://igvarhcucicjiboxrqdg.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlndmFyaGN1Y2ljamlib3hycWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0ODE2OTYsImV4cCI6MjA2NzA1NzY5Nn0.hhb5CwmaNibeE0ngJJvar6BV0xpvMiV3jh9okro79Ys';
        this.client = null;
        this.isConnected = false;
        this.lastSyncTime = null;
        
        this.init();
    }

    async init() {
        try {
            // Aguardar biblioteca Supabase carregar
            if (typeof supabase === 'undefined') {
                console.log('⏳ Aguardando biblioteca Supabase...');
                await this.waitForSupabase();
            }

            // Inicializar cliente
            this.client = supabase.createClient(this.supabaseUrl, this.supabaseKey);
            this.isConnected = true;
            
            console.log('🔗 Conexão com Supabase estabelecida!');
            
            // Sincronização inicial
            await this.fullSync();
            
            // Configurar sincronização em tempo real
            this.setupRealTimeSync();
            
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
            this.isConnected = false;
        }
    }

    async waitForSupabase() {
        return new Promise((resolve) => {
            const checkSupabase = () => {
                if (typeof supabase !== 'undefined') {
                    resolve();
                } else {
                    setTimeout(checkSupabase, 100);
                }
            };
            checkSupabase();
        });
    }

    // ============ SINCRONIZAÇÃO COMPLETA ============

    async fullSync() {
        console.log('🔄 Iniciando sincronização completa...');
        
        try {
            // Sincronizar dados principais
            await Promise.all([
                this.syncUsers(),
                this.syncTasks(),
                this.syncUserStats(),
                this.syncUserProgress(),
                this.syncDepartments(),
                this.syncPenalties(),
                this.syncMetaTasks()
            ]);

            this.lastSyncTime = new Date();
            console.log('✅ Sincronização completa finalizada!');
            
            // Atualizar interface se função existir
            if (typeof updateAllInterfaces === 'function') {
                updateAllInterfaces();
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Erro na sincronização completa:', error);
            return false;
        }
    }

    // ============ SINCRONIZAÇÃO DE USUÁRIOS ============

    async syncUsers() {
        try {
            const { data: users, error } = await this.client
                .from('users')
                .select(`
                    id, username, email, is_admin, department, 
                    avatar_url, department_id, avatar_type, avatar,
                    updated_at
                `)
                .order('username');

            if (error) {
                console.error('Erro ao sincronizar usuários:', error);
                return [];
            }

            console.log(`👥 ${users.length} usuários sincronizados`);
            
            // Salvar no localStorage para cache com controle de quota
            try {
                localStorage.setItem('flower_coins_users', JSON.stringify(users.map(u => ({
                    id: u.id, username: u.username, department: u.department, is_admin: u.is_admin
                }))));
            } catch (quotaError) {
                console.warn('⚠️ Limpando localStorage...');
                for (let i = localStorage.length - 1; i >= 0; i--) {
                    const key = localStorage.key(i);
                    if (key?.startsWith('flower_coins_') && key !== 'flower_coins_users') {
                        localStorage.removeItem(key);
                    }
                }
                localStorage.setItem('flower_coins_users', JSON.stringify(users.map(u => ({
                    id: u.id, username: u.username, is_admin: u.is_admin
                }))));
            }
            
            return users;
            
        } catch (error) {
            console.error('Erro na sincronização de usuários:', error);
            return [];
        }
    }

    // ============ SINCRONIZAÇÃO DE TAREFAS ============

    async syncTasks() {
        try {
            const { data: tasks, error } = await this.client
                .from('tasks')
                .select(`
                    id, title, description, points, category, periodicity,
                    priority, is_active, modality, department_id,
                    created_by, updated_at
                `)
                .eq('is_active', true)
                .order('updated_at', { ascending: false });

            if (error) {
                console.error('Erro ao sincronizar tarefas:', error);
                return [];
            }

            console.log(`📋 ${tasks.length} tarefas sincronizadas`);
            
            // Cache no localStorage
            try {
                localStorage.setItem('flower_coins_tasks', JSON.stringify(tasks));
            } catch (quotaError) {
                console.warn('⚠️ Quota excedida para tarefas');
            }
            
            return tasks;
            
        } catch (error) {
            console.error('Erro na sincronização de tarefas:', error);
            return [];
        }
    }

    // ============ SINCRONIZAÇÃO DE ESTATÍSTICAS ============

    async syncUserStats() {
        try {
            // Tenta selecionar com flowers_ind_distributed
            let { data: stats, error } = await this.client
                .from('user_stats')
                .select(`
                    user_id, total_points, total_money, level_num,
                    tasks_completed, current_streak, longest_streak,
                    flower_coins_distributed, flowers_meta_distributed, flowers_ind_distributed, meta_points,
                    updated_at
                `)
                .order('total_points', { ascending: false });

            // Fallback quando a coluna não existe (erro 42703)
            if (error && (error.code === '42703' || /column .* does not exist/i.test(error.message || ''))) {
                const resp = await this.client
                    .from('user_stats')
                    .select(`
                        user_id, total_points, total_money, level_num,
                        tasks_completed, current_streak, longest_streak,
                        flower_coins_distributed, flowers_meta_distributed, meta_points,
                        updated_at
                    `)
                    .order('total_points', { ascending: false });
                stats = resp.data || [];
                error = resp.error;

                // Calcular flowers_ind_distributed e flowers_meta_distributed via histórico
                const { data: hist } = await this.client
                    .from('points_distribution_history')
                    .select('user_id, type, point_type, amount');
                const indMap = new Map();
                const metaMap = new Map();
                (hist || []).forEach(row => {
                    const uid = (row.user_id || '').toString();
                    const amt = Number(row.amount || 0);
                    const delta = row.type === 'deduct' ? -amt : amt;
                    if (row.point_type === 'flower_ind') {
                        indMap.set(uid, (indMap.get(uid) || 0) + delta);
                    }
                    if (row.point_type === 'flowers_meta' || row.point_type === 'flower_meta') {
                        metaMap.set(uid, (metaMap.get(uid) || 0) + delta);
                    }
                });
                stats = (stats || []).map(s => ({
                    ...s,
                    flowers_ind_distributed: indMap.get((s.user_id || '').toString()) || 0,
                    flowers_meta_distributed: (s.flowers_meta_distributed ?? metaMap.get((s.user_id || '').toString()) ?? 0)
                }));
            }

            if (error) {
                console.error('Erro ao sincronizar estatísticas:', error);
                return [];
            }

            console.log(`📊 ${stats.length} estatísticas sincronizadas`);
            
            // Cache no localStorage
            try {
                localStorage.setItem('flower_coins_stats', JSON.stringify(stats));
            } catch (quotaError) {
                console.warn('⚠️ Quota excedida para estatísticas');
            }
            
            return stats;
            
        } catch (error) {
            console.error('Erro na sincronização de estatísticas:', error);
            return [];
        }
    }

    // ============ SINCRONIZAÇÃO DE PROGRESSO ============

    async syncUserProgress() {
        try {
            const { data: progress, error } = await this.client
                .from('user_progress')
                .select(`
                    id, user_id, task_id, completed_at, points_earned
                `)
                .order('completed_at', { ascending: false })
                .limit(500); // Limitar para não sobrecarregar

            if (error) {
                console.error('Erro ao sincronizar progresso:', error);
                return [];
            }

            console.log(`🎯 ${progress.length} progressos sincronizados`);
            // Cache no localStorage para consumo no painel do funcionário
            try {
                localStorage.setItem('flower_coins_progress', JSON.stringify(progress));
            } catch (quotaError) {
                console.warn('⚠️ Quota excedida para progresso');
            }
            return progress;
            
        } catch (error) {
            console.error('Erro na sincronização de progresso:', error);
            return [];
        }
    }

    // ============ SINCRONIZAÇÃO DE DEPARTAMENTOS ============

    async syncDepartments() {
        try {
            const { data: departments, error } = await this.client
                .from('departments')
                .select('*')
                .order('name');

            if (error) {
                console.error('Erro ao sincronizar departamentos:', error);
                return [];
            }

            console.log(`🏢 ${departments.length} departamentos sincronizados`);
            return departments;
            
        } catch (error) {
            console.error('Erro na sincronização de departamentos:', error);
            return [];
        }
    }

    async syncPenalties() {
        try {
            const { data: penalties, error } = await this.client
                .from('points_distribution_history')
                .select('id, user_id, admin_id, type, amount, action, reason, created_at')
                .eq('action', 'deduct')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Erro ao sincronizar penalidades:', error);
                return [];
            }

            console.log(`⚠️ ${penalties.length} penalidades sincronizadas`);

            try {
                localStorage.setItem('flower_coins_penalties', JSON.stringify(penalties));
            } catch (quotaError) {
                console.warn('⚠️ Quota excedida para penalidades');
            }

            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('flowerCoins:penaltiesUpdated', { detail: penalties }));
            }

            return penalties;
        } catch (error) {
            console.error('Erro na sincronização de penalidades:', error);
            return [];
        }
    }

    // ============ FUNÇÕES DE CACHE ============

    getCachedUsers() {
        try {
            const cached = localStorage.getItem('flower_coins_users');
            return cached ? JSON.parse(cached) : [];
        } catch (error) {
            console.error('Erro ao recuperar usuários do cache:', error);
            return [];
        }
    }

    getCachedTasks() {
        try {
            const cached = localStorage.getItem('flower_coins_tasks');
            return cached ? JSON.parse(cached) : [];
        } catch (error) {
            console.error('Erro ao recuperar tarefas do cache:', error);
            return [];
        }
    }

    getCachedStats() {
        try {
            const cached = localStorage.getItem('flower_coins_stats');
            return cached ? JSON.parse(cached) : [];
        } catch (error) {
            console.error('Erro ao recuperar estatísticas do cache:', error);
            return [];
        }
    }

    getCachedProgress() {
        try {
            const cached = localStorage.getItem('flower_coins_progress');
            return cached ? JSON.parse(cached) : [];
        } catch (error) {
            console.error('Erro ao recuperar progresso do cache:', error);
            return [];
        }
    }

    getCachedPenalties() {
        try {
            const cached = localStorage.getItem('flower_coins_penalties');
            return cached ? JSON.parse(cached) : [];
        } catch (error) {
            console.error('Erro ao recuperar penalidades do cache:', error);
            return [];
        }
    }

    // ============ SINCRONIZAÇÃO DE META TASKS ============
    async syncMetaTasks() {
        try {
            const { data: metaTasks, error } = await this.client
                .from('meta_tasks')
                .select('id, title, description, points, flower_meta, assigned_to_user_id, is_completed, completed_at, created_at')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Erro ao sincronizar meta tasks:', error);
                return [];
            }

            console.log(`⭐ ${metaTasks?.length || 0} meta tasks sincronizadas`);
            try {
                localStorage.setItem('flower_coins_meta_tasks', JSON.stringify(metaTasks || []));
            } catch (quotaError) {
                console.warn('⚠️ Quota excedida para meta tasks');
            }
            return metaTasks;
        } catch (error) {
            console.error('Erro na sincronização de meta tasks:', error);
            return [];
        }
    }

    getCachedMetaTasks() {
        try {
            const cached = localStorage.getItem('flower_coins_meta_tasks');
            return cached ? JSON.parse(cached) : [];
        } catch (error) {
            console.error('Erro ao recuperar meta tasks do cache:', error);
            return [];
        }
    }

    // ============ SINCRONIZAÇÃO EM TEMPO REAL ============

    setupRealTimeSync() {
        if (!this.client) return;

        console.log('🔄 Configurando sincronização em tempo real...');
        
        // Escutar mudanças nas tabelas principais
        this.client
            .channel('flower_coins_changes')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'users' }, 
                () => this.syncUsers()
            )
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'tasks' }, 
                () => this.syncTasks()
            )
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'user_stats' }, 
                () => this.syncUserStats()
            )
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'user_progress' }, 
                () => this.syncUserProgress()
            )
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'points_distribution_history' },
                () => this.syncPenalties()
            )
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'meta_tasks' },
                () => this.syncMetaTasks()
            )
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'ind_tasks' },
                () => { this.syncMetaTasks?.(); this.syncUserStats(); }
            )
            .subscribe();
    }

    // ============ FUNÇÕES DE DISTRIBUIÇÃO ============

    async distributeFlowerCoinsToUser(userId, amount, reason) {
        try {
            console.log(`🪙 Distribuindo ${amount} Flower Coins para usuário ${userId}`);
            
            // Atualizar APENAS pontos do usuário (não afeta Flower Meta)
            let { data: currentStats, error: fetchError } = await this.client
                .from('user_stats')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (fetchError) {
                console.error('❌ Erro ao buscar estatísticas:', fetchError);
                
                // Se o usuário não tem estatísticas, criar uma entrada inicial
                if (fetchError.code === 'PGRST116') {
                    console.log('📝 Criando estatísticas iniciais para o usuário...');
                    const { data: newStats, error: insertError } = await this.client
                        .from('user_stats')
                        .insert({
                            user_id: userId,
                            total_points: 0,
                            total_money: '0',
                            level_num: 1,
                            tasks_completed: 0,
                            current_streak: 0,
                            longest_streak: 0,
                            flower_coins_distributed: 0,
                            flowers_meta_distributed: 0
                        })
                        .select()
                        .single();
                    
                    if (insertError) {
                        console.error('❌ Erro ao criar estatísticas:', insertError);
                        return { success: false, error: 'Erro ao criar estatísticas do usuário' };
                    }
                    
                    // Usar as estatísticas recém-criadas
                    currentStats = newStats;
                } else {
                    return { success: false, error: 'Erro ao buscar estatísticas do usuário' };
                }
            }

            const currentFlowerCoins = currentStats.flower_coins_distributed || 0;
            const currentPoints = currentStats.total_points || 0;
            
            const newPoints = currentPoints + amount;
            const newMoney = (parseFloat(currentStats.total_money) || 0) + (amount * 0.1); // 10 pontos = R$1
            const newFlowerCoins = currentFlowerCoins + amount;

            // ATUALIZAR APENAS FLOWER COINS - NÃO TOCAR EM FLOWER META
            const updateData = {
                total_points: newPoints,
                total_money: newMoney.toString(),
                flower_coins_distributed: newFlowerCoins,
                updated_at: new Date().toISOString()
                // EXPLICITAMENTE NÃO INCLUIR flowers_meta_distributed
            };

            console.log(`💾 Atualizando apenas Flower Coins:`, updateData);

            const { error: updateError } = await this.client
                .from('user_stats')
                .update(updateData)
                .eq('user_id', userId);

            if (updateError) {
                console.error('❌ Erro ao atualizar:', updateError);
                return { success: false, error: updateError.message };
            }

            console.log(`✅ ${amount} Flower Coins distribuídos com sucesso!`);
            
            // Atualizar cache
            await this.syncUserStats();
            
            return { success: true };
            
        } catch (error) {
            console.error('❌ Erro na distribuição:', error);
            return { success: false, error: error.message };
        }
    }

    async distributeFlowersMetaToUser(userId, amount, reason) {
        try {
            console.log(`🌺 Distribuindo ${amount} Flower Meta para usuário ${userId}`);
            
            // Buscar estatísticas atuais
            let { data: currentStats, error: fetchError } = await this.client
                .from('user_stats')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (fetchError) {
                console.error('❌ Erro ao buscar estatísticas:', fetchError);
                
                // Se o usuário não tem estatísticas, criar uma entrada inicial
                if (fetchError.code === 'PGRST116') {
                    console.log('📝 Criando estatísticas iniciais para o usuário (Flower Meta)...');
                    const { data: newStats, error: insertError } = await this.client
                        .from('user_stats')
                        .insert({
                            user_id: userId,
                            total_points: 0,
                            total_money: '0',
                            level_num: 1,
                            tasks_completed: 0,
                            current_streak: 0,
                            longest_streak: 0,
                            flower_coins_distributed: 0,
                            flowers_meta_distributed: 0
                        })
                        .select()
                        .single();
                    
                    if (insertError) {
                        console.error('❌ Erro ao criar estatísticas:', insertError);
                        return { success: false, error: 'Erro ao criar estatísticas do usuário' };
                    }
                    
                    // Usar as estatísticas recém-criadas
                    currentStats = newStats;
                } else {
                    return { success: false, error: 'Erro ao buscar estatísticas do usuário' };
                }
            }

            const currentFlowerMeta = currentStats.flowers_meta_distributed || 0;
            const newFlowerMeta = currentFlowerMeta + amount;

            // ATUALIZAR APENAS FLOWER META - NÃO TOCAR EM FLOWER COINS
            const updateData = {
                flowers_meta_distributed: newFlowerMeta,
                updated_at: new Date().toISOString()
                // EXPLICITAMENTE NÃO INCLUIR flower_coins_distributed, total_points
            };

            console.log(`💾 Atualizando apenas Flower Meta:`, updateData);

            const { error: updateError } = await this.client
                .from('user_stats')
                .update(updateData)
                .eq('user_id', userId);

            if (updateError) {
                console.error('❌ Erro ao atualizar:', updateError);
                return { success: false, error: updateError.message };
            }

            console.log(`✅ ${amount} Flower Meta distribuído com sucesso!`);
            
            // Atualizar cache
            await this.syncUserStats();
            
            return { success: true };
            
        } catch (error) {
            console.error('❌ Erro na distribuição:', error);
            return { success: false, error: error.message };
        }
    }

    // ============ FUNÇÕES DE GERENCIAMENTO DE TAREFAS ============

    async createTask(taskData) {
        try {
            console.log('📝 Criando nova tarefa:', taskData);
            
            const { data, error } = await this.client
                .from('tasks')
                .insert(taskData)
                .select()
                .single();

            if (error) {
                console.error('❌ Erro ao criar tarefa:', error);
                return { success: false, error: error.message };
            }

            console.log('✅ Tarefa criada com sucesso:', data);
            
            // Sincronizar tarefas para atualizar cache
            await this.syncTasks();
            
            return { success: true, data };
            
        } catch (error) {
            console.error('❌ Erro na criação de tarefa:', error);
            return { success: false, error: error.message };
        }
    }

    async updateTask(taskId, updates) {
        try {
            console.log('📝 Atualizando tarefa:', taskId, updates);
            
            const { data, error } = await this.client
                .from('tasks')
                .update(updates)
                .eq('id', taskId)
                .select()
                .single();

            if (error) {
                console.error('❌ Erro ao atualizar tarefa:', error);
                return { success: false, error: error.message };
            }

            console.log('✅ Tarefa atualizada com sucesso:', data);
            
            // Sincronizar tarefas para atualizar cache
            await this.syncTasks();
            
            return { success: true, data };
            
        } catch (error) {
            console.error('❌ Erro na atualização de tarefa:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteTask(taskId) {
        try {
            console.log('🗑️ Desativando tarefa:', taskId);
            
            const { data, error } = await this.client
                .from('tasks')
                .update({ is_active: false, updated_at: new Date().toISOString() })
                .eq('id', taskId)
                .select()
                .single();

            if (error) {
                console.error('❌ Erro ao desativar tarefa:', error);
                return { success: false, error: error.message };
            }

            console.log('✅ Tarefa desativada com sucesso:', data);
            
            // Sincronizar tarefas para atualizar cache
            await this.syncTasks();
            
            return { success: true, data };
            
        } catch (error) {
            console.error('❌ Erro na desativação de tarefa:', error);
            return { success: false, error: error.message };
        }
    }

    // ============ FUNÇÃO PARA OBTER INSTÂNCIA GLOBAL ============

    static getInstance() {
        if (!window.flowerCoinsSync) {
            window.flowerCoinsSync = new FlowerCoinsSync();
        }
        return window.flowerCoinsSync;
    }
}

// Inicializar automaticamente e tornar disponível globalmente
window.getFlowerCoinsSync = function() {
    return FlowerCoinsSync.getInstance();
};

// Auto-inicialização quando DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌸 Inicializando sistema de sincronização...');
    window.getFlowerCoinsSync();
});

console.log('📦 Sync Manager carregado!');