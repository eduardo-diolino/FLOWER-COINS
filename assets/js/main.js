// FLOWER COINS - Sistema Gamificado v2.0
// Configuração do Supabase
const SUPABASE_URL = 'https://igvarhcucicjiboxrqdg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlndmFyaGN1Y2ljamlib3hycWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0ODE2OTYsImV4cCI6MjA2NzA1NzY5Nn0.hhb5CwmaNibeE0ngJJvar6BV0xpvMiV3jh9okro79Ys';

// Inicializar cliente Supabase
let supabaseClient;

// Aguardar o DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se a biblioteca Supabase está disponível
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Cliente Supabase inicializado!');
        initializeSystem();
    } else {
        console.error('❌ Biblioteca Supabase não encontrada');
        setTimeout(() => {
            if (typeof supabase !== 'undefined') {
                supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                console.log('✅ Cliente Supabase inicializado (retry)!');
                initializeSystem();
            }
        }, 1000);
    }
});

// Sistema de dados globais
let currentUser = null;
let userStats = null;
let allTasks = [];
let userProgress = [];

// Inicializar sistema
async function initializeSystem() {
    console.log('🚀 Inicializando sistema FLOWER COINS...');
    
    // Carregar dados iniciais se estiver logado
    if (localStorage.getItem('currentUser')) {
        try {
            currentUser = JSON.parse(localStorage.getItem('currentUser'));
            await loadUserData();
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
        }
    }
}

// ============ SISTEMA DE AUTENTICAÇÃO ============

async function loginUser(username, password) {
    try {
        console.log('🔐 Tentando fazer login para:', username);
        
        // Buscar usuário no banco
        const { data: user, error: userError } = await supabaseClient
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

        if (userError) {
            console.error('Erro ao buscar usuário:', userError);
            return { success: false, message: 'Usuário não encontrado' };
        }

        // Verificar senha (simples para este sistema)
        if (user.password_hash !== password) {
            return { success: false, message: 'Senha incorreta' };
        }

        // Login bem-sucedido
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        console.log('✅ Login realizado com sucesso!', user);
        
        // Carregar dados do usuário
        await loadUserData();
        
        return { success: true, user: user };
        
    } catch (error) {
        console.error('Erro no login:', error);
        return { success: false, message: 'Erro interno do sistema' };
    }
}

async function registerUser(userData) {
    try {
        console.log('📝 Registrando novo usuário:', userData.username);
        
        // Verificar se usuário já existe
        const { data: existingUser } = await supabaseClient
            .from('users')
            .select('username')
            .eq('username', userData.username)
            .single();

        if (existingUser) {
            return { success: false, message: 'Usuário já existe' };
        }

        // Criar novo usuário
        const { data: newUser, error } = await supabaseClient
            .from('users')
            .insert([{
                username: userData.username,
                email: userData.email || null,
                password_hash: userData.password,
                is_admin: false,
                department: userData.department || 'CONFECÇÃO'
            }])
            .select()
            .single();

        if (error) {
            console.error('Erro ao criar usuário:', error);
            return { success: false, message: error.message };
        }

        console.log('✅ Usuário criado com sucesso!', newUser);
        
        // Inicializar estatísticas do usuário
        await initializeUserStats(newUser.id);
        
        return { success: true, user: newUser };
        
    } catch (error) {
        console.error('Erro no registro:', error);
        return { success: false, message: 'Erro interno do sistema' };
    }
}

async function initializeUserStats(userId) {
    try {
        const { error } = await supabaseClient
            .from('user_stats')
            .insert([{
                user_id: userId,
                total_points: 0,
                total_money: 0.00,
                level_num: 1,
                tasks_completed: 0,
                current_streak: 0,
                longest_streak: 0,
                last_activity: new Date().toISOString()
            }]);

        if (error) {
            console.error('Erro ao inicializar estatísticas:', error);
        } else {
            console.log('✅ Estatísticas inicializadas para usuário:', userId);
        }
    } catch (error) {
        console.error('Erro ao inicializar estatísticas:', error);
    }
}

// ============ CARREGAMENTO DE DADOS ============

