  1	# LinkedIn Profile Audit - Analyse IA 🚀
     2	
     3	![LinkedIn Audit](https://img.shields.io/badge/LinkedIn-Audit-0077B5?style=for-the-badge&logo=linkedin)
     4	![Google AI](https://img.shields.io/badge/Google-AI-4285F4?style=for-the-badge&logo=google)
     5	![Netlify](https://img.shields.io/badge/Netlify-Serverless-00C7B7?style=for-the-badge&logo=netlify)
     6	
     7	## 📋 Description
     8	
     9	Un outil d'audit de profil LinkedIn propulsé par **Google AI** qui analyse votre profil et fournit des recommandations personnalisées pour améliorer votre visibilité professionnelle.
    10	
    11	### ✨ Fonctionnalités
    12	
    13	- 📄 **Upload de PDF** - Exportez et uploadez votre profil LinkedIn
    14	- 🖼️ **Analyse d'images** - Photo de profil et bannière
    15	- 🤖 **IA Google Gemini** - Analyse intelligente et personnalisée
    16	- 📊 **Score sur 100** - Évaluation globale de votre profil
    17	- 📈 **Diagramme radar** - Scores par catégorie (photo, bannière, titre, résumé, expériences, compétences)
    18	- ⚠️ **Détection d'erreurs** - Identifie les problèmes de votre profil
    19	- 💡 **Axes d'amélioration** - Suggestions constructives
    20	- ✅ **Recommandations** - Propositions de remplacement détaillées
    21	- 🎨 **Design moderne** - Interface minimaliste (noir, vert #00ff48, bleu ciel)
    22	
    23	---
    24	
    25	## 🚀 Déploiement sur Netlify (GRATUIT)
    26	
    27	### Étape 1 : Prérequis
    28	
    29	1. Un compte [Netlify](https://www.netlify.com/) (gratuit)
    30	2. Un compte [Google AI Studio](https://makersuite.google.com/app/apikey) pour la clé API
    31	3. Git installé sur votre machine
    32	
    33	### Étape 2 : Préparation du projet
    34	
    35	1. **Créez un dépôt GitHub** :
    36	   ```bash
    37	   git init
    38	   git add .
    39	   git commit -m "Initial commit: LinkedIn Audit Tool"
    40	   git branch -M main
    41	   git remote add origin https://github.com/VOTRE_USERNAME/linkedin-audit.git
    42	   git push -u origin main
    43	   ```
    44	
    45	### Étape 3 : Déploiement sur Netlify
    46	
    47	#### Option A : Via l'interface Netlify (Recommandé)
    48	
    49	1. Connectez-vous à [Netlify](https://app.netlify.com/)
    50	2. Cliquez sur **"Add new site"** → **"Import an existing project"**
    51	3. Choisissez **GitHub** et sélectionnez votre dépôt
    52	4. Configuration du build :
    53	   - **Build command** : `npm install`
    54	   - **Publish directory** : `.`
    55	   - **Functions directory** : `netlify/functions`
    56	5. Cliquez sur **"Deploy site"**
    57	
    58	#### Option B : Via Netlify CLI
    59	
    60	```bash
    61	# Installer Netlify CLI
    62	npm install -g netlify-cli
    63	
    64	# Se connecter à Netlify
    65	netlify login
    66	
    67	# Initialiser le projet
    68	netlify init
    69	
    70	# Déployer
    71	netlify deploy --prod
    72	```
    73	
    74	### Étape 4 : Configuration de la clé API Google
    75	
    76	1. Dans votre dashboard Netlify, allez dans **"Site settings"** → **"Environment variables"**
    77	2. Cliquez sur **"Add a variable"**
    78	3. Ajoutez :
    79	   - **Key** : `GOOGLE_AI_API_KEY`
    80	   - **Value** : `VOTRE_CLÉ_API_GOOGLE``
    81	4. Cliquez sur **"Save"**
    82	5. **Redéployez le site** pour appliquer les changements
    83	
    84	### Étape 5 : Vérification
    85	
    86	1. Votre site sera accessible via l'URL : `https://votre-site.netlify.app`
    87	2. Testez l'upload de fichiers et l'audit
    88	
    89	---
    90	
    91	## 🛠️ Développement Local
    92	
    93	### Installation
    94	
    95	```bash
    96	# Installer les dépendances
    97	npm install
    98	
    99	# Créer le fichier .env
   100	cp .env.example .env
