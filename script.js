// Nature-style Birthday Paper System - JSONBin.io Version

// ==========================================
// [IMPORTANT] JSONBIN.IO CONFIGURATION
// 1. Go to https://jsonbin.io/ and create a new bin with content: {"messages": []}
// 2. Copy the Bin ID (e.g., 65123...)
// 3. Go to API Keys and copy your Master Key (or create an Access Key)
// ==========================================
const JSONBIN_API_KEY = "$2a$10$yVxH1SNHi4i61w8vkEdWoesD6lc4ghgmE8dlVKdardUN0j0fZ/NT6";
const JSONBIN_BIN_ID = "6931f1bfae596e708f83f81c";

let messages = [];
let referenceCounter = 3; // Start from [4] since [1], [2], [3] are predefined

// Fake journal names for references
const fakeJournals = [
    { name: "Journal of Condensed Matter Celebrations", abbrev: "J. Condens. Matter Celebr." },
    { name: "Physical Review of Birthday Physics", abbrev: "Phys. Rev. Birthday Phys." },
    { name: "Nature Communications: Festive Phenomena", abbrev: "Nat. Commun. Festive Phenom." },
    { name: "Applied Physics Letters: Cake Systems", abbrev: "Appl. Phys. Lett. Cake Syst." },
    { name: "Journal of Phonon-Mediated Interactions", abbrev: "J. Phonon-Mediat. Interact." },
    { name: "Solid State Communications: Birthday Edition", abbrev: "Solid State Commun. Birthday Ed." },
    { name: "Europhysics Letters: Celebration Series", abbrev: "Europhys. Lett. Celebr. Ser." },
    { name: "Journal of Applied Condensed Matter", abbrev: "J. Appl. Condens. Matter" },
    { name: "Physics Letters A: Lattice Systems", abbrev: "Phys. Lett. A Lattice Syst." },
    { name: "New Journal of Physics: Birthday Special", abbrev: "New J. Phys. Birthday Spec." }
];

// Generate random journal reference
function generateFakeJournalRef() {
    const journal = fakeJournals[Math.floor(Math.random() * fakeJournals.length)];
    const volume = Math.floor(Math.random() * 50) + 1;
    const issue = Math.floor(Math.random() * 12) + 1;
    const pages = Math.floor(Math.random() * 900) + 100;
    const year = 2020 + Math.floor(Math.random() * 5);
    
    return {
        journal: journal.name,
        abbrev: journal.abbrev,
        volume: volume,
        issue: issue,
        pages: pages,
        year: year
    };
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Setup UI components
    setupForm();
    setupModal();
    setupCharts(); // Charts might be empty initially
    checkUrlForMessage();

    // Load messages from JSONBin
    loadMessages();
});

// Load messages from JSONBin
async function loadMessages() {
    if (JSONBIN_API_KEY === "REPLACE_WITH_YOUR_MASTER_KEY") {
        console.warn("JSONBin API Key not set. Messages will not load.");
        return;
    }

    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
            headers: {
                'X-Master-Key': JSONBIN_API_KEY
            }
        });

        if (response.ok) {
            const data = await response.json();
            // JSONBin wraps data in 'record' property
            if (data.record && data.record.messages) {
                messages = data.record.messages;
                // Ensure messages are sorted by timestamp
                messages.sort((a, b) => a.id - b.id);
                updateReferences();
                updateStatistics();
                setupCharts();
            }
        } else {
            console.error("Failed to load messages:", response.statusText);
        }
    } catch (error) {
        console.error("Error loading messages:", error);
    }
}

// Save messages to JSONBin
async function saveMessagesToBin() {
    if (JSONBIN_API_KEY === "REPLACE_WITH_YOUR_MASTER_KEY") {
        alert("JSONBin API Key not configured. Message cannot be saved.");
        return false;
    }

    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_API_KEY
            },
            body: JSON.stringify({ messages: messages })
        });

        if (response.ok) {
            console.log("Messages saved successfully to JSONBin");
            return true;
        } else {
            console.error("Failed to save messages:", response.statusText);
            alert("Failed to save message. Please try again.");
            return false;
        }
    } catch (error) {
        console.error("Error saving messages:", error);
        alert("Error saving message. Please check your connection.");
        return false;
    }
}

// Update references numbers and render
function updateReferences() {
    messages.forEach((message, index) => {
        message.refNumber = referenceCounter + index + 1;
    });
    renderReferences();
}

// Render references section
function renderReferences() {
    const refList = document.getElementById('referencesList');
    if (!refList) return;
    
    // Keep predefined references (first 3 items)
    const staticRefs = Array.from(refList.querySelectorAll('.reference-item')).slice(0, 3);
    refList.innerHTML = '';
    staticRefs.forEach(ref => refList.appendChild(ref));
    
    // Add dynamic message references
    messages.forEach((message) => {
        const refItem = document.createElement('div');
        refItem.className = 'reference-item';
        refItem.dataset.messageId = message.id;
        
        const refNumber = message.refNumber;
        const name = escapeHtml(message.name);
        const messageText = escapeHtml(message.message);
        
        // Generate or use existing fake journal reference
        if (!message.journalRef) {
            message.journalRef = generateFakeJournalRef();
        }
        const journal = message.journalRef;
        
        // Format: Name, "Message text", Journal Name, Volume(Issue), Pages (Year)
        refItem.innerHTML = `
            <span class="ref-number">[${refNumber}]</span>
            <span class="ref-content">${name}, "${messageText.substring(0, 60)}${messageText.length > 60 ? '...' : ''}" 
            <em>${journal.abbrev}</em> <strong>${journal.volume}</strong>(${journal.issue}), ${journal.pages} (${journal.year}).</span>
        `;
        
        refItem.addEventListener('click', () => {
            showMessageViewModal(message, refNumber);
        });
        
        refList.appendChild(refItem);
    });
}

// Update statistics
function updateStatistics() {
    const countEl = document.getElementById('contributionCount');
    if (countEl) countEl.textContent = messages.length;
}

// Add message
async function addMessage() {
    let nameEl = document.getElementById('nameModal') || document.getElementById('name');
    let messageEl = document.getElementById('messageModalText') || document.getElementById('message');
    
    const name = nameEl ? nameEl.value.trim() : '';
    const message = messageEl ? messageEl.value.trim() : '';
    
    if (!name || !message) {
        alert('Please enter both your name and message!');
        return;
    }
    
    // Reload latest messages first to avoid overwriting others' updates
    await loadMessages();

    const newMessage = {
        id: Date.now(),
        name: name,
        message: message,
        emoji: '🎉',
        timestamp: new Date().toLocaleString('en-US'),
        journalRef: generateFakeJournalRef()
    };
    
    messages.push(newMessage);
    
    // Save to cloud
    const success = await saveMessagesToBin();
    
    if (success) {
        // Update UI only if save was successful
        updateReferences();
        updateStatistics();
        setupCharts();
        
        // Reset forms
        if (nameEl) nameEl.value = '';
        if (messageEl) messageEl.value = '';
        const paperForm = document.getElementById('messageForm');
        if (paperForm) paperForm.reset();
        
        closeMessageModal();
        showNotification('Contribution submitted! Your message has been added to References.');
    } else {
        // Remove failed message from local array
        messages.pop();
    }
}

// Setup form
function setupForm() {
    const form = document.getElementById('messageForm');
    const modalForm = document.getElementById('messageFormModal');
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            addMessage();
        });
    }
    
    if (modalForm) {
        modalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            addMessage();
        });
    }
}

// Setup modal
function setupModal() {
    window.addEventListener('click', (e) => {
        const messageModal = document.getElementById('messageModal');
        const viewModal = document.getElementById('messageViewModal');
        
        if (e.target === messageModal) closeMessageModal();
        if (e.target === viewModal) closeMessageViewModal();
    });
}

function showMessageForm() {
    const modal = document.getElementById('messageModal');
    if (modal) modal.style.display = 'block';
}

function closeMessageModal() {
    const modal = document.getElementById('messageModal');
    if (modal) modal.style.display = 'none';
}

