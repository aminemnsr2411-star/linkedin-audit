const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

exports.handler = async (event, context) => {
  console.log("=== Function called ===");
  console.log("Method:", event.httpMethod);
  console.log("Has API Key:", !!process.env.GOOGLE_AI_API_KEY);
  
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
    console.log("ERROR: Method not POST");
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed. Use POST.' })
    };
  }

  try {
    console.log("=== Parsing multipart data ===");
    
    // Check if content-type exists
    if (!event.headers['content-type']) {
      throw new Error('Missing content-type header');
    }
    
    // Parse multipart form data
    const boundary = event.headers['content-type'].split('boundary=')[1];
    if (!boundary) {
      throw new Error('Missing boundary in content-type');
    }
    
    const parts = parseMultipartFormData(event.body, boundary);
    console.log("Parsed parts:", parts.length);
    
    // Extract files
    const pdfData = parts.find(p => p.name === 'pdf');
    const photoData = parts.find(p => p.name === 'photo');
    const bannerData = parts.find(p => p.name === 'banner');

    console.log("PDF found:", !!pdfData);
    console.log("Photo found:", !!photoData);
    console.log("Banner found:", !!bannerData);

    if (!pdfData || !photoData || !bannerData) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required files',
          details: {
            pdf: !!pdfData,
            photo: !!photoData,
            banner: !!bannerData
          }
        })
      };
    }

    console.log("=== Calling Google AI ===");
    
    // Analyze with Google AI
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Convert images to base64
    const photoBase64 = Buffer.from(photoData.data).toString('base64');
    const bannerBase64 = Buffer.from(bannerData.data).toString('base64');
    
    console.log("Images converted to base64");
    
    // Create prompt for analysis
    const prompt = `Tu es un expert en optimisation de profils LinkedIn. Analyse les images de profil LinkedIn suivantes (photo de profil et bannière) et fournis un audit complet.

Fournis ta réponse au format JSON strict suivant:
{
  "score": 75,
  "categoryScores": {
    "Photo de profil": 80,
    "Bannière": 70,
    "Titre": 75,
    "Résumé": 75,
    "Expériences": 70,
    "Compétences": 80
  },
  "errors": [
    {
      "title": "Photo peu professionnelle",
      "description": "La photo manque de clarté et de professionnalisme"
    }
  ],
  "improvements": [
    {
      "title": "Améliorer la bannière",
      "description": "La bannière devrait refléter votre expertise"
    }
  ],
  "recommendations": [
    {
      "section": "Photo de profil",
      "before": "Photo actuelle",
      "after": "Utilisez une photo professionnelle avec un fond neutre, un sourire naturel et une tenue professionnelle"
    }
  ]
}

Analyse les aspects suivants:
1. Qualité et professionnalisme de la photo de profil
2. Pertinence et impact de la bannière

Sois précis, constructif et fournis des recommandations actionnables.`;

    console.log("Sending request to Google AI...");
    
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

    console.log("Got response from Google AI");
    
    const response = await result.response;
    const text = response.text();
    
    console.log("Response text length:", text.length);
    
    // Extract JSON from response
    let analysisData;
    try {
      analysisData = JSON.parse(text);
    } catch (e) {
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[1]);
      } else {
        const objectMatch = text.match(/\{[\s\S]*\}/);
        if (objectMatch) {
          analysisData = JSON.parse(objectMatch[0]);
        } else {
          throw new Error('Could not parse AI response as JSON');
        }
      }
    }

    console.log("=== Success ===");
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(analysisData)
    };

  } catch (error) {
    console.error('=== ERROR ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Analysis failed', 
        details: error.message,
        stack: error.stack
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
