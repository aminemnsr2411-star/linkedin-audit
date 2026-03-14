// File upload management
let uploadedFiles = {
    pdf: null,
    photo: null,
    banner: null
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeUploads();
    setupAuditButton();
});

// Initialize file upload handlers
function initializeUploads() {
    // PDF Upload
    const pdfInput = document.getElementById('pdfInput');
    const pdfPreview = document.getElementById('pdfPreview');
    
    pdfInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            uploadedFiles.pdf = file;
            showFilePreview(pdfPreview, file.name, 'fa-file-pdf');
            document.querySelector('#pdfInput').closest('.upload-card').classList.add('uploaded');
            checkAllFilesUploaded();
        }
    });

    // Photo Upload
    const photoInput = document.getElementById('photoInput');
    const photoPreview = document.getElementById('photoPreview');
    
    photoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            uploadedFiles.photo = file;
            showImagePreview(photoPreview, file);
            document.querySelector('#photoInput').closest('.upload-card').classList.add('uploaded');
            checkAllFilesUploaded();
        }
    });

    // Banner Upload
    const bannerInput = document.getElementById('bannerInput');
    const bannerPreview = document.getElementById('bannerPreview');
    
    bannerInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            uploadedFiles.banner = file;
            showImagePreview(bannerPreview, file);
            document.querySelector('#bannerInput').closest('.upload-card').classList.add('uploaded');
            checkAllFilesUploaded();
        }
    });
}

// Show file preview
function showFilePreview(previewElement, fileName, iconClass) {
    previewElement.innerHTML = `
        <i class="fas ${iconClass}"></i>
        <span>${fileName}</span>
    `;
    previewElement.classList.add('active');
}

// Show image preview
function showImagePreview(previewElement, file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        previewElement.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${file.name}</span>
            <img src="${e.target.result}" alt="Preview">
        `;
        previewElement.classList.add('active');
    };
    reader.readAsDataURL(file);
}

// Check if all files are uploaded
function checkAllFilesUploaded() {
    const auditBtn = document.getElementById('auditBtn');
    const auditInfo = document.querySelector('.audit-info');
    
    if (uploadedFiles.pdf && uploadedFiles.photo && uploadedFiles.banner) {
        auditBtn.disabled = false;
        auditBtn.innerHTML = '<i class="fas fa-chart-line"></i> LANCER L\'AUDIT';
        auditInfo.textContent = 'Prêt pour l\'analyse !';
        auditInfo.style.color = 'var(--green)';
    }
}

// Setup audit button
function setupAuditButton() {
    const auditBtn = document.getElementById('auditBtn');
    
    auditBtn.addEventListener('click', async function() {
        if (!uploadedFiles.pdf || !uploadedFiles.photo || !uploadedFiles.banner) {
            return;
        }
        
        // Show loading state
        document.querySelector('.upload-section').style.display = 'none';
        document.querySelector('.audit-section').style.display = 'none';
        document.getElementById('loadingState').style.display = 'block';
        
        try {
            // Call the serverless function
            const result = await analyzeProfile(uploadedFiles.pdf, uploadedFiles.photo, uploadedFiles.banner);
            
            // Hide loading state
            document.getElementById('loadingState').style.display = 'none';
            
            // Display results
            displayResults(result);
        } catch (error) {
            console.error('Error during analysis:', error);
            document.getElementById('loadingState').style.display = 'none';
            alert('Une erreur est survenue lors de l\'analyse. Veuillez réessayer.');
        }
    });
}

// Analyze profile using serverless function
async function analyzeProfile(pdfFile, photoFile, bannerFile) {
    const formData = new FormData();
    formData.append('pdf', pdfFile);
    formData.append('photo', photoFile);
    formData.append('banner', bannerFile);
    
    const response = await fetch('/.netlify/functions/analyze-profile', {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) {
        throw new Error('Analysis failed');
    }
    
    return await response.json();
}

// Display analysis results
function displayResults(data) {
    const resultsSection = document.getElementById('resultsSection');
    
    resultsSection.innerHTML = `
        <div class="results-header">
            <h2>📊 Résultats de l'Audit LinkedIn</h2>
            <p style="color: var(--text-gray); font-size: 1.1rem;">Analyse générée par Google AI</p>
        </div>
        
        <!-- Score Card -->
        <div class="score-card">
            <div class="score-value">${data.score}/100</div>
            <div class="score-label">Score Global de votre Profil</div>
        </div>
        
        <!-- Diagram Section -->
        <div class="diagram-section">
            <h3><i class="fas fa-chart-radar"></i> Analyse par Catégorie</h3>
            <div class="chart-container">
                <canvas id="radarChart"></canvas>
            </div>
        </div>
        
        <!-- Analysis Grid -->
        <div class="analysis-grid">
            <!-- Errors -->
            <div class="analysis-card">
                <h3><i class="fas fa-exclamation-triangle"></i> Erreurs Détectées</h3>
                ${data.errors.map(error => `
                    <div class="analysis-item error-item">
                        <h4>${error.title}</h4>
                        <p>${error.description}</p>
                    </div>
                `).join('')}
            </div>
            
            <!-- Improvements -->
            <div class="analysis-card">
                <h3><i class="fas fa-arrow-up"></i> Axes d'Amélioration</h3>
                ${data.improvements.map(improvement => `
                    <div class="analysis-item improvement-item">
                        <h4>${improvement.title}</h4>
                        <p>${improvement.description}</p>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <!-- Recommendations Section -->
        <div class="recommendations-section">
            <h3><i class="fas fa-lightbulb"></i> Recommandations Personnalisées</h3>
            ${data.recommendations.map(rec => `
                <div class="recommendation-card">
                    <h4>${rec.section}</h4>
                    <div class="recommendation-before">
                        <strong>❌ Actuel :</strong>
                        <p>${rec.before}</p>
                    </div>
                    <div class="recommendation-after">
                        <strong>✅ Recommandation :</strong>
                        <p>${rec.after}</p>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <!-- Action Buttons -->
        <div style="text-align: center; margin-top: 3rem;">
            <button onclick="window.print()" class="upload-btn" style="margin-right: 1rem;">
                <i class="fas fa-print"></i> Imprimer le Rapport
            </button>
            <button onclick="location.reload()" class="upload-btn" style="background: var(--sky-blue);">
                <i class="fas fa-redo"></i> Nouvelle Analyse
            </button>
        </div>
    `;
    
    resultsSection.style.display = 'block';
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
    
    // Create radar chart
    createRadarChart(data.categoryScores);
}

// Create radar chart with Chart.js
function createRadarChart(categoryScores) {
    // Load Chart.js dynamically if not already loaded
    if (typeof Chart === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => {
            renderRadarChart(categoryScores);
        };
        document.head.appendChild(script);
    } else {
        renderRadarChart(categoryScores);
    }
}

function renderRadarChart(categoryScores) {
    const ctx = document.getElementById('radarChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: Object.keys(categoryScores),
            datasets: [{
                label: 'Score par Catégorie',
                data: Object.values(categoryScores),
                backgroundColor: 'rgba(0, 255, 72, 0.2)',
                borderColor: '#00ff48',
                borderWidth: 3,
                pointBackgroundColor: '#00ff48',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#00ff48',
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20,
                        color: '#b0b0b0',
                        backdropColor: 'transparent'
                    },
                    grid: {
                        color: '#2a2a2a'
                    },
                    pointLabels: {
                        color: '#00ff48',
                        font: {
                            size: 14,
                            weight: '600'
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#1a1a1a',
                    titleColor: '#00ff48',
                    bodyColor: '#ffffff',
                    borderColor: '#00ff48',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false
                }
            }
        }
    });
}
