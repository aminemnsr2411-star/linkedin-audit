 1	const { GoogleGenerativeAI } = require("@google/generative-ai");
     2	
     3	// Initialize Google AI
     4	const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
     5	
     6	exports.handler = async (event, context) => {
     7	  // CORS headers
     8	  const headers = {
     9	    'Access-Control-Allow-Origin': '*',
    10	    'Access-Control-Allow-Headers': 'Content-Type',
    11	    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    12	  };
    13	
    14	  // Handle preflight requests
    15	  if (event.httpMethod === 'OPTIONS') {
    16	    return {
    17	      statusCode: 200,
    18	      headers,
    19	      body: ''
    20	    };
    21	  }
    22	
    23	  // Only allow POST requests
    24	  if (event.httpMethod !== 'POST') {
    25	    return {
    26	      statusCode: 405,
    27	      headers,
    28	      body: JSON.stringify({ error: 'Method not allowed' })
    29	    };
    30	  }
    31	
    32	  try {
    33	    // Parse multipart form data
    34	    const boundary = event.headers['content-type'].split('boundary=')[1];
    35	    const parts = parseMultipartFormData(event.body, boundary);
    36	    
    37	    // Extract files
    38	    const pdfData = parts.find(p => p.name === 'pdf');
    39	    const photoData = parts.find(p => p.name === 'photo');
    40	    const bannerData = parts.find(p => p.name === 'banner');
    41	
    42	    if (!pdfData || !photoData || !bannerData) {
    43	      return {
    44	        statusCode: 400,
    45	        headers,
    46	        body: JSON.stringify({ error: 'Missing required files' })
    47	      };
    48	    }
    49	
    50	    // Analyze with Google AI
    51	    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    52	
    53	    // Convert images to base64
    54	    const photoBase64 = Buffer.from(photoData.data).toString('base64');
    55	    const bannerBase64 = Buffer.from(bannerData.data).toString('base64');
    56	    
    57	    // Create prompt for analysis
    58	    const prompt = `Tu es un expert en optimisation de profils LinkedIn. Analyse le profil LinkedIn suivant (incluant le PDF du profil, la photo de profil et la bannière) et fournis un audit complet.
    59	
    60	Fournis ta réponse au format JSON strict suivant:
    61	{
    62	  "score": <nombre entre 0 et 100>,
    63	  "categoryScores": {
    64	    "Photo de profil": <score>,
    65	    "Bannière": <score>,
    66	    "Titre": <score>,
    67	    "Résumé": <score>,
    68	    "Expériences": <score>,
    69	    "Compétences": <score>
    70	  },
    71	  "errors": [
    72	    {
    73	      "title": "Titre de l'erreur",
    74	      "description": "Description détaillée de l'erreur"
    75	    }
    76	  ],
    77	  "improvements": [
    78	    {
    79	      "title": "Axe d'amélioration",
    80	      "description": "Description de comment améliorer"
    81	    }
    82	  ],
    83	  "recommendations": [
    84	    {
    85	      "section": "Nom de la section",
    86	      "before": "Ce qui est actuellement présent",
    87	      "after": "Recommandation de remplacement complète et détaillée"
    88	    }
    89	  ]
    90	}
    91	
    92	Analyse les aspects suivants:
    93	1. Qualité et professionnalisme de la photo de profil
    94	2. Pertinence et impact de la bannière
    95	3. Efficacité du titre professionnel
    96	4. Qualité du résumé/à propos
    97	5. Présentation des expériences
    98	6. Liste des compétences
    99	
   100	Sois précis, constructif et fournis des recommandations actionnables. Fournis au moins 3 erreurs, 3 axes d'amélioration et 3 recommandations détaillées.`;
   101	
   102	    const result = await model.generateContent([
   103	      {
   104	        inlineData: {
   105	          data: photoBase64,
   106	          mimeType: photoData.contentType
   107	        }
   108	      },
   109	      {
   110	        inlineData: {
   111	          data: bannerBase64,
   112	          mimeType: bannerData.contentType
   113	        }
   114	      },
   115	      prompt
   116	    ]);
   117	
   118	    const response = await result.response;
   119	    const text = response.text();
   120	    
   121	    // Extract JSON from response
   122	    let analysisData;
   123	    try {
   124	      // Try to parse as JSON directly
   125	      analysisData = JSON.parse(text);
   126	    } catch (e) {
   127	      // If not valid JSON, try to extract JSON from markdown code blocks
   128	      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/);
   129	      if (jsonMatch) {
   130	        analysisData = JSON.parse(jsonMatch[1]);
   131	      } else {
   132	        // Last resort: try to find JSON object in text
   133	        const objectMatch = text.match(/\{[\s\S]*\}/);
   134	        if (objectMatch) {
   135	          analysisData = JSON.parse(objectMatch[0]);
   136	        } else {
   137	          throw new Error('Could not parse AI response as JSON');
   138	        }
   139	      }
   140	    }
   141	
   142	    return {
   143	      statusCode: 200,
   144	      headers,
   145	      body: JSON.stringify(analysisData)
   146	    };
   147	
   148	  } catch (error) {
   149	    console.error('Error:', error);
   150	    return {
   151	      statusCode: 500,
   152	      headers,
   153	      body: JSON.stringify({ 
   154	        error: 'Analysis failed', 
   155	        details: error.message 
   156	      })
   157	    };
   158	  }
   159	};
   160	
   161	// Simple multipart form data parser
   162	function parseMultipartFormData(body, boundary) {
   163	  const parts = [];
   164	  const sections = body.split(`--${boundary}`);
   165	
   166	  for (const section of sections) {
   167	    if (section.includes('Content-Disposition')) {
   168	      const nameMatch = section.match(/name="([^"]+)"/);
   169	      const filenameMatch = section.match(/filename="([^"]+)"/);
   170	      const contentTypeMatch = section.match(/Content-Type: ([^\r\n]+)/);
   171	      
   172	      if (nameMatch) {
   173	        const headerEnd = section.indexOf('\r\n\r\n');
   174	        if (headerEnd !== -1) {
   175	          const data = section.slice(headerEnd + 4, section.lastIndexOf('\r\n'));
   176	          
   177	          parts.push({
   178	            name: nameMatch[1],
   179	            filename: filenameMatch ? filenameMatch[1] : null,
   180	            contentType: contentTypeMatch ? contentTypeMatch[1] : 'application/octet-stream',
   181	            data: Buffer.from(data, 'binary')
   182	          });
   183	        }
   184	      }
   185	    }
   186	  }
   187	
   188	  return parts;
   189	}
   190	