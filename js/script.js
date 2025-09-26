let messageHistory = JSON.parse(localStorage.getItem('messageHistory')) || [];

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    loadSavedName();
    setupFormValidation();
    setupNavigation();
    loadMessageHistory();

    const nameInput = document.getElementById('nameInput');
    if (nameInput) {
        nameInput.addEventListener('keypress', e => {
            if (e.key === 'Enter') updateWelcomeMessage();
        });
    }
}

function loadSavedName() {
    const saved = localStorage.getItem('userName');
    if (saved) {
        document.getElementById('user-name').textContent = saved;
        document.getElementById('nameInput').value = saved;
    }
}

function updateWelcomeMessage() {
    const input = document.getElementById('nameInput');
    const display = document.getElementById('user-name');
    const val = input.value.trim();

    if (!val) return showAlert('Silakan masukkan nama Anda!', 'error');
    if (!/^[a-zA-Z\s]+$/.test(val)) return showAlert('Nama hanya boleh huruf dan spasi', 'error');
    if (val.length < 2) return showAlert('Nama minimal 2 karakter', 'error');

    display.textContent = val;
    localStorage.setItem('userName', val);

    display.style.transform = 'scale(1.1)';
    setTimeout(() => display.style.transform = 'scale(1)', 300);

    input.value = '';
    showAlert(`Selamat datang, ${val}!`, 'success');
}

function setupFormValidation() {
    const form = document.getElementById('messageForm');
    if (!form) return;

    const inputs = ['name','email','phone','message'].map(id => document.getElementById(id));
    const validators = [validateName, validateEmail, validatePhone, validateMessage];
    inputs.forEach((input, idx) => {
        input.addEventListener('blur', () => updateFieldError(input, validators[idx]));
        input.addEventListener('input', () => clearFieldError(input));
    });

    form.addEventListener('submit', e => {
        e.preventDefault();
        handleFormSubmit();
    });
}

function updateFieldError(input, validator) {
    const error = validator(input.value);
    showFieldError(input.id+'-error', error);
    input.style.borderColor = error ? '#e53e3e' : '#48bb78';
}

function clearFieldError(input) {
    input.style.borderColor = '#e2e8f0';
    showFieldError(input.id+'-error','');
}

function showFieldError(id,msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
}

function validateName(val){ 
    if(!val.trim()) return 'Nama harus diisi'; 
    if(val.length<2) return 'Nama minimal 2 karakter'; 
    if(!/^[a-zA-Z\s]+$/.test(val)) return 'Nama hanya boleh huruf dan spasi'; 
    return ''; 
}
function validateEmail(val) {
    if(!val.trim()) return 'Email harus diisi'; 
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Email tidak valid'; 
    return ''; 
}
function validatePhone(val){ 
    if(!val.trim()) return 'Telepon harus diisi'; 
    if(!/^\d+$/.test(val)) return 'Telepon harus angka'; 
    if(val.length<10) return 'Minimal 10 digit'; 
    if(val.length>15) return 'Maksimal 15 digit'; 
    return ''; 
}
function validateMessage(val) { 
    if(!val.trim()) return 'Pesan harus diisi';  
    if(val.length<10) return 'Minimal 10 karakter'; 
    if(val.length>500) return 'Maksimal 500 karakter'; 
    return ''; 
}

function handleFormSubmit() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const message = document.getElementById('message').value.trim();

    const errors = [validateName(name),validateEmail(email),validatePhone(phone),validateMessage(message)];
    const hasError = errors.some(e=>e);

    ['name','email','phone','message'].forEach((id,i)=>showFieldError(id+'-error',errors[i]));

    if(hasError) return showAlert('Perbaiki form terlebih dahulu','error');

    const msgObj = { 
        name, 
        email, 
        phone, 
        message, 
        timestamp: new Date().toLocaleString('id-ID')
    };
    messageHistory.unshift(msgObj);
    localStorage.setItem('messageHistory', JSON.stringify(messageHistory));

    updateMessageHistoryDisplay();
    document.getElementById('messageForm').reset();
    showAlert('Pesan berhasil dikirim!', 'success');
}