function showMessageViewModal(message, refNumber) {
    const modal = document.getElementById('messageViewModal');
    if (!modal) return;
    
    document.getElementById('modalName').textContent = message.name;
    document.getElementById('modalMessage').textContent = message.message;
    document.getElementById('modalTime').textContent = `Submitted: ${message.timestamp}`;
    document.getElementById('modalCitation').textContent = `[${refNumber}]`;
    
    modal.style.display = 'block';
}

function closeMessageViewModal() {
    const modal = document.getElementById('messageViewModal');
    if (modal) modal.style.display = 'none';
}

function showPaper() {
    document.getElementById('mainPage').style.display = 'none';
    document.getElementById('paperPage').style.display = 'block';
    window.scrollTo(0, 0);
}

function showMainPage() {
    document.getElementById('paperPage').style.display = 'none';
    document.getElementById('mainPage').style.display = 'block';
    window.scrollTo(0, 0);
}

function sharePage() {
    const currentUrl = window.location.origin + window.location.pathname;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(currentUrl).then(() => {
            showNotification('Page link copied to clipboard!');
        }).catch(() => fallbackCopy(currentUrl));
    } else {
        fallbackCopy(currentUrl);
    }
}

function showGitHubPage() {
    document.getElementById('paperPage').style.display = 'none';
    document.getElementById('githubPage').style.display = 'block';
    window.scrollTo(0, 0);
}

function closeGitHubPage() {
    document.getElementById('githubPage').style.display = 'none';
    document.getElementById('paperPage').style.display = 'block';
    window.scrollTo(0, 0);
}

function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        showNotification('Reference link copied to clipboard!');
    } catch (err) {
        showNotification('Please copy this link: ' + text);
    }
    document.body.removeChild(textArea);
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #000;
        color: white;
        padding: 15px 25px;
        border: 2px solid #000;
        z-index: 10001;
        font-size: 11pt;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function checkUrlForMessage() {
    // URL sharing logic removed for simplicity
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function setupCharts() {
    setupPhononDispersionChart();
}

function setupPhononDispersionChart() {
    const canvas = document.getElementById('phononDispersionChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const kPoints = [];
    const acousticFreq = [];
    const opticalFreq = [];
    
    for (let i = 0; i <= 20; i++) {
        const k = i / 20;
        kPoints.push(k);
        acousticFreq.push(50 * k);
        opticalFreq.push(200 + 100 * Math.sin(Math.PI * k));
    }
    
    if (typeof Chart !== 'undefined') {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: kPoints.map(k => k.toFixed(2)),
                datasets: [
                    {
                        label: 'Acoustic Branch',
                        data: acousticFreq,
                        borderColor: 'rgba(0, 0, 0, 1)',
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        borderWidth: 2,
                        fill: false
                    },
                    {
                        label: 'Optical Branch',
                        data: opticalFreq,
                        borderColor: 'rgba(0, 102, 204, 1)',
                        backgroundColor: 'rgba(0, 102, 204, 0.1)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { title: { display: true, text: 'Wavevector k (normalized)' }, ticks: { font: { size: 9 } } },
                    y: { title: { display: true, text: 'Frequency (Hz)' }, ticks: { font: { size: 9 } } }
                },
                plugins: { legend: { display: true, labels: { font: { size: 10 } } } }
            }
        });
    } else {
        drawSimplePhononDispersion(ctx, kPoints, acousticFreq, opticalFreq);
    }
}

function drawSimplePhononDispersion(ctx, kPoints, acousticFreq, opticalFreq) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const padding = 40;
    ctx.clearRect(0, 0, width, height);
    
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(padding, padding);
    ctx.stroke();
    
    ctx.beginPath();
    for (let i = 0; i < kPoints.length; i++) {
        const x = padding + (kPoints[i] * (width - 2 * padding));
        const y = height - padding - (acousticFreq[i] / 300 * (height - 2 * padding));
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    ctx.strokeStyle = '#0066cc';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    for (let i = 0; i < kPoints.length; i++) {
        const x = padding + (kPoints[i] * (width - 2 * padding));
        const y = height - padding - (opticalFreq[i] / 300 * (height - 2 * padding));
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.fillStyle = '#000';
    ctx.font = '10pt Times New Roman';
    ctx.fillText('k (normalized)', width / 2 - 30, height - 10);
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Frequency (Hz)', 0, 0);
    ctx.restore();
}
