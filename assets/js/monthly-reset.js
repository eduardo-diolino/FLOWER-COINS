/**
 * FLOWER COINS - Sistema de Reset Mensal Automático
 * 
 * Este sistema executa automaticamente no dia 1º de cada mês:
 * 1. Salva histórico mensal de todos os funcionários
 * 2. Reseta pontos dos funcionários para 0
 * 3. Mantém Flowers Meta distribuídos pelo admin
 */

class MonthlyResetSystem {
    constructor() {
        this.supabaseUrl = 'https://igvarhcucicjiboxrqdg.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlndmFyaGN1Y2ljamlib3hycWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0ODE2OTYsImV4cCI6MjA2NzA1NzY5Nn0.hhb5CwmaNibeE0ngJJvar6BV0xpvMiV3jh9okro79Ys';
        this.client = null;
        this.init();
    }

    init() {
        // Aguardar carregamento do Supabase
        if (typeof supabase !== 'undefined') {
            this.client = supabase.createClient(this.supabaseUrl, this.supabaseKey);
            this.checkMonthlyReset();
        } else {
            setTimeout(() => this.init(), 100);
        }
    }

    async checkMonthlyReset() {
        try {
            const now = new Date();
            const isFirstDayOfMonth = now.getDate() === 1;
            const currentMonth = now.getMonth() + 1;
            const currentYear = now.getFullYear();
            
            // Verificar se já foi executado este mês
            const resetKey = `monthly_reset_${currentYear}_${currentMonth}`;
            const lastReset = localStorage.getItem(resetKey);
            
            console.log('🗓️ Verificando reset mensal...', {
                isFirstDay: isFirstDayOfMonth,
                currentMonth,
                currentYear,
                lastReset
            });

            // Se é dia 1º e ainda não foi executado este mês
            if (isFirstDayOfMonth && !lastReset) {
                console.log('🔄 Executando reset mensal automático...');
                await this.executeMonthlyReset();
                localStorage.setItem(resetKey, new Date().toISOString());
            }

            // Verificar novamente a cada hora
            setTimeout(() => this.checkMonthlyReset(), 60 * 60 * 1000);
            
        } catch (error) {
            console.error('Erro na verificação de reset mensal:', error);
        }
    }

    async executeMonthlyReset() {
        try {
            console.log('📊 Salvando histórico mensal antes do reset...');
            
            // Executar função de reset no Supabase
            const { error } = await this.client.rpc('monthly_reset_points');
            
            if (error) {
                throw error;
            }

            console.log('✅ Reset mensal executado com sucesso!');
            
            // Mostrar notificação se houver interface
            if (typeof showNotification === 'function') {
                showNotification('🗓️ Reset mensal executado! Histórico salvo e pontos resetados.', 'success');
            }

            // Forçar atualização dos dados em cache
            if (window.getFlowerCoinsSync) {
                const sync = window.getFlowerCoinsSync();
                if (sync) {
                    await sync.fullSync();
                }
            }

        } catch (error) {
            console.error('❌ Erro no reset mensal:', error);
            
            if (typeof showNotification === 'function') {
                showNotification('Erro no reset mensal: ' + error.message, 'error');
            }
        }
    }

    // Função para forçar reset manualmente (apenas para testes)
    async forceReset() {
        console.log('⚠️ Executando reset manual...');
        await this.executeMonthlyReset();
    }

    // Buscar histórico mensal de um usuário
    async getMonthlyHistory(userId, year = null, month = null) {
        try {
            let query = this.client
                .from('monthly_history')
                .select('*')
                .eq('user_id', userId)
                .order('year', { ascending: false })
                .order('month', { ascending: false });

            if (year) query = query.eq('year', year);
            if (month) query = query.eq('month', month);

            const { data, error } = await query;
            
            if (error) throw error;
            return data || [];
            
        } catch (error) {
            console.error('Erro ao buscar histórico mensal:', error);
            return [];
        }
    }

    // Buscar histórico de todos os usuários (admin)
    async getAllMonthlyHistory(year = null, month = null) {
        try {
            let query = this.client
                .from('monthly_history')
                .select(`
                    *,
                    users!inner(username, department, is_admin)
                `)
                .eq('users.is_admin', false)
                .order('year', { ascending: false })
                .order('month', { ascending: false });

            if (year) query = query.eq('year', year);
            if (month) query = query.eq('month', month);

            const { data, error } = await query;
            
            if (error) throw error;
            return data || [];
            
        } catch (error) {
            console.error('Erro ao buscar histórico completo:', error);
            return [];
        }
    }
}

// Inicializar sistema global
window.FlowerCoinsMonthlyReset = new MonthlyResetSystem();

// Exportar para uso em outros scripts
window.getMonthlyResetSystem = () => window.FlowerCoinsMonthlyReset;

console.log('🗓️ Sistema de Reset Mensal FLOWER COINS carregado!');