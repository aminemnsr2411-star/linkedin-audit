const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse multipart form data
    const boundary = event.headers['content-type'].split('boundary=')[1];
    const parts = parseMultipartFormData(event.body, boundary);
    
    // Extract files
    const pdfData = parts.find(p => p.name === 'pdf');
    const photoData = parts.find(p => p.name === 'photo');
    const bannerData = parts.find(p => p.name === 'banner');

    if (!pdfData || !photoData || !bannerData) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required files' })
      };
    }

    // Analyze with Google AI
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Convert images to base64
    const photoBase64 = Buffer.from(photoData.data).toString('base64');
    const bannerBase64 = Buffer.from(bannerData.data).toString('base64');
    
    // Create prompt for analysis
    const prompt = `Tu es un expert en optimisation de profils LinkedIn. Analyse le profil LinkedIn suivant (incluant le PDF du profil, la photo de profil et la bannière) et fournis un audit complet.

Fournis ta réponse au format JSON strict suivant:
{
  "score": <nombre entre 0 et 100>,
  "categoryScores": {
    "Photo de profil": <score>,
    "Bannière": <score>,
    "Titre": <score>,
    "Résumé": <score>,
    "Expériences": <score>,
    "Compétences": <score>
  },
  "errors": [
    {
      "title": "Titre de l'erreur",
      "description": "Description détaillée de l'erreur"
    }
  ],
  "improvements": [
    {
      "title": "Axe d'amélioration",
      "description": "Description de comment améliorer"
    }
  ],
  "recommendations": [
    {
      "section": "Nom de la section",
      "before": "Ce qui est actuellement présent",
      "after": "Recommandation de remplacement complète et détaillée"
    }
  ]
}

Analyse les aspects suivants:
1. Qualité et professionnalisme de la photo de profil
2. Pertinence et impact de la bannière
3. Efficacité du titre professionnel
4. Qualité du résumé/à propos
5. Présentation des expériences
6. Liste des compétences

Sois précis, constructif et fournis des recommandations actionnables. Fournis au moins 3 erreurs, 3 axes d'amélioration et 3 recommandations détaillées.`;

    const result = await model.generateContent([
      {
        inlineData: {
          data: photoBase64,
          mimeType: photoData.contentType
        }
      },
      {
        inlineData: {
          data: bannerBase64,
          mimeType: bannerData.contentType
        }
      },
      prompt
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    let analysisData;
    try {
      // Try to parse as JSON directly
      analysisData = JSON.parse(text);
    } catch (e) {
      // If not valid JSON, try to extract JSON from markdown code blocks
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[1]);
      } else {
        // Last resort: try to find JSON object in text
        const objectMatch = text.match(/\{[\s\S]*\}/);
        if (objectMatch) {
          analysisData = JSON.parse(objectMatch[0]);
        } else {
          throw new Error('Could not parse AI response as JSON');
        }
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(analysisData)
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Analysis failed', 
        details: error.message 
      })
    };
  }
};

// Simple multipart form data parser
function parseMultipartFormData(body, boundary) {
  const parts = [];
  const sections = body.split(`--${boundary}`);

  for (const section of sections) {
    if (section.includes('Content-Disposition')) {
      const nameMatch = section.match(/name="([^"]+)"/);
      const filenameMatch = section.match(/filename="([^"]+)"/);
      const contentTypeMatch = section.match(/Content-Type: ([^\r\n]+)/);
      
      if (nameMatch) {
        const headerEnd = section.indexOf('\r\n\r\n');
        if (headerEnd !== -1) {
          const data = section.slice(headerEnd + 4, section.lastIndexOf('\r\n'));
          
          parts.push({
            name: nameMatch[1],
            filename: filenameMatch ? filenameMatch[1] : null,
            contentType: contentTypeMatch ? contentTypeMatch[1] : 'application/octet-stream',
            data: Buffer.from(data, 'binary')
          });
        }
      }
    }
  }

  return parts;
}