async function loadUserData() {
    if (!currentUser) return;
    
    try {
        console.log('📊 Carregando dados do usuário:', currentUser.username);
        
        // Carregar estatísticas do usuário
        await loadUserStats();
        
        // Carregar tarefas
        await loadTasks();
        
        // Carregar progresso
        await loadUserProgress();
        
        console.log('✅ Dados carregados com sucesso!');
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

async function loadUserStats() {
    try {
        const { data, error } = await supabaseClient
            .from('user_stats')
            .select('*')
            .eq('user_id', currentUser.id)
            .single();

        if (error) {
            console.error('Erro ao carregar estatísticas:', error);
            // Se não existir, criar
            await initializeUserStats(currentUser.id);
            await loadUserStats(); // Tentar novamente
            return;
        }

        userStats = data;
        console.log('📈 Estatísticas carregadas:', userStats);
        
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

async function loadTasks() {
    try {
        const { data, error } = await supabaseClient
            .from('tasks')
            .select(`
                *,
                created_by_user:users!tasks_created_by_fkey(username)
            `)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao carregar tarefas:', error);
            return;
        }

        allTasks = data || [];
        console.log('📋 Tarefas carregadas:', allTasks.length, 'tarefas');
        
    } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
    }
}

async function loadUserProgress() {
    if (!currentUser) return;
    
    try {
        const { data, error } = await supabaseClient
            .from('user_progress')
            .select('*')
            .eq('user_id', currentUser.id);

        if (error) {
            console.error('Erro ao carregar progresso:', error);
            return;
        }

        userProgress = data || [];
        console.log('🎯 Progresso carregado:', userProgress.length, 'completadas');
        
    } catch (error) {
        console.error('Erro ao carregar progresso:', error);
    }
}

// ============ SISTEMA DE TAREFAS ============

async function completeTask(taskId) {
    if (!currentUser || !userStats) {
        showNotification('Erro: Dados do usuário não carregados', 'error');
        return false;
    }

    try {
        console.log('✅ Completando tarefa:', taskId);
        
        // Buscar a tarefa
        const task = allTasks.find(t => t.id === taskId);
        if (!task) {
            showNotification('Tarefa não encontrada', 'error');
            return false;
        }

        // Verificar se já foi completada hoje
        const today = new Date().toISOString().split('T')[0];
        const alreadyCompleted = userProgress.some(p => 
            p.task_id === taskId && 
            p.completed_at && 
            p.completed_at.startsWith(today)
        );

        if (alreadyCompleted) {
            showNotification('Tarefa já foi completada hoje!', 'warning');
            return false;
        }

        // Registrar progresso
        const { error: progressError } = await supabaseClient
            .from('user_progress')
            .insert([{
                user_id: currentUser.id,
                task_id: taskId,
                points_earned: task.points,
                completed_at: new Date().toISOString()
            }]);

        if (progressError) {
            console.error('Erro ao registrar progresso:', progressError);
            showNotification('Erro ao completar tarefa', 'error');
            return false;
        }

        // Atualizar estatísticas
        const newPoints = userStats.total_points + task.points;
        const newMoney = parseFloat((newPoints * 0.1).toFixed(2)); // 10 pontos = R$ 1,00
        const newLevel = Math.floor(newPoints / 100) + 1; // Nível a cada 100 pontos
        const newTasksCompleted = userStats.tasks_completed + 1;

        const { error: statsError } = await supabaseClient
            .from('user_stats')
            .update({
                total_points: newPoints,
                total_money: newMoney,
                level_num: newLevel,
                tasks_completed: newTasksCompleted,
                last_activity: new Date().toISOString()
            })
            .eq('user_id', currentUser.id);

        if (statsError) {
            console.error('Erro ao atualizar estatísticas:', statsError);
        }

        // Recarregar dados
        await loadUserData();
        
        // Efeitos visuais
        showTaskCompletionEffects(task);
        showNotification(`Tarefa completada! +${task.points} pontos 🎉`, 'success');
        
        // Atualizar interface
        updateUserInterface();
        
        console.log('🎉 Tarefa completada com sucesso!');
        return true;
        
    } catch (error) {
        console.error('Erro ao completar tarefa:', error);
        showNotification('Erro interno do sistema', 'error');
        return false;
    }
}

// ============ EFEITOS VISUAIS ============

function showTaskCompletionEffects(task) {
    // Som de conclusão
    playCompletionSound();
    
    // Chuva de confetes
    createConfetti();
    
    // Animação de pontos
    showPointsAnimation(task.points);
}

function playCompletionSound() {
    try {
        const audio = new Audio('assets/audio/6bd07a19784043d98d63bd6958c479cd.mp3');
        audio.volume = 0.3;
        audio.play().catch(e => console.log('Som não pôde ser reproduzido:', e));
    } catch (error) {
        console.log('Erro ao reproduzir som:', error);
    }
}

function createConfetti() {
    // Implementação simples de confetes
    for (let i = 0; i < 50; i++) {
        createConfettiPiece();
    }
}

function createConfettiPiece() {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.width = '10px';
    confetti.style.height = '10px';
    confetti.style.backgroundColor = getRandomColor();
    confetti.style.left = Math.random() * window.innerWidth + 'px';
    confetti.style.top = '-10px';
    confetti.style.zIndex = '9999';
    confetti.style.borderRadius = '50%';
    
    document.body.appendChild(confetti);
    
    const animation = confetti.animate([
        { transform: 'translateY(0px) rotate(0deg)', opacity: 1 },
        { transform: `translateY(${window.innerHeight + 100}px) rotate(360deg)`, opacity: 0 }
    ], {
        duration: Math.random() * 3000 + 2000,
        easing: 'cubic-bezier(0.5, 0, 0.5, 1)'
    });
    
    animation.onfinish = () => confetti.remove();
}

function getRandomColor() {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function showPointsAnimation(points) {
    const pointsEl = document.createElement('div');
    pointsEl.textContent = `+${points} pontos!`;
    pointsEl.style.position = 'fixed';
    pointsEl.style.top = '50%';
    pointsEl.style.left = '50%';
    pointsEl.style.transform = 'translate(-50%, -50%)';
    pointsEl.style.fontSize = '2rem';
    pointsEl.style.fontWeight = 'bold';
    pointsEl.style.color = '#4ECDC4';
    pointsEl.style.zIndex = '9999';
    pointsEl.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
    pointsEl.style.pointerEvents = 'none';
    
    document.body.appendChild(pointsEl);
    
    const animation = pointsEl.animate([
        { opacity: 0, transform: 'translate(-50%, -50%) scale(0.5)' },
        { opacity: 1, transform: 'translate(-50%, -70%) scale(1.2)' },
        { opacity: 0, transform: 'translate(-50%, -90%) scale(1)' }
    ], {
        duration: 2000,
        easing: 'ease-out'
    });
    
    animation.onfinish = () => pointsEl.remove();
}

// ============ INTERFACE DO USUÁRIO ============

function updateUserInterface() {
    if (!currentUser || !userStats) return;
    
    // Atualizar elementos da interface
    const elements = {
        userName: document.querySelector('.employee-name'),
        userPoints: document.querySelector('.user-points'),
        userMoney: document.querySelector('.user-money'),
        userLevel: document.querySelector('.user-level'),
        tasksCompleted: document.querySelector('.tasks-completed')
    };
    
    if (elements.userName) elements.userName.textContent = currentUser.username;
    if (elements.userPoints) elements.userPoints.textContent = userStats.total_points;
    if (elements.userMoney) elements.userMoney.textContent = `R$ ${userStats.total_money.toFixed(2)}`;
    if (elements.userLevel) elements.userLevel.textContent = userStats.level_num;
    if (elements.tasksCompleted) elements.tasksCompleted.textContent = userStats.tasks_completed;
    
    // Atualizar progresso visual
    updateProgressBars();
}

function updateProgressBars() {
    if (!userStats) return;
    
    // Barra de nível
    const levelProgress = document.querySelector('.level-progress');
    if (levelProgress) {
        const pointsInCurrentLevel = userStats.total_points % 100;
        const progressPercent = (pointsInCurrentLevel / 100) * 100;
        levelProgress.style.width = progressPercent + '%';
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '10px';
    notification.style.color = 'white';
    notification.style.fontSize = '14px';
    notification.style.fontWeight = '600';
    notification.style.zIndex = '10000';
    notification.style.maxWidth = '300px';
    notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    
    // Cores por tipo
    const colors = {
        success: '#4ECDC4',
        error: '#FF6B6B', 
        warning: '#FFEAA7',
        info: '#45B7D1'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // Animação de entrada
    notification.animate([
        { opacity: 0, transform: 'translateX(100%)' },
        { opacity: 1, transform: 'translateX(0)' }
    ], {
        duration: 300,
        easing: 'ease-out'
    });
    
    // Remover após 5 segundos
    setTimeout(() => {
        const exitAnimation = notification.animate([
            { opacity: 1, transform: 'translateX(0)' },
            { opacity: 0, transform: 'translateX(100%)' }
        ], {
            duration: 300,
            easing: 'ease-in'
        });
        
        exitAnimation.onfinish = () => notification.remove();
    }, 5000);
}

// ============ UTILITÁRIOS ============

function logout() {
    currentUser = null;
    userStats = null;
    allTasks = [];
    userProgress = [];
    localStorage.removeItem('currentUser');
    
    showNotification('Logout realizado com sucesso!', 'success');
    
    // Redirecionar para login após um momento
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

// ============ FUNÇÕES GLOBAIS ============

// Disponibilizar funções para uso global
window.FLOWER_COINS = {
    loginUser,
    registerUser,
    completeTask,
    logout,
    updateUserInterface,
    showNotification,
    currentUser: () => currentUser,
    userStats: () => userStats,
    allTasks: () => allTasks,
    userProgress: () => userProgress
};

console.log('🌸 FLOWER COINS System v2.0 carregado!');