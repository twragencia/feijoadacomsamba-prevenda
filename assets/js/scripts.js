
// ======= CONFIGURAÇÕES (EDITE AQUI) =======
const WHATSAPP_GROUP_LINK = 'https://bit.ly/prevendafeijuadacomsamba'; // Substitua pelo link real do grupo
const COUNTDOWN_TARGET = '2025-08-19T18:00:00-03:00'; // Data/hora fim da pré‑venda (exemplo)
const FAKE_GROUP_CAPACITY = 250; // para simular vagas restantes na página (visual)
let usedSlots = 113; // ajuste conforme sua campanha

// Endpoint opcional para salvar lead (ex.: SheetMonkey, FormSubmit, webhook próprio)
// Deixe vazio para desabilitar
const LEAD_ENDPOINT = '';

// ======= INIT =======
AOS.init({once: true, duration: 700, easing: 'ease-out'});
document.getElementById('year').textContent = new Date().getFullYear();

// Progresso fake
function updateProgress() {
	const pct = Math.round((usedSlots / FAKE_GROUP_CAPACITY) * 100);
	const restam = Math.max(FAKE_GROUP_CAPACITY - usedSlots, 0);
	document.getElementById('progressBar').style.width = Math.min(pct, 100) + '%';
	document.getElementById('vagasRestantes').textContent = restam;
}
updateProgress();

// Mask WHATS
const whatsInput = document.getElementById('whats');
whatsInput.addEventListener('input', (e) => {
	let v = e.target.value.replace(/\D/g, '').slice(0, 11);
	if (v.length > 0) {
		v = '(' + v;
	}
	if (v.length > 3) {
		v = v.slice(0, 3) + ') ' + v.slice(3);
	}
	if (v.length > 10) {
		v = v.slice(0, 10) + v.slice(10);
	}
	if (v.length > 10) {
		v = v.slice(0, 10) + v.slice(10);
	}
	if (v.length > 6) {
		v = v.slice(0, 6) + v.slice(6);
	}
	if (v.length > 10) {
		v = v.slice(0, 10) + v.slice(10);
	}
	// formato final (XX) XXXXX-XXXX
	v = v.replace(/\((\d{2})\) (\d{5})(\d{0,4}).*/, '($1) $2-$3');
	e.target.value = v;
});

// Countdown
const countdownEl = document.getElementById('countdown');
const targetDate = new Date(COUNTDOWN_TARGET).getTime();
setInterval(() => {
	const now = Date.now();
	const diff = Math.max(targetDate - now, 0);
	const d = Math.floor(diff / (1000 * 60 * 60 * 24));
	const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
	const s = Math.floor((diff % (1000 * 60)) / 1000);
	countdownEl.textContent = `${String(d).padStart(2, '0')}d : ${String(h).padStart(2, '0')}h : ${String(m).padStart(2, '0')}m : ${String(s).padStart(2, '0')}s`;
}, 1000);

// Validação Bootstrap
(() => {
	'use strict'
	const forms = document.querySelectorAll('.needs-validation')
	Array.from(forms).forEach(form => {
		form.addEventListener('submit', async (event) => {
			event.preventDefault();
			if (!form.checkValidity()) {
				event.stopPropagation();
			} else {
				await handleLead(form);
			}
			form.classList.add('was-validated');
		}, false)
	})
})();

function sanitizePhone(str) {
	return '55' + str.replace(/\D/g, '').replace(/^0+/, '');
}

async function handleLead(form) {
	const msg = document.getElementById('msg');
	msg.classList.add('d-none');
	const nome = document.getElementById('nome').value.trim();
	const whatsMasked = document.getElementById('whats').value.trim();
	const phone = sanitizePhone(whatsMasked);

	// Opcional: enviar para endpoint próprio
	if (LEAD_ENDPOINT) {
		try {
			await fetch(LEAD_ENDPOINT, {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({nome, phone, source: 'lp_pre_venda', ts: new Date().toISOString()})
			});
		} catch (e) {
			console.warn('Falha ao enviar lead (ignorado):', e);
		}
	}

	// GTM / dataLayer
	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push({event: 'lead_submit', nome, phone});

	// Incrementa vagas fake (visual)
	usedSlots = Math.min(usedSlots + 1, FAKE_GROUP_CAPACITY);
	updateProgress();

	// Redireciona para o grupo
	if (WHATSAPP_GROUP_LINK && WHATSAPP_GROUP_LINK.includes('chat.whatsapp.com')) {
		window.open(WHATSAPP_GROUP_LINK, '_blank');
		showMsg('Pronto! Abrimos o WhatsApp em uma nova aba. Se não abrir, use o botão “Copiar link do grupo”.');
	} else {
		showMsg('Link do grupo não configurado. Clique em “Copiar link do grupo” e cole seu convite real no código.', 'warning');
	}

	form.reset();
	form.classList.remove('was-validated');
}

function showMsg(text, type = 'success') {
	const msg = document.getElementById('msg');
	msg.textContent = text;
	msg.className = 'alert alert-' + (type === 'warning' ? 'warning' : 'success') + ' mt-3';
}

document.getElementById('btnCopiar').addEventListener('click', async () => {
	if (!WHATSAPP_GROUP_LINK) {
		showMsg('Configure o WHATSAPP_GROUP_LINK no topo do script.', 'warning');
		return;
	}
	try {
		await navigator.clipboard.writeText(WHATSAPP_GROUP_LINK);
		showMsg('Link do grupo copiado! Cole no seu navegador ou compartilhe com a equipe.');
	} catch (e) {
		showMsg('Não foi possível copiar automaticamente. Selecione e copie manualmente: ' + WHATSAPP_GROUP_LINK, 'warning');
	}
});
