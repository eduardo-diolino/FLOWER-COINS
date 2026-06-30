(function(){
  let supabaseClient=null; let sync=null;
  function ready(fn){ if(document.readyState!=='loading'){ fn(); } else { document.addEventListener('DOMContentLoaded', fn); } }
  async function initCommon(){ try{ if(window.getFlowerCoinsSync){ sync = window.getFlowerCoinsSync(); supabaseClient = sync?.client; await ensureIndSchema(); } }catch(e){ console.warn('FLOWER IND initCommon warn', e); } }
  async function ensureIndSchema(){ try{
    // Ensure tables via backend ping (runtime environment will proxy correctly)
    const BACKEND_URL = 'https://backend.youware.com';
    await fetch(`${BACKEND_URL}/api/meta-tasks`);
    await fetch(`${BACKEND_URL}/api/ind-tasks`);
  }catch(e){ console.warn('ensureIndSchema exception', e); }
  }
  function isAdminPage(){ return /admin\.html$/i.test(location.pathname) || !!document.querySelector('.admin-header'); }
  function isEmployeePage(){ return /funcionario\.html$/i.test(location.pathname) || !!document.getElementById('employeeName'); }

  // ===== Admin Enhancements =====
  function injectAdminButtons(){ try{
    const header = document.querySelector('.admin-header .flex.items-center.space-x-4');
    if(header){
      const btnIndDist = document.createElement('button');
      btnIndDist.className = 'px-4 py-2 bg-fuchsia-500 text-white rounded-lg hover:bg-fuchsia-600 transition-colors';
      btnIndDist.innerHTML = '<i class="fas fa-seedling mr-2"></i>Distribuir FLOWER IND';
      btnIndDist.onclick = showFlowerIndDistribution;
      const deductBtn = header.querySelector('button[onclick="showDeductPoints()"]');
      header.insertBefore(btnIndDist, deductBtn);
      const btnNova = header.querySelector('button[onclick="createTask()"]');
      if(btnNova){ btnNova.onclick = showNewTaskChooser; }
    }
  }catch(e){ console.warn('injectAdminButtons warn', e); }
  }
  async function computeTotalInd(){
    try{
      if(!supabaseClient) return 0;
      // Primeiro tenta coluna no user_stats
      const { data, error } = await supabaseClient.from('user_stats').select('flowers_ind_distributed');
      if(!error && Array.isArray(data)){
        return (data||[]).reduce((s,r)=> s + (r.flowers_ind_distributed||0), 0);
      }
      // Fallback: somar histórico de distribuições (flower_ind)
      const { data: hist } = await supabaseClient.from('points_distribution_history').select('type, point_type, amount');
      let total = 0; (hist||[]).forEach(row => { if(row.point_type==='flower_ind'){ total += (row.type==='deduct' ? -Number(row.amount||0) : Number(row.amount||0)); } });
      return total;
    }catch(e){ return 0; }
  }
  async function injectAdminStatsCard(){ try{
    const grid = document.querySelector('.grid.grid-cols-1.md\:grid-cols-4.gap-6.mb-8');
    if(!grid) return;
    const card = document.createElement('div'); card.className = 'stat-card';
    card.innerHTML = `
      <div class="flex items-center justify-center mb-2">
        <img src="assets/img/FLOWER IND.png" alt="FLOWER IND" class="w-8 h-8">
      </div>
      <div class="text-3xl font-bold text-pink-600" id="total-flowers-ind">0</div>
      <div class="text-gray-600 mt-2">FLOWER IND Distribuídos</div>
    `;
    grid.appendChild(card);
    const total = await computeTotalInd(); const el = document.getElementById('total-flowers-ind'); if(el){ el.textContent = (total||0).toLocaleString('pt-BR'); }
  }catch(e){ console.warn('injectAdminStatsCard warn', e); }
  }
  async function injectEmployeesIndCounts(){ try{
    if(!supabaseClient) return;
    const users = sync?.getCachedUsers?.() || [];
    const resp = await supabaseClient.from('user_stats').select('user_id, flowers_ind_distributed');
    const stats = resp.data || [];
    const hasError = !!resp.error;
    let map = new Map();
    if (hasError || !stats.length || stats.every(s => (s.flowers_ind_distributed||0) === 0)) {
      // Fallback: calcular por histórico para cada usuário
      for (const u of users) {
        const c = await computeIndFromHistory(u.id);
        map.set(u.id, c || 0);
      }
    } else {
      map = new Map(stats.map(s=>[s.user_id, s.flowers_ind_distributed||0]));
    }
    const normalize = (s)=> (s||'').normalize('NFD').replace(/\p{Diacritic}/gu,'').trim().toUpperCase();
    document.querySelectorAll('#employees-list .glass-card').forEach(card=>{
      const nameEl = card.querySelector('h3.font-bold'); const name = nameEl?.textContent?.trim();
      const user = users.find(u => normalize(u.username) === normalize(name));
      const count = user ? (map.get(user.id)||0) : 0;
      const container = card.querySelector('.flex.items-center.justify-end');
      if(!container) return;
      // Atualizar o contador existente (FI) em vez de duplicar
      const fiWrappers = Array.from(container.querySelectorAll('.flex.items-center.space-x-1')).filter(div => div.querySelector('img[alt="FI"]'));
      if (fiWrappers.length) {
        // Remover duplicatas e manter o primeiro
        for (let i = 1; i < fiWrappers.length; i++) { try { fiWrappers[i].remove(); } catch(_){} }
        const span = fiWrappers[0].querySelector('span');
        if (span) { span.textContent = String(count); }
        else {
          const newSpan = document.createElement('span'); newSpan.className = 'text-lg font-bold text-pink-600'; newSpan.textContent = String(count);
          fiWrappers[0].appendChild(newSpan);
        }
      } else {
        // Caso não exista, criar um novo bloco FI
        const wrap = document.createElement('div'); wrap.className = 'flex items-center space-x-1';
        wrap.innerHTML = `<img src="assets/img/FLOWER IND.png" alt="FI" class="w-5 h-5"><span class="text-lg font-bold text-pink-600">${count}</span>`;
        container.appendChild(wrap);
      }
    });
    // Reexecutar uma vez após a renderização da lista de funcionários
    window.__fiCountsRuns = (window.__fiCountsRuns||0) + 1;
    if (window.__fiCountsRuns < 3) {
      setTimeout(()=>{ try{ injectEmployeesIndCounts(); }catch(_){ } }, 1500);
    }
  }catch(e){ console.warn('injectEmployeesIndCounts warn', e); }
  }

  function showFlowerIndDistribution(){ try{
    const modal = document.createElement('div'); modal.id='flowerIndModal'; modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:1000';
    modal.innerHTML = `
      <div style="background:white;border-radius:15px;padding:2rem;max-width:500px;width:90%;max-height:80vh;overflow-y:auto;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;">
          <h2 style="margin:0;color:#333;font-size:1.5rem;">
            <img src="assets/img/FLOWER IND.png" alt="FLOWER IND" style="width:24px;height:24px;margin-right:8px;vertical-align:middle;">Distribuir FLOWER IND
          </h2>
          <button style="background:#ff4757;color:white;border:none;border-radius:50%;width:30px;height:30px;cursor:pointer;font-size:16px;">×</button>
        </div>
        <div style="margin-bottom:1rem;">
          <label style="display:block;margin-bottom:0.5rem;font-weight:bold;color:#555;">Quantidade (inteiro):</label>
          <input type="number" step="1" id="flowerIndAmountInput" placeholder="Ex: 5, 10" style="width:100%;padding:0.75rem;border:2px solid #ddd;border-radius:8px;font-size:1rem;">
        </div>
        <div style="margin-bottom:1.5rem;">
          <label style="display:block;margin-bottom:0.5rem;font-weight:bold;color:#555;">Motivo:</label>
          <input type="text" id="flowerIndReasonInput" placeholder="Ex: Meta IND alcançada" style="width:100%;padding:0.75rem;border:2px solid #ddd;border-radius:8px;font-size:1rem;">
        </div>
        <div style="margin-bottom:1.5rem;">
          <h3 style="margin-bottom:1rem;font-size:1.2rem;color:#333;">Selecionar Funcionários:</h3>
          <div id="employeeListForFlowerInd" style="max-height:200px;overflow-y:auto;border:1px solid #ddd;border-radius:8px;padding:0.5rem;"></div>
        </div>
        <div style="display:flex;gap:1rem;justify-content:flex-end;">
          <button class="fi-cancel" style="background:#777;color:white;border:none;padding:0.75rem 1.5rem;border-radius:8px;cursor:pointer;font-size:1rem;">Cancelar</button>
          <button class="fi-submit" style="background:#db2777;color:white;border:none;padding:0.75rem 1.5rem;border-radius:8px;cursor:pointer;font-size:1rem;">Distribuir FLOWER IND</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelector('button.fi-cancel').onclick = ()=> modal.remove();
    modal.querySelector('button').onclick = (e)=>{ if(e.target.textContent.includes('×')) modal.remove(); };
    modal.querySelector('button.fi-submit').onclick = distributeFlowerIndToSelected;
    populateEmployeeListForFlowerInd();
  }catch(e){ console.error('showFlowerIndDistribution error', e); }
  }
  function populateEmployeeListForFlowerInd(){ try{
    const container = document.getElementById('employeeListForFlowerInd'); if(!container) return;
    const employees = (sync?.getCachedUsers?.()||[]).filter(u=> !u.is_admin);
    container.innerHTML = employees.map(u=> `
      <div style="display:flex;align-items:center;padding:0.5rem;border-bottom:1px solid #eee;">
        <input type="checkbox" value="${u.id}" style="margin-right:0.75rem;cursor:pointer;">
        <label style="cursor:pointer;flex:1;display:flex;align-items:center;font-size:0.95rem;">
          <img src="${u.avatar_url || 'assets/img/logo.jpeg'}" alt="${u.username}" style="width:24px;height:24px;border-radius:50%;margin-right:0.5rem;">${u.username}
        </label>
      </div>
    `).join('');
  }catch(e){ console.warn('populateEmployeeListForFlowerInd warn', e); }
  }
  async function distributeFlowerIndToSelected(){ try{
    const amount = parseInt(document.getElementById('flowerIndAmountInput').value);
    const reason = (document.getElementById('flowerIndReasonInput').value||'').trim() || 'Distribuição FLOWER IND pelo admin';
    const selected = Array.from(document.querySelectorAll('#employeeListForFlowerInd input[type="checkbox"]:checked')).map(cb=> cb.value);
    if(!amount || amount<=0){ alert('Insira uma quantidade válida (inteiro).'); return; }
    if(selected.length===0){ alert('Selecione ao menos um funcionário.'); return; }
    let ok=0, fail=0;
    for(const userId of selected){ const res = await distributeFlowerIndToUser(userId, amount, reason); if(res.success) ok++; else fail++; }
    const modal = document.getElementById('flowerIndModal'); if(modal) modal.remove();
    if(typeof showNotification==='function'){ showNotification(`${amount} FLOWER IND distribuído para ${ok} funcionário(s)`, ok? 'success':'warning'); }
    if(sync){ await sync.syncUserStats(); }
  }catch(e){ console.error('distributeFlowerIndToSelected error', e); }
  }
  async function distributeFlowerIndToUser(userId, amount, reason){ try{
    if(!supabaseClient){ return { success:false, error:'client' }; }
    let { data: stats, error } = await supabaseClient.from('user_stats').select('*').eq('user_id', userId).single();
    if(error && error.code==='PGRST116'){ const { data: newStats, error: insErr } = await supabaseClient.from('user_stats').insert({ user_id:userId, total_points:0, total_money:'0', level_num:1, tasks_completed:0, current_streak:0, longest_streak:0, flower_coins_distributed:0, flowers_meta_distributed:0, flowers_ind_distributed:0 }).select().single(); if(insErr) stats=null; else stats = newStats; }
    let ok = false;
    if(stats){ const current = stats?.flowers_ind_distributed||0; const updated = current + amount; try{ await supabaseClient.from('user_stats').update({ flowers_ind_distributed: updated, updated_at: new Date().toISOString() }).eq('user_id', userId); ok = true; }catch(_){ ok = false; } }
    // Always log to history so employee sees via fallback
    try{ await supabaseClient.from('points_distribution_history').insert({ user_id: userId, admin_id: (JSON.parse(localStorage.getItem('currentUser')||'{}').id||null), type: 'add', point_type: 'flower_ind', amount, reason, created_at: new Date().toISOString() }); }catch(_){/* ignore */}
    return { success:true };
  }catch(e){ return { success:false, error:e.message }; }
  }

  function showNewTaskChooser(){ try{
    const modal = document.createElement('div'); modal.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:1000';
    modal.innerHTML = `
      <div style="background:white;border-radius:12px;padding:1rem 1.25rem;width:90%;max-width:520px;">
        <h2 style="margin:0 0 .75rem 0;font-weight:700;">Criar Nova Tarefa</h2>
        <p style="margin:0 0 .75rem 0;color:#555;">Selecione o tipo:</p>
        <div style="display:flex;gap:.75rem;flex-wrap:wrap;">
          <button class="opt-normal" style="background:#10b981;color:white;border:none;padding:.5rem .75rem;border-radius:8px;">Tarefa Normal</button>
          <button class="opt-meta" style="background:#e84393;color:white;border:none;padding:.5rem .75rem;border-radius:8px;">Tarefas FLOWER META</button>
          <button class="opt-ind" style="background:#db2777;color:white;border:none;padding:.5rem .75rem;border-radius:8px;">Tarefas FLOWER IND</button>
          <button class="opt-close" style="margin-left:auto;background:#777;color:white;border:none;padding:.5rem .75rem;border-radius:8px;">Fechar</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelector('.opt-close').onclick = ()=> modal.remove();
    modal.querySelector('.opt-meta').onclick = ()=> { modal.remove(); if(typeof showMetaTaskModal==='function') showMetaTaskModal(); };
    modal.querySelector('.opt-ind').onclick = ()=> { modal.remove(); showIndTaskModal(); };
    modal.querySelector('.opt-normal').onclick = ()=> { modal.remove(); alert('Use a lista de Tarefas para criar tarefas normais com o formulário padrão.'); };
  }catch(e){ console.warn('showNewTaskChooser warn', e); }
  }
  async function showIndTaskModal(){ try{
    await ensureIndSchema();
    const modal = document.createElement('div'); modal.id='indTaskCreateModal'; modal.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:1000';
    modal.innerHTML = `
      <div style="background:white;border-radius:12px;padding:1.5rem;width:90%;max-width:560px;max-height:80vh;overflow-y:auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
          <h2 style="margin:0;font-size:1.2rem;">Criar Tarefa FLOWER IND</h2>
          <button class="ind-close" style="background:#ff4757;color:white;border:none;border-radius:50%;width:30px;height:30px;cursor:pointer;">×</button>
        </div>
        <label>Título<input id="indTaskTitle" type="text" style="width:100%;padding:.5rem;border:1px solid #ddd;border-radius:8px;"></label>
        <label>Descrição<textarea id="indTaskDescription" rows="3" style="width:100%;padding:.5rem;border:1px solid #ddd;border-radius:8px;"></textarea></label>
        <label>Pontos IND<input id="indTaskPoints" type="number" step="1" min="1" value="5" style="width:100%;padding:.5rem;border:1px solid #ddd;border-radius:8px;"></label>
        <div style="margin-top:.75rem;">
          <h3 style="margin:0 0 .5rem 0;">Selecionar Funcionários</h3>
          <div id="indEmployeesList" style="max-height:200px;overflow-y:auto;border:1px solid #eee;border-radius:8px;padding:.5rem;"></div>
        </div>
        <div style="display:flex;gap:.5rem;justify-content:flex-end;margin-top:.5rem;">
          <button class="ind-cancel" style="background:#777;color:white;border:none;padding:.5rem 1rem;border-radius:8px;">Cancelar</button>
          <button class="ind-create" style="background:#db2777;color:white;border:none;padding:.5rem 1rem;border-radius:8px;">Criar</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelector('.ind-close').onclick = ()=> modal.remove();
    modal.querySelector('.ind-cancel').onclick = ()=> modal.remove();
    const container = document.getElementById('indEmployeesList');
    const employees = (sync?.getCachedUsers?.()||[]).filter(u=> !u.is_admin);
    container.innerHTML = employees.map(u=> `
      <label style="display:flex;align-items:center;padding:.25rem 0;">
        <input type="checkbox" value="${u.id}" style="margin-right:.5rem;">${u.username}
      </label>
    `).join('');
    modal.querySelector('.ind-create').onclick = async ()=>{
      const title = (document.getElementById('indTaskTitle').value||'').trim();
      const description = (document.getElementById('indTaskDescription').value||'').trim();
      const points = parseInt(document.getElementById('indTaskPoints').value)||0;
      const selected = Array.from(document.querySelectorAll('#indEmployeesList input[type="checkbox"]:checked')).map(cb=> cb.value);
      if(!title || points<=0 || selected.length===0){ alert('Preencha título, pontos e selecione funcionários.'); return; }
      const items = selected.map(userId=> ({ title, description, points, assigned_to_user_id: userId }));
      const BACKEND_URL = 'https://backend.youware.com';
      try {
        const resp = await fetch(`${BACKEND_URL}/api/ind-tasks`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items })
        });
        if (!resp.ok) throw new Error('Falha ao criar tarefas IND no backend');
        if(typeof showNotification==='function'){ showNotification('Tarefas IND criadas com sucesso!', 'success'); }
        modal.remove();
      } catch (e) {
        alert('Erro ao criar tarefas IND');
      }
    };
  }catch(e){ console.error('showIndTaskModal error', e); }
  }

  // ===== Employee Enhancements =====
  function injectEmployeeIndDisplay(){ try{
    const metaSection = document.querySelector('.coins-meta-section');
    const container = metaSection?.parentElement; if(!container) return;
    const div = document.createElement('div'); div.className='coins-ind-section';
    div.innerHTML = `
      <h3 class="coin-title" style="color:#ff1493;text-shadow:0 0 6px rgba(255,20,147,0.6);">FLOWER IND</h3>
      <div class="flex justify-center">
        <div class="coin-display flex-col">
          <img src="assets/img/FLOWER IND.png" alt="FLOWER IND" class="coin-icon">
          <div class="coin-amount" id="flowerIndAmount">0</div>
          <div style="color:#fff;font-size:0.9rem;">Metas IND</div>
        </div>
      </div>`;
    container.appendChild(div);
    refreshEmployeeIndAmount();
    // Nav button + section
    const navMenu = document.querySelector('.nav-menu');
    if(navMenu){ const btn = document.createElement('button'); btn.className='nav-button nav-button--meta'; btn.setAttribute('data-section','tasks-ind'); btn.innerHTML = `<span class="nav-button__icon-wrapper"><img src="assets/img/FLOWER IND.png" alt="Tarefas FLOWER IND" class="nav-button__icon"></span> Tarefas FLOWER IND`;
      navMenu.appendChild(btn);
      btn.addEventListener('click', (evt)=>{ evt.preventDefault(); if(typeof handleSectionChange==='function'){ handleSectionChange('tasks-ind', btn);} });
    }
    const tasksIndSection = document.createElement('div'); tasksIndSection.id='tasks-indSection'; tasksIndSection.className='content-section hidden'; tasksIndSection.innerHTML = `<h3 class="text-white text-xl font-bold mb-3">⭐ Tarefas FLOWER IND</h3><div id="tasksIndList"></div>`;
    const anchor = document.getElementById('penaltiesSection') || document.getElementById('tasksMetaSection');
    if(anchor && anchor.parentElement){ anchor.parentElement.insertBefore(tasksIndSection, anchor); }
  }catch(e){ console.warn('injectEmployeeIndDisplay warn', e); }
  }
  async function refreshEmployeeIndAmount(){ try{ if(!supabaseClient || !sync) return; const user = JSON.parse(localStorage.getItem('currentUser')||'{}'); if(!user?.id) return; const el = document.getElementById('flowerIndAmount'); let amount = 0; try{ const { data } = await supabaseClient.from('user_stats').select('flowers_ind_distributed').eq('user_id', user.id).single(); amount = Number(data?.flowers_ind_distributed||0); }catch(_){ /* ignore */ }
    if(!amount || isNaN(amount)) { amount = await computeIndFromHistory(user.id); }
    if(el){ el.textContent = Number(amount||0).toFixed(0); }
  }catch(e){ console.warn('refreshEmployeeIndAmount warn', e); } }
  async function renderIndTasks(){ try{ const user = JSON.parse(localStorage.getItem('currentUser')||'{}'); const container = document.getElementById('tasksIndList'); if(!container || !user?.id) return; let tasks=[]; const BACKEND_URL = 'https://backend.youware.com';
    try{ const r = await fetch(`${BACKEND_URL}/api/ind-tasks?user_id=${encodeURIComponent(user.id)}`); if(r.ok){ const j = await r.json(); tasks = j.tasks||[]; } }catch(_){ }
    if(!tasks.length){
      try{
        const r2 = await fetch(`${BACKEND_URL}/api/meta-tasks?user_id=${encodeURIComponent(user.id)}`); if(r2.ok){ const j2 = await r2.json(); const metas = j2.tasks||[]; tasks = metas.filter(t => ((t.title||'').includes('[IND]') || (t.description||'').includes('[IND]')))
          .map(t => ({ ...t, points: t.points||0 })); }
      }catch(_){ }
    }
    if(!tasks.length){ container.innerHTML = '<div class="task-item">Nenhuma tarefa IND disponível para você.</div>'; return; }
    container.innerHTML = tasks.map(t=> `
    <div class="task-item ${t.is_completed?'completed':''}" data-ind-id="${t.id}">
      <div class="task-header"><div class="task-title">${t.title||'Tarefa IND'}</div><div class="task-points">⭐ ${t.points||0} ind</div></div>
      <div class="task-description">${t.description||''}</div>
      <div class="task-footer">${t.is_completed? '<span style="color:#4CAF50;font-weight:bold;font-size:.9rem;">✓ Concluída</span>' : `<button class="complete-task-btn" onclick="completeIndTask('${t.id}', ${t.points||0})">Concluir</button>`}</div>
    </div>`).join(''); }catch(e){ console.error('renderIndTasks error', e); } }
  async function completeIndTask(id, points){ try{ const user = JSON.parse(localStorage.getItem('currentUser')||'{}'); if(!user?.id) return; await supabaseClient.from('ind_tasks').update({ is_completed:true, completed_at: new Date().toISOString() }).eq('id', id);
    // Try to update stats column; if fails, log to history so fallback renders
    try{ const { data: stats } = await supabaseClient.from('user_stats').select('*').eq('user_id', user.id).single(); const newInd = (stats?.flowers_ind_distributed||0) + (points||0); await supabaseClient.from('user_stats').update({ flowers_ind_distributed: newInd, updated_at: new Date().toISOString() }).eq('user_id', user.id); }catch(_){ await supabaseClient.from('points_distribution_history').insert({ user_id: user.id, admin_id: null, type: 'add', point_type: 'flower_ind', amount: points||0, reason: 'Conclusão tarefa IND', created_at: new Date().toISOString() }); }
    await refreshEmployeeIndAmount(); renderIndTasks(); if(typeof showNotification==='function'){ showNotification('Tarefa FLOWER IND concluída! ⭐', 'success'); } }catch(e){ console.error('completeIndTask error', e); }}

  // expose globals
  window.showFlowerIndDistribution = showFlowerIndDistribution;
  window.showIndTaskModal = showIndTaskModal;
  window.renderIndTasks = renderIndTasks;
  window.completeIndTask = completeIndTask;

  ready(async function(){ await initCommon(); if(isAdminPage()){ injectAdminButtons(); await injectAdminStatsCard(); await injectEmployeesIndCounts(); await ensureIndSchema(); await ensureMetaActiveFlags(); renderAdminMetaIndManagement(); } if(isEmployeePage()){ injectEmployeeIndDisplay(); await ensureIndSchema(); renderIndTasks(); subscribeIndRealtime(); } });
})();
// ===== Admin management for Meta/IND tasks =====
async function ensureMetaActiveFlags(){
  // No-op: handled by backend schema
  return true;
}

function renderAdminMetaIndManagement(){
  try{
    let container = document.querySelector("[class*='lg:col-span-2'][class*='space-y-8']");
    if(!container){
      container = document.querySelector("[class*='lg:grid-cols-3']")
        || document.getElementById('employees-list')?.closest("[class*='lg:col-span-2']")
        || document.querySelector('.grid.grid-cols-1')
        || document.body;
    }
    if(!container || document.getElementById('metaIndAdminCard')) return;
    const card = document.createElement('div');
    card.id = 'metaIndAdminCard';
    card.className = 'glass-card p-6';
    card.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-gray-800">Tarefas META e IND</h2>
        <div class="flex gap-2">
          <button class="px-3 py-1 bg-pink-500 text-white rounded" id="btnNewMeta">Nova Tarefa Meta</button>
          <button class="px-3 py-1 bg-fuchsia-600 text-white rounded" id="btnNewInd">Nova Tarefa IND</button>
        </div>
      </div>
      <div class="flex border-b mb-3">
        <button class="px-3 py-2 font-medium border-b-2 border-pink-500 text-pink-600" id="tabMeta">Meta</button>
        <button class="px-3 py-2 font-medium border-b-2 border-transparent hover:text-gray-700" id="tabInd">IND</button>
      </div>
      <p class="text-xs text-gray-500 mb-2">Obs: tarefas são direcionadas a pessoas específicas. O nome do funcionário aparece em cada tarefa.</p>
      <div id="metaList" class="space-y-2"></div>
      <div id="indList" class="space-y-2 hidden"></div>
    `;
    container.appendChild(card);
    document.getElementById('btnNewMeta').onclick = ()=> { if(typeof showMetaTaskModal==='function') showMetaTaskModal(); };
    document.getElementById('btnNewInd').onclick  = ()=> { if(typeof showIndTaskModal==='function') showIndTaskModal(); };
    document.getElementById('tabMeta').onclick = ()=>{ document.getElementById('metaList').classList.remove('hidden'); document.getElementById('indList').classList.add('hidden'); toggleTabs(true); };
    document.getElementById('tabInd').onclick  = ()=>{ document.getElementById('metaList').classList.add('hidden'); document.getElementById('indList').classList.remove('hidden'); toggleTabs(false); };
    loadMetaIndLists();
  }catch(e){ console.error('renderAdminMetaIndManagement error', e); }
  function toggleTabs(isMeta){
    const tabMeta = document.getElementById('tabMeta');
    const tabInd = document.getElementById('tabInd');
    if(isMeta){ tabMeta.classList.add('border-pink-500','text-pink-600'); tabMeta.classList.remove('border-transparent'); tabInd.classList.remove('border-pink-500','text-pink-600'); tabInd.classList.add('border-transparent'); }
    else { tabInd.classList.add('border-pink-500','text-pink-600'); tabInd.classList.remove('border-transparent'); tabMeta.classList.remove('border-pink-500','text-pink-600'); tabMeta.classList.add('border-transparent'); }
  }
}

async function loadMetaIndLists(){
  try{
    const metaList = document.getElementById('metaList');
    const indList  = document.getElementById('indList');
    if(!metaList || !indList) return;
    const BACKEND_URL = 'https://backend.youware.com';
    let metas = []; let inds = [];
    try{ const r1 = await fetch(`${BACKEND_URL}/api/meta-tasks`); if(r1.ok){ const j = await r1.json(); metas = j.tasks||[]; } }catch(_){ }
    try{ const r2 = await fetch(`${BACKEND_URL}/api/ind-tasks`); if(r2.ok){ const j = await r2.json(); inds = j.tasks||[]; } }catch(_){ }
    metaList.innerHTML = (metas||[]).map(t => adminTaskRow(t,'meta')).join('');
    indList.innerHTML  = (inds||[]).map(t => adminTaskRow(t,'ind')).join('');
  }catch(e){ console.error('loadMetaIndLists error', e); }
}

function escapeHtml(str){
  try {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  } catch (_) { return ''; }
}

function adminTaskRow(t, kind){
  const active = t.is_active !== false;
  const points = t.points || t[ kind==='meta' ? 'flower_meta' : 'flower_ind' ] || 0;
  const id = t.id;
  // Mapear funcionário atribuído
  let assigneeName = '—';
  try {
    const syncInst = (typeof window !== 'undefined' && window.getFlowerCoinsSync) ? window.getFlowerCoinsSync() : null;
    const users = syncInst?.getCachedUsers?.() || [];
    const assignee = users.find(u => String(u.id) === String(t.assigned_to_user_id));
    assigneeName = assignee?.username || (t.assigned_to_user_id ? `ID ${String(t.assigned_to_user_id).slice(-6)}` : '—');
  } catch (_) {}
  return `
    <div class="p-3 border rounded flex items-center justify-between">
      <div>
        <div class="font-bold text-gray-800">${escapeHtml(t.title||'Tarefa')}</div>
        <div class="text-sm text-gray-600">${escapeHtml(t.description||'')}</div>
        <div class="text-xs text-gray-500">Atribuída a: ${escapeHtml(assigneeName)}</div>
      </div>
      <div class="flex items-center gap-2">
        <span class="px-2 py-1 rounded-full text-xs ${kind==='meta'?'bg-yellow-100 text-yellow-800':'bg-fuchsia-100 text-fuchsia-800'}">${points} ${kind.toUpperCase()}</span>
        <button class="px-2 py-1 ${active?'bg-red-500':'bg-green-500'} text-white rounded" onclick="toggleAdminTaskActive('${kind}', ${id}, ${!active})">${active?'Desativar':'Ativar'}</button>
        <button class="px-2 py-1 bg-blue-500 text-white rounded" onclick="editAdminTask('${kind}', ${id})">Editar</button>
        <button class="px-2 py-1 bg-gray-700 text-white rounded" onclick="deleteAdminTask('${kind}', ${id})">Apagar</button>
      </div>
    </div>`;
}

window.toggleAdminTaskActive = async function(kind, id, setActive){
  try{
    const table = kind==='meta' ? 'meta_tasks' : 'ind_tasks';
    const { error } = await supabaseClient.from(table).update({ is_active: !!setActive }).eq('id', id);
    if(error) throw error;
    if(typeof showNotification==='function'){ showNotification(`Tarefa ${kind.toUpperCase()} ${setActive?'ativada':'desativada'}`, 'success'); }
    await loadMetaIndLists();
  }catch(e){ console.error('toggleAdminTaskActive error', e); if(typeof showNotification==='function'){ showNotification('Erro ao alterar status da tarefa', 'error'); } }
};

window.deleteAdminTask = async function(kind, id){
  try{
    if(!confirm('Apagar definitivamente esta tarefa?')) return;
    const table = kind==='meta' ? 'meta_tasks' : 'ind_tasks';
    const { error } = await supabaseClient.from(table).delete().eq('id', id);
    if(error) throw error;
    await loadMetaIndLists();
  }catch(e){ console.error('deleteAdminTask error', e); }
};

window.editAdminTask = async function(kind, id){
  try{
    const table = kind==='meta' ? 'meta_tasks' : 'ind_tasks';
    const { data, error } = await supabaseClient.from(table).select('*').eq('id', id).single();
    if(error) throw error;
    const title = prompt('Título', data.title||''); if(title===null) return;
    const description = prompt('Descrição', data.description||''); if(description===null) return;
    const points = parseInt(prompt('Pontos', (data.points || data[kind==='meta'?'flower_meta':'flower_ind'] || 0))); if(!points || points<=0) return alert('Pontos inválidos');
    const updates = { title, description, points };
    updates[kind==='meta'?'flower_meta':'flower_ind'] = points;
    const { error: upErr } = await supabaseClient.from(table).update(updates).eq('id', id);
    if(upErr) throw upErr;
    await loadMetaIndLists();
  }catch(e){ console.error('editAdminTask error', e); }
};

// Inject "Nova Tarefa IND" next to Meta buttons when present
(function injectNovaTarefaIndButtons(){
  try{
    const container = document.getElementById('tasks-list');
    if(!container) return;
    const obs = new MutationObserver(()=>{
      container.querySelectorAll('button').forEach(btn=>{
        if(btn.textContent && btn.textContent.includes('Nova Tarefa Meta')){
          const sibling = document.createElement('button');
          sibling.className = 'px-3 py-1 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-lg text-sm ml-2';
          sibling.textContent = 'Nova Tarefa IND';
          sibling.onclick = ()=> { if(typeof showIndTaskModal==='function') showIndTaskModal(); };
          if(!btn.nextSibling || !btn.nextSibling.textContent || !btn.nextSibling.textContent.includes('Nova Tarefa IND')){
            btn.parentElement.insertBefore(sibling, btn.nextSibling);
          }
        }
      });
    });
    obs.observe(container, { childList:true, subtree:true });
  }catch(e){ console.warn('injectNovaTarefaIndButtons warn', e); }
})();

// Fallback: compute IND amount from points_distribution_history
async function computeIndFromHistory(userId){
  try{
    const { data } = await supabaseClient.from('points_distribution_history').select('type, point_type, amount').eq('user_id', userId);
    let total = 0; (data||[]).forEach(row => { if(row.point_type==='flower_ind'){ total += (row.type==='deduct' ? -Number(row.amount||0) : Number(row.amount||0)); } });
    // Fallback: somar tarefas META marcadas como [IND]
    if (!total) {
      try {
        const { data: tasks } = await supabaseClient.from('meta_tasks').select('title, description, points, flower_meta, is_completed, assigned_to_user_id').eq('assigned_to_user_id', userId);
        total = (tasks||[]).filter(t => ((t.title||'').includes('[IND]') || (t.description||'').includes('[IND]')) && t.is_completed)
          .reduce((s,t)=> s + (t.points || t.flower_meta || 0), 0);
      } catch (_) {}
    }
    return total;
  }catch(e){ return 0; }
}

// Subscribe realtime for IND updates
function subscribeIndRealtime(){
  try{
    const ch = supabaseClient.channel('flower_ind_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ind_tasks' }, () => { renderIndTasks(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_stats' }, () => { refreshEmployeeIndAmount(); })
      .subscribe();
  }catch(e){ console.warn('subscribeIndRealtime warn', e); }
}
