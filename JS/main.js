     1	// File upload management
     2	let uploadedFiles = {
     3	    pdf: null,
     4	    photo: null,
     5	    banner: null
     6	};
     7	
     8	// Initialize the application
     9	document.addEventListener('DOMContentLoaded', function() {
    10	    initializeUploads();
    11	    setupAuditButton();
    12	});
    13	
    14	// Initialize file upload handlers
    15	function initializeUploads() {
    16	    // PDF Upload
    17	    const pdfInput = document.getElementById('pdfInput');
    18	    const pdfPreview = document.getElementById('pdfPreview');
    19	    
    20	    pdfInput.addEventListener('change', function(e) {
    21	        const file = e.target.files[0];
    22	        if (file && file.type === 'application/pdf') {
    23	            uploadedFiles.pdf = file;
    24	            showFilePreview(pdfPreview, file.name, 'fa-file-pdf');
    25	            document.querySelector('#pdfInput').closest('.upload-card').classList.add('uploaded');
    26	            checkAllFilesUploaded();
    27	        }
    28	    });
    29	
    30	    // Photo Upload
    31	    const photoInput = document.getElementById('photoInput');
    32	    const photoPreview = document.getElementById('photoPreview');
    33	    
    34	    photoInput.addEventListener('change', function(e) {
    35	        const file = e.target.files[0];
    36	        if (file && file.type.startsWith('image/')) {
    37	            uploadedFiles.photo = file;
    38	            showImagePreview(photoPreview, file);
    39	            document.querySelector('#photoInput').closest('.upload-card').classList.add('uploaded');
    40	            checkAllFilesUploaded();
    41	        }
    42	    });
    43	
    44	    // Banner Upload
    45	    const bannerInput = document.getElementById('bannerInput');
    46	    const bannerPreview = document.getElementById('bannerPreview');
    47	    
    48	    bannerInput.addEventListener('change', function(e) {
    49	        const file = e.target.files[0];
    50	        if (file && file.type.startsWith('image/')) {
    51	            uploadedFiles.banner = file;
    52	            showImagePreview(bannerPreview, file);
    53	            document.querySelector('#bannerInput').closest('.upload-card').classList.add('uploaded');
    54	            checkAllFilesUploaded();
    55	        }
    56	    });
    57	}
    58	
    59	// Show file preview
    60	function showFilePreview(previewElement, fileName, iconClass) {
    61	    previewElement.innerHTML = `
    62	        <i class="fas ${iconClass}"></i>
    63	        <span>${fileName}</span>
    64	    `;
    65	    previewElement.classList.add('active');
    66	}
    67	
    68	// Show image preview
    69	function showImagePreview(previewElement, file) {
    70	    const reader = new FileReader();
    71	    reader.onload = function(e) {
    72	        previewElement.innerHTML = `
    73	            <i class="fas fa-check-circle"></i>
    74	            <span>${file.name}</span>
    75	            <img src="${e.target.result}" alt="Preview">
    76	        `;
    77	        previewElement.classList.add('active');
    78	    };
    79	    reader.readAsDataURL(file);
    80	}
    81	
    82	// Check if all files are uploaded
    83	function checkAllFilesUploaded() {
    84	    const auditBtn = document.getElementById('auditBtn');
    85	    const auditInfo = document.querySelector('.audit-info');
    86	    
    87	    if (uploadedFiles.pdf && uploadedFiles.photo && uploadedFiles.banner) {
    88	        auditBtn.disabled = false;
    89	        auditBtn.innerHTML = '<i class="fas fa-chart-line"></i> LANCER L\'AUDIT';
    90	        auditInfo.textContent = 'Prêt pour l\'analyse !';
    91	        auditInfo.style.color = 'var(--green)';
    92	    }
    93	}
    94	
    95	// Setup audit button
    96	function setupAuditButton() {
    97	    const auditBtn = document.getElementById('auditBtn');
    98	    
    99	    auditBtn.addEventListener('click', async function() {
   100	        if (!uploadedFiles.pdf || !uploadedFiles.photo || !uploadedFiles.banner) {
   101	            return;
   102	        }
   103	        
   104	        // Show loading state
   105	        document.querySelector('.upload-section').style.display = 'none';
   106	        document.querySelector('.audit-section').style.display = 'none';
   107	        document.getElementById('loadingState').style.display = 'block';
   108	        
   109	        try {
   110	            // Call the serverless function
   111	            const result = await analyzeProfile(uploadedFiles.pdf, uploadedFiles.photo, uploadedFiles.banner);
   112	            
   113	            // Hide loading state
   114	            document.getElementById('loadingState').style.display = 'none';
   115	            
   116	            // Display results
   117	            displayResults(result);
   118	        } catch (error) {
   119	            console.error('Error during analysis:', error);
   120	            document.getElementById('loadingState').style.display = 'none';
   121	            alert('Une erreur est survenue lors de l\'analyse. Veuillez réessayer.');
   122	        }
   123	    });
   124	}
   125	
   126	// Analyze profile using serverless function
   127	async function analyzeProfile(pdfFile, photoFile, bannerFile) {
   128	    const formData = new FormData();
   129	    formData.append('pdf', pdfFile);
   130	    formData.append('photo', photoFile);
   131	    formData.append('banner', bannerFile);
   132	    
   133	    const response = await fetch('/.netlify/functions/analyze-profile', {
   134	        method: 'POST',
   135	        body: formData
   136	    });
   137	    
   138	    if (!response.ok) {
   139	        throw new Error('Analysis failed');
   140	    }
   141	    
   142	    return await response.json();
   143	}
   144	
   145	// Display analysis results
   146	function displayResults(data) {
   147	    const resultsSection = document.getElementById('resultsSection');
   148	    
   149	    resultsSection.innerHTML = `
   150	        <div class="results-header">
   151	            <h2>📊 Résultats de l'Audit LinkedIn</h2>
   152	            <p style="color: var(--text-gray); font-size: 1.1rem;">Analyse générée par Google AI</p>
   153	        </div>
   154	        
   155	        <!-- Score Card -->
   156	        <div class="score-card">
   157	            <div class="score-value">${data.score}/100</div>
   158	            <div class="score-label">Score Global de votre Profil</div>
   159	        </div>
   160	        
   161	        <!-- Diagram Section -->
   162	        <div class="diagram-section">
   163	            <h3><i class="fas fa-chart-radar"></i> Analyse par Catégorie</h3>
   164	            <div class="chart-container">
   165	                <canvas id="radarChart"></canvas>
   166	            </div>
   167	        </div>
   168	        
   169	        <!-- Analysis Grid -->
   170	        <div class="analysis-grid">
   171	            <!-- Errors -->
   172	            <div class="analysis-card">
   173	                <h3><i class="fas fa-exclamation-triangle"></i> Erreurs Détectées</h3>
   174	                ${data.errors.map(error => `
   175	                    <div class="analysis-item error-item">
   176	                        <h4>${error.title}</h4>
   177	                        <p>${error.description}</p>
   178	                    </div>
   179	                `).join('')}
   180	            </div>
   181	            
   182	            <!-- Improvements -->
   183	            <div class="analysis-card">
   184	                <h3><i class="fas fa-arrow-up"></i> Axes d'Amélioration</h3>
   185	                ${data.improvements.map(improvement => `
   186	                    <div class="analysis-item improvement-item">
   187	                        <h4>${improvement.title}</h4>
   188	                        <p>${improvement.description}</p>
   189	                    </div>
   190	                `).join('')}
   191	            </div>
   192	        </div>
   193	        
   194	        <!-- Recommendations Section -->
   195	        <div class="recommendations-section">
   196	            <h3><i class="fas fa-lightbulb"></i> Recommandations Personnalisées</h3>
   197	            ${data.recommendations.map(rec => `
   198	                <div class="recommendation-card">
   199	                    <h4>${rec.section}</h4>
   200	                    <div class="recommendation-before">
   201	                        <strong>❌ Actuel :</strong>
   202	                        <p>${rec.before}</p>
   203	                    </div>
   204	                    <div class="recommendation-after">
   205	                        <strong>✅ Recommandation :</strong>
   206	                        <p>${rec.after}</p>
   207	                    </div>
   208	                </div>
   209	            `).join('')}
   210	        </div>
   211	        
   212	        <!-- Action Buttons -->
   213	        <div style="text-align: center; margin-top: 3rem;">
   214	            <button onclick="window.print()" class="upload-btn" style="margin-right: 1rem;">
   215	                <i class="fas fa-print"></i> Imprimer le Rapport
   216	            </button>
   217	            <button onclick="location.reload()" class="upload-btn" style="background: var(--sky-blue);">
   218	                <i class="fas fa-redo"></i> Nouvelle Analyse
   219	            </button>
   220	        </div>
   221	    `;
   222	    
   223	    resultsSection.style.display = 'block';
   224	    
   225	    // Scroll to results
   226	    resultsSection.scrollIntoView({ behavior: 'smooth' });
   227	    
   228	    // Create radar chart
   229	    createRadarChart(data.categoryScores);
   230	}
   231	
   232	// Create radar chart with Chart.js
   233	function createRadarChart(categoryScores) {
   234	    // Load Chart.js dynamically if not already loaded
   235	    if (typeof Chart === 'undefined') {
   236	        const script = document.createElement('script');
   237	        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
   238	        script.onload = () => {
   239	            renderRadarChart(categoryScores);
   240	        };
   241	        document.head.appendChild(script);
   242	    } else {
   243	        renderRadarChart(categoryScores);
   244	    }
   245	}
   246	
   247	function renderRadarChart(categoryScores) {
   248	    const ctx = document.getElementById('radarChart').getContext('2d');
   249	    
   250	    new Chart(ctx, {
   251	        type: 'radar',
   252	        data: {
   253	            labels: Object.keys(categoryScores),
   254	            datasets: [{
   255	                label: 'Score par Catégorie',
   256	                data: Object.values(categoryScores),
   257	                backgroundColor: 'rgba(0, 255, 72, 0.2)',
   258	                borderColor: '#00ff48',
   259	                borderWidth: 3,
   260	                pointBackgroundColor: '#00ff48',
   261	                pointBorderColor: '#fff',
   262	                pointHoverBackgroundColor: '#fff',
   263	                pointHoverBorderColor: '#00ff48',
   264	                pointRadius: 5,
   265	                pointHoverRadius: 7
   266	            }]
   267	        },
   268	        options: {
   269	            responsive: true,
   270	            maintainAspectRatio: true,
   271	            scales: {
   272	                r: {
   273	                    beginAtZero: true,
   274	                    max: 100,
   275	                    ticks: {
   276	                        stepSize: 20,
   277	                        color: '#b0b0b0',
   278	                        backdropColor: 'transparent'
   279	                    },
   280	                    grid: {
   281	                        color: '#2a2a2a'
   282	                    },
   283	                    pointLabels: {
   284	                        color: '#00ff48',
   285	                        font: {
   286	                            size: 14,
   287	                            weight: '600'
   288	                        }
   289	                    }
   290	                }
   291	            },
   292	            plugins: {
   293	                legend: {
   294	                    display: false
   295	                },
   296	                tooltip: {
   297	                    backgroundColor: '#1a1a1a',
   298	                    titleColor: '#00ff48',
   299	                    bodyColor: '#ffffff',
   300	                    borderColor: '#00ff48',
   301	                    borderWidth: 1,
   302	                    padding: 12,
   303	                    displayColors: false
   304	                }
   305	            }
   306	        }
   307	    });
   308	}
   309	