// ============================================================
//  FitPro GMS — Frontend Application
//  Connects to Express/MySQL backend on http://localhost:5000
// ============================================================

const API = 'https://gym-management-system-4ti5.onrender.com/api';
let TOKEN = localStorage.getItem('gms_token') || null;
let revenueChart = null;

// ---- Helpers -----------------------------------------------
function req(path, opts = {}) {
  return fetch(API + path, {
    headers: {
      'Content-Type': 'application/json',
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {})
    },
    ...opts
  }).then(r => r.json());
}

function toast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast toast-${type}`;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 3500);
}

function badge(status) {
  const map = {
    Active:'badge-active', Inactive:'badge-inactive', Expired:'badge-expired',
    Suspended:'badge-suspended', Success:'badge-success', Cancelled:'badge-inactive'
  };
  return `<span class="badge ${map[status]||'badge-inactive'}">${status}</span>`;
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}

function formatCurrency(n) {
  return '₹' + Number(n||0).toLocaleString('en-IN');
}

function openModal(title, bodyHTML, onSubmit) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHTML;
  document.getElementById('modal-overlay').classList.remove('hidden');
  if (onSubmit) {
    const form = document.getElementById('modal-form');
    form && form.addEventListener('submit', e => { e.preventDefault(); onSubmit(); }, { once: true });
  }
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}

// ---- Auth --------------------------------------------------
// Toggle Forms
document.getElementById('show-signup-btn').addEventListener('click', e => {
  e.preventDefault();
  document.getElementById('login-section').classList.add('hidden');
  document.getElementById('signup-section').classList.remove('hidden');
});

document.getElementById('show-login-btn').addEventListener('click', e => {
  e.preventDefault();
  document.getElementById('signup-section').classList.add('hidden');
  document.getElementById('login-section').classList.remove('hidden');
});

document.getElementById('forgot-pw-link').addEventListener('click', e => {
  e.preventDefault();
  alert('Please contact the super-administrator (admin@gymms.com) to reset your password.');
});

// Login
document.getElementById('login-form').addEventListener('submit', async e => {
  e.preventDefault();
  const btn = document.getElementById('login-btn');
  const err = document.getElementById('login-error');
  btn.disabled = true;
  btn.querySelector('span').textContent = 'Signing in…';
  err.classList.add('hidden');

  const res = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username: document.getElementById('l-username').value,
      password: document.getElementById('l-password').value
    })
  }).catch(() => ({ success: false, message: 'Cannot reach server. Is the backend running?' }));

  if (res.success) {
    TOKEN = res.token;
    localStorage.setItem('gms_token', TOKEN);
    document.getElementById('admin-name').textContent = res.admin?.name || 'Admin';
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    loadDashboard();
  } else {
    err.textContent = res.message || 'Login failed.';
    err.classList.remove('hidden');
    btn.disabled = false;
    btn.querySelector('span').textContent = 'Sign In';
  }
});

// Signup
document.getElementById('signup-form').addEventListener('submit', async e => {
  e.preventDefault();
  const btn = document.getElementById('signup-btn');
  const err = document.getElementById('signup-error');
  btn.disabled = true;
  btn.querySelector('span').textContent = 'Creating…';
  err.classList.add('hidden');

  const res = await req('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      full_name: document.getElementById('s-fullname').value,
      email:     document.getElementById('s-email').value,
      username:  document.getElementById('s-username').value,
      password:  document.getElementById('s-password').value
    })
  }).catch(() => ({ success: false, message: 'Cannot reach server.' }));

  if (res.success) {
    TOKEN = res.token;
    localStorage.setItem('gms_token', TOKEN);
    document.getElementById('admin-name').textContent = res.admin?.name || 'Admin';
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    loadDashboard();
    toast('Account created successfully!');
  } else {
    err.textContent = res.message || 'Signup failed.';
    err.classList.remove('hidden');
    btn.disabled = false;
    btn.querySelector('span').textContent = 'Sign Up';
  }
});

document.getElementById('logout-btn').addEventListener('click', () => {
  TOKEN = null;
  localStorage.removeItem('gms_token');
  document.getElementById('app').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
});

// ---- Navigation -------------------------------------------
document.querySelectorAll('.nav-item').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const page = a.dataset.page;
    navigate(page);
    // close sidebar on mobile
    document.getElementById('sidebar').classList.remove('open');
  });
});

document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

function navigate(page) {
  document.querySelectorAll('.nav-item').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  const labels = {
    dashboard:'Dashboard', members:'Members', trainers:'Trainers',
    packages:'Packages', memberships:'Memberships', payments:'Payments'
  };
  document.getElementById('page-title').textContent = labels[page] || page;

  switch (page) {
    case 'dashboard':   loadDashboard();    break;
    case 'members':     loadMembers();      break;
    case 'trainers':    loadTrainers();     break;
    case 'packages':    loadPackages();     break;
    case 'memberships': loadMemberships();  break;
    case 'payments':    loadPayments();     break;
  }
}

// ---- Dashboard --------------------------------------------
async function loadDashboard() {
  const [stats, monthly, expiring] = await Promise.all([
    req('/members/stats'),
    req('/payments/monthly'),
    req('/memberships/expiring')
  ]);

  if (stats.success) {
    document.getElementById('stat-total').textContent     = stats.data.total_members ?? '—';
    document.getElementById('stat-active').textContent    = stats.data.active_members ?? '—';
    document.getElementById('stat-memberships').textContent = stats.data.active_memberships ?? '—';
    document.getElementById('stat-revenue').textContent   = formatCurrency(stats.data.total_revenue);
  }

  // Revenue chart
  if (monthly.success) {
    const months  = monthly.data.map(r => r.month).reverse();
    const revenue = monthly.data.map(r => r.revenue).reverse();
    const ctx     = document.getElementById('revenue-chart');
    if (revenueChart) revenueChart.destroy();
    revenueChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [{
          label: 'Revenue (₹)',
          data: revenue,
          backgroundColor: 'rgba(13,27,110,0.75)',
          borderColor:     '#0d1b6e',
          borderWidth: 2,
          borderRadius: 6,
          hoverBackgroundColor: '#f9a825'
        }]
      },
      options: {
        responsive:true, maintainAspectRatio:true,
        plugins:{ legend:{ display:false } },
        scales:{
          x:{ grid:{ color:'rgba(0,0,0,0.04)' }, ticks:{ color:'#5a6a88', font:{ family:'Roboto' } } },
          y:{ grid:{ color:'rgba(0,0,0,0.04)' }, ticks:{ color:'#5a6a88', font:{ family:'Roboto' }, callback: v => '₹'+Number(v).toLocaleString('en-IN') } }
        }
      }
    });
  }

  // Expiring memberships
  const el = document.getElementById('expiring-list');
  if (expiring.success && expiring.data.length > 0) {
    el.innerHTML = expiring.data.map(m => {
      const days = Math.ceil((new Date(m.end_date)-new Date()) / 86400000);
      const init  = m.member_name.split(' ').map(w=>w[0]).join('').toUpperCase();
      return `<div class="expiring-item">
        <div class="exp-avatar">${init}</div>
        <div>
          <div class="exp-name">${m.member_name}</div>
          <div class="exp-detail">${m.package_name} · ${m.contact}</div>
        </div>
        <div class="exp-days">${days}d left</div>
      </div>`;
    }).join('');
  } else {
    el.innerHTML = '<div class="no-expiring">✅ No memberships expiring this week</div>';
  }
}

// ---- Members -----------------------------------------------
async function loadMembers() {
  const res = await req('/members');
  const tbody = document.getElementById('members-tbody');
  if (!res.success) { tbody.innerHTML = `<tr><td colspan="8" class="loading-row">Error loading members</td></tr>`; return; }
  tbody.innerHTML = res.data.map(m => `
    <tr>
      <td>${m.member_id}</td>
      <td><strong>${m.fname} ${m.lname}</strong></td>
      <td>${m.contact}</td>
      <td>${m.email}</td>
      <td>${m.package_name || '<span style="color:var(--text-dim)">—</span>'}</td>
      <td>${m.trainer_name || '<span style="color:var(--text-dim)">—</span>'}</td>
      <td>${badge(m.status)}</td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="editMember(${m.member_id})">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteMember(${m.member_id})">Delete</button>
      </td>
    </tr>`).join('');
}

// Search filter
document.getElementById('member-search').addEventListener('input', function() {
  const q = this.value.toLowerCase();
  document.querySelectorAll('#members-tbody tr').forEach(tr => {
    tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
});

document.getElementById('add-member-btn').addEventListener('click', () => {
  openModal('Add New Member', memberForm(), () => saveMember());
});

function memberForm(m = {}) {
  return `<form id="modal-form">
    <div class="modal-form-grid">
      <div class="form-group">
        <label>First Name *</label>
        <input id="mf-fname" value="${m.fname||''}" placeholder="First name" required />
      </div>
      <div class="form-group">
        <label>Last Name</label>
        <input id="mf-lname" value="${m.lname||''}" placeholder="Last name" />
      </div>
      <div class="form-group">
        <label>Email *</label>
        <input id="mf-email" type="email" value="${m.email||''}" placeholder="email@example.com" required />
      </div>
      <div class="form-group">
        <label>Contact *</label>
        <input id="mf-contact" value="${m.contact||''}" placeholder="9XXXXXXXXX" required />
      </div>
      <div class="form-group">
        <label>Gender</label>
        <select id="mf-gender">
          <option ${m.gender==='Male'?'selected':''}>Male</option>
          <option ${m.gender==='Female'?'selected':''}>Female</option>
          <option ${m.gender==='Other'?'selected':''}>Other</option>
        </select>
      </div>
      <div class="form-group">
        <label>Date of Birth</label>
        <input id="mf-dob" type="date" value="${m.dob?.split('T')[0]||''}" />
      </div>
      <div class="form-group full">
        <label>Address</label>
        <input id="mf-address" value="${m.address||''}" placeholder="Full address" />
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button type="submit" class="btn btn-primary">Save Member</button>
    </div>
  </form>`;
}

async function saveMember(id) {
  const body = {
    fname:   document.getElementById('mf-fname').value,
    lname:   document.getElementById('mf-lname').value,
    email:   document.getElementById('mf-email').value,
    contact: document.getElementById('mf-contact').value,
    gender:  document.getElementById('mf-gender').value,
    dob:     document.getElementById('mf-dob').value || null,
    address: document.getElementById('mf-address').value
  };
  const res = id
    ? await req(`/members/${id}`, { method:'PUT', body:JSON.stringify(body) })
    : await req('/members',        { method:'POST', body:JSON.stringify(body) });
  if (res.success) { toast(id ? 'Member updated!' : 'Member added!'); closeModal(); loadMembers(); }
  else toast(res.message, 'error');
}

async function editMember(id) {
  const res = await req(`/members/${id}`);
  const m = res.data?.[0];
  if (!m) return toast('Could not load member', 'error');
  openModal('Edit Member', memberForm(m), () => saveMember(id));
}

async function deleteMember(id) {
  if (!confirm('Delete this member? This cannot be undone.')) return;
  const res = await req(`/members/${id}`, { method:'DELETE' });
  if (res.success) { toast('Member deleted.'); loadMembers(); }
  else toast(res.message, 'error');
}

// ---- Trainers ----------------------------------------------
async function loadTrainers() {
  const res = await req('/trainers');
  const tbody = document.getElementById('trainers-tbody');
  if (!res.success) { tbody.innerHTML = `<tr><td colspan="8" class="loading-row">Error</td></tr>`; return; }
  tbody.innerHTML = res.data.map(t => `
    <tr>
      <td>${t.trainer_id}</td>
      <td><strong>${t.name}</strong></td>
      <td>${t.phone}</td>
      <td>${t.speciality||'—'}</td>
      <td>${t.salary ? formatCurrency(t.salary)+'/mo' : '—'}</td>
      <td><span class="badge badge-active">${t.assigned_members}</span></td>
      <td>${badge(t.status)}</td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="editTrainer(${t.trainer_id})">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteTrainer(${t.trainer_id})">Delete</button>
      </td>
    </tr>`).join('');
}

document.getElementById('add-trainer-btn').addEventListener('click', () => {
  openModal('Add Trainer', trainerForm(), () => saveTrainer());
});

function trainerForm(t = {}) {
  return `<form id="modal-form">
    <div class="modal-form-grid">
      <div class="form-group full">
        <label>Full Name *</label>
        <input id="tf-name" value="${t.name||''}" required />
      </div>
      <div class="form-group">
        <label>Phone *</label>
        <input id="tf-phone" value="${t.phone||''}" required />
      </div>
      <div class="form-group">
        <label>Email</label>
        <input id="tf-email" type="email" value="${t.email||''}" />
      </div>
      <div class="form-group full">
        <label>Speciality</label>
        <input id="tf-speciality" value="${t.speciality||''}" placeholder="e.g. Weight Loss" />
      </div>
      <div class="form-group">
        <label>Monthly Salary (₹)</label>
        <input id="tf-salary" type="number" value="${t.salary||''}" />
      </div>
      <div class="form-group">
        <label>Status</label>
        <select id="tf-status">
          <option ${t.status==='Active'||!t.status?'selected':''}>Active</option>
          <option ${t.status==='Inactive'?'selected':''}>Inactive</option>
        </select>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button type="submit" class="btn btn-primary">Save Trainer</button>
    </div>
  </form>`;
}

async function saveTrainer(id) {
  const body = {
    name:       document.getElementById('tf-name').value,
    phone:      document.getElementById('tf-phone').value,
    email:      document.getElementById('tf-email').value,
    speciality: document.getElementById('tf-speciality').value,
    salary:     document.getElementById('tf-salary').value || null,
    status:     document.getElementById('tf-status').value
  };
  const res = id
    ? await req(`/trainers/${id}`, { method:'PUT', body:JSON.stringify(body) })
    : await req('/trainers',       { method:'POST', body:JSON.stringify(body) });
  if (res.success) { toast(id ? 'Trainer updated!' : 'Trainer added!'); closeModal(); loadTrainers(); }
  else toast(res.message, 'error');
}

async function editTrainer(id) {
  const res = await req(`/trainers/${id}`);
  if (!res.success) return toast('Could not load trainer', 'error');
  openModal('Edit Trainer', trainerForm(res.data), () => saveTrainer(id));
}

async function deleteTrainer(id) {
  if (!confirm('Delete this trainer?')) return;
  const res = await req(`/trainers/${id}`, { method:'DELETE' });
  if (res.success) { toast('Trainer deleted.'); loadTrainers(); }
  else toast(res.message, 'error');
}

// ---- Packages ----------------------------------------------
async function loadPackages() {
  const res = await req('/packages');
  const grid = document.getElementById('packages-grid');
  if (!res.success) { grid.textContent = 'Error loading packages'; return; }
  grid.innerHTML = [
    ...res.data.map(p => `
      <div class="package-card">
        <div class="pkg-name">${p.package_name}</div>
        <div class="pkg-desc">${p.description || 'No description available.'}</div>
        <div class="pkg-amount">${formatCurrency(p.amount)} <span>/ ${p.duration_months} month${p.duration_months>1?'s':''}</span></div>
        <div class="pkg-duration">📅 ${p.duration_months}-month plan</div>
        <div class="pkg-actions">
          <button class="btn btn-ghost btn-sm" onclick="editPackage(${p.package_id})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deletePackage(${p.package_id})">Delete</button>
        </div>
      </div>`),
    `<div class="package-card" style="display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;border:2px dashed var(--border);" onclick="document.getElementById('add-package-btn').click()">
        <div style="font-size:36px;margin-bottom:12px">+</div>
        <div style="font-weight:600;">Create New Package</div>
     </div>`
  ].join('');
}

document.getElementById('add-package-btn').addEventListener('click', () => {
  openModal('Add Package', packageForm(), () => savePackage());
});

function packageForm(p = {}) {
  return `<form id="modal-form">
    <div class="modal-form-grid">
      <div class="form-group full">
        <label>Package Name *</label>
        <input id="pf-name" value="${p.package_name||''}" required />
      </div>
      <div class="form-group full">
        <label>Description</label>
        <input id="pf-desc" value="${p.description||''}" />
      </div>
      <div class="form-group">
        <label>Duration (months) *</label>
        <input id="pf-duration" type="number" min="1" value="${p.duration_months||1}" required />
      </div>
      <div class="form-group">
        <label>Amount (₹) *</label>
        <input id="pf-amount" type="number" min="0" value="${p.amount||''}" required />
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button type="submit" class="btn btn-primary">Save Package</button>
    </div>
  </form>`;
}

async function savePackage(id) {
  const body = {
    package_name:    document.getElementById('pf-name').value,
    description:     document.getElementById('pf-desc').value,
    duration_months: parseInt(document.getElementById('pf-duration').value),
    amount:          parseFloat(document.getElementById('pf-amount').value)
  };
  const res = id
    ? await req(`/packages/${id}`, { method:'PUT', body:JSON.stringify(body) })
    : await req('/packages',       { method:'POST', body:JSON.stringify(body) });
  if (res.success) { toast(id ? 'Package updated!' : 'Package added!'); closeModal(); loadPackages(); }
  else toast(res.message, 'error');
}

async function editPackage(id) {
  const res = await req('/packages');
  const pkg = res.data?.find(p => p.package_id === id);
  if (!pkg) return toast('Could not load package', 'error');
  openModal('Edit Package', packageForm(pkg), () => savePackage(id));
}

async function deletePackage(id) {
  if (!confirm('Delete this package?')) return;
  const res = await req(`/packages/${id}`, { method:'DELETE' });
  if (res.success) { toast('Package deleted.'); loadPackages(); }
  else toast(res.message, 'error');
}

// ---- Memberships -------------------------------------------
async function loadMemberships() {
  const res = await req('/memberships');
  const tbody = document.getElementById('memberships-tbody');
  if (!res.success) { tbody.innerHTML = `<tr><td colspan="7" class="loading-row">Error</td></tr>`; return; }
  tbody.innerHTML = res.data.map(m => `
    <tr>
      <td>${m.membership_id}</td>
      <td><strong>${m.member_name}</strong></td>
      <td>${m.package_name}</td>
      <td>${m.trainer_name||'—'}</td>
      <td>${formatDate(m.start_date)}</td>
      <td>${formatDate(m.end_date)}</td>
      <td>${badge(m.status)}</td>
    </tr>`).join('');
}

document.getElementById('enroll-btn').addEventListener('click', async () => {
  const [pkgRes, trRes] = await Promise.all([req('/packages'), req('/trainers')]);
  const pkgOpts = pkgRes.data?.map(p => `<option value="${p.package_id}">${p.package_name} (${formatCurrency(p.amount)})</option>`).join('') || '';
  const trOpts  = [
    '<option value="">No Trainer</option>',
    ...(trRes.data?.map(t => `<option value="${t.trainer_id}">${t.name} — ${t.speciality||''}</option>`) || [])
  ].join('');

  const html = `<form id="modal-form">
    <div class="modal-form-grid">
      <div class="form-group"><label>First Name *</label><input id="ef-fname" required /></div>
      <div class="form-group"><label>Last Name</label><input id="ef-lname" /></div>
      <div class="form-group"><label>Email *</label><input id="ef-email" type="email" required /></div>
      <div class="form-group"><label>Contact *</label><input id="ef-contact" required /></div>
      <div class="form-group"><label>Gender</label>
        <select id="ef-gender"><option>Male</option><option>Female</option><option>Other</option></select>
      </div>
      <div class="form-group"><label>Date of Birth</label><input id="ef-dob" type="date" /></div>
      <div class="form-group full"><label>Package *</label><select id="ef-package">${pkgOpts}</select></div>
      <div class="form-group full"><label>Assign Trainer</label><select id="ef-trainer">${trOpts}</select></div>
      <div class="form-group full"><label>Payment Type</label>
        <select id="ef-paytype">
          <option>Cash</option><option>Card</option><option>Cheque</option>
          <option>UPI</option><option>Net Banking</option>
        </select>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button type="submit" class="btn btn-primary">Enroll & Pay</button>
    </div>
  </form>`;

  openModal('Enroll New Member', html, async () => {
    const res = await req('/memberships', {
      method: 'POST',
      body: JSON.stringify({
        fname:        document.getElementById('ef-fname').value,
        lname:        document.getElementById('ef-lname').value,
        email:        document.getElementById('ef-email').value,
        contact:      document.getElementById('ef-contact').value,
        gender:       document.getElementById('ef-gender').value,
        dob:          document.getElementById('ef-dob').value || null,
        package_id:   parseInt(document.getElementById('ef-package').value),
        trainer_id:   document.getElementById('ef-trainer').value || null,
        payment_type: document.getElementById('ef-paytype').value
      })
    });
    if (res.success) { toast('Member enrolled successfully! 🎉'); closeModal(); loadMemberships(); }
    else toast(res.message, 'error');
  });
});

// ---- Payments ----------------------------------------------
async function loadPayments() {
  const res = await req('/payments');
  const tbody = document.getElementById('payments-tbody');
  if (!res.success) { tbody.innerHTML = `<tr><td colspan="7" class="loading-row">Error</td></tr>`; return; }
  tbody.innerHTML = res.data.map(p => `
    <tr>
      <td>${p.payment_id}</td>
      <td><strong>${p.member_name}</strong></td>
      <td>${p.package_name}</td>
      <td style="color:#c17900;font-weight:700">${formatCurrency(p.amount)}</td>
      <td>${p.payment_type}</td>
      <td>${formatDate(p.payment_date)}</td>
      <td>${badge(p.status)}</td>
    </tr>`).join('');
}

// ---- Modal close ------------------------------------------
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
});

// ---- Auto-login if token exists --------------------------
(async () => {
  if (TOKEN) {
    const res = await req('/auth/me').catch(() => ({ success: false }));
    if (res.success) {
      document.getElementById('admin-name').textContent = res.admin?.username || 'Admin';
      document.getElementById('login-screen').classList.add('hidden');
      document.getElementById('app').classList.remove('hidden');
      loadDashboard();
    } else {
      TOKEN = null;
      localStorage.removeItem('gms_token');
    }
  }
})();