function loadMessageHistory() {
    const saved = localStorage.getItem('messageHistory');
    if(saved) messageHistory = JSON.parse(saved);
    updateMessageHistoryDisplay();
}

function updateMessageHistoryDisplay() {
    const display = document.getElementById('submissionDisplay');
    if (!display) return;

    if (messageHistory.length === 0) {
        display.innerHTML = '<p>Belum ada pesan yang dikirim.</p>';
        return;
    }

    display.innerHTML = messageHistory
        .slice(0, 5)
        .map(msg => `
            <div class="message-item">
                <strong>${msg.name}</strong> <span>${msg.timestamp}</span>
                <p>Email: ${msg.email}</p>
                <p>Phone: ${msg.phone}</p>
                <p>Message: ${msg.message}</p>
            </div>
        `).join('') 
        + (messageHistory.length > 5 
            ? `<p style="text-align:center">Dan ${messageHistory.length - 5} pesan lainnya...</p>` 
            : '');
}

function setupNavigation(){
    const mobileBtn=document.querySelector('.mobile-menu');
    const nav=document.getElementById('nav-menu');
    if(mobileBtn) mobileBtn.addEventListener('click',()=>nav.classList.toggle('active'));
    document.querySelectorAll('nav a[href^="#"]').forEach(link=>{
        link.addEventListener('click',e=>{
            e.preventDefault();
            const target=document.getElementById(link.getAttribute('href').slice(1));
            if(target) window.scrollTo({top:target.offsetTop-60,behavior:'smooth'});
            nav.classList.remove('active');
        });
    });
}

window.addEventListener('scroll',()=> {
    const header=document.querySelector('header');
    if(window.pageYOffset>100) header.style.boxShadow='0 2px 20px rgba(0,0,0,0.15)';
    else header.style.boxShadow='0 1px 30px rgba(0,0,0,0.1)';
});

// fungsi showAlert versi centang / ❌ / ℹ️
function showAlert(message, type = 'info') {
    const existingAlert = document.getElementById('customAlert');
    if (existingAlert) existingAlert.remove();
    
    const alert = document.createElement('div');
    alert.id = 'customAlert';
    alert.innerHTML = `
        <div class="alert-content">
            <span class="alert-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ'}</span>
            <span class="alert-message">${message}</span>
            <button class="alert-close" onclick="closeAlert()">&times;</button>
        </div>
    `;
    
    alert.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        max-width: 400px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #48bb78, #38a169)' : 
                    type === 'error' ? 'linear-gradient(135deg, #e53e3e, #c53030)' : 
                    'linear-gradient(135deg, #4299e1, #3182ce)'};
        color: white;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 10000;
        transform: translateX(450px);
        transition: transform 0.3s ease;
    `;
    
    if (!document.querySelector('#alert-styles')) {
        const style = document.createElement('style');
        style.id = 'alert-styles';
        style.textContent = `
            .alert-content {
                display: flex;
                align-items: center;
                padding: 1rem 1.5rem;
                gap: 0.75rem;
            }
            .alert-icon {
                font-size: 1.2rem;
                flex-shrink: 0;
            }
            .alert-message {
                flex-grow: 1;
                font-weight: 500;
                line-height: 1.4;
            }
            .alert-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background 0.2s ease;
                flex-shrink: 0;
            }
            .alert-close:hover {
                background: rgba(255,255,255,0.2);
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(alert);
    setTimeout(() => { alert.style.transform = 'translateX(0)'; }, 100);
    setTimeout(() => { closeAlert(); }, 5000);
}
function closeAlert(){ 
    const el=document.getElementById('customAlert'); 
    if(el) el.remove(); 
}
