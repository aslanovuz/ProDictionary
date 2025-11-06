// Dictionary data structure
// This will be populated with words from Oxford API and PDF source

const dictionaryData = {
    engToUzb: {
        // Sample data - will be extended with PDF words and Oxford API
        "hello": {
            word: "hello",
            type: "interjection",
            translation: "salom",
            examples: [
                "Hello, how are you?",
                "She said hello to everyone",
                "Hello there, nice to meet you"
            ]
        },
        "book": {
            word: "book",
            type: "noun",
            translation: "kitob",
            examples: [
                "I read a book yesterday",
                "This is my favorite book",
                "She bought a new book"
            ]
        },
        "write": {
            word: "write",
            type: "verb",
            translation: "yozmoq",
            examples: [
                "I write in my journal every day",
                "Can you write your name here?",
                "He writes beautiful poetry"
            ]
        },
        "beautiful": {
            word: "beautiful",
            type: "adjective",
            translation: "go'zal, chiroyli",
            examples: [
                "What a beautiful day!",
                "She has a beautiful smile",
                "The sunset is beautiful tonight"
            ]
        },
        "quickly": {
            word: "quickly",
            type: "adverb",
            translation: "tez, shoshilinch",
            examples: [
                "He ran quickly to catch the bus",
                "Please respond quickly",
                "Time passes quickly when you're having fun"
            ]
        },
        "water": {
            word: "water",
            type: "noun",
            translation: "suv",
            examples: [
                "I need a glass of water",
                "Water is essential for life",
                "The water in the lake is cold"
            ]
        },
        "good": {
            word: "good",
            type: "adjective",
            translation: "yaxshi",
            examples: [
                "That's a good idea",
                "Have a good day",
                "This food tastes good"
            ]
        },
        "house": {
            word: "house",
            type: "noun",
            translation: "uy",
            examples: [
                "They bought a new house",
                "My house is near the park",
                "The house has three bedrooms"
            ]
        }
    },
    uzbToEng: {
        // Reverse dictionary
        "salom": {
            word: "salom",
            type: "interjection",
            translation: "hello",
            examples: [
                "Salom, qalaysiz?",
                "U hammaga salom aytdi",
                "Salom, tanishganimdan xursandman"
            ]
        },
        "kitob": {
            word: "kitob",
            type: "noun",
            translation: "book",
            examples: [
                "Men kecha kitob o'qidim",
                "Bu mening sevimli kitobim",
                "U yangi kitob sotib oldi"
            ]
        },
        "yozmoq": {
            word: "yozmoq",
            type: "verb",
            translation: "write",
            examples: [
                "Men har kuni daftarimga yozaman",
                "Ismingizni bu yerga yoza olasizmi?",
                "U go'zal she'rlar yozadi"
            ]
        },
        "go'zal": {
            word: "go'zal",
            type: "adjective",
            translation: "beautiful",
            examples: [
                "Qanday go'zal kun!",
                "Uning tabassumi go'zal",
                "Bugun quyosh botishi go'zal"
            ]
        },
        "tez": {
            word: "tez",
            type: "adverb",
            translation: "quickly",
            examples: [
                "U avtobusga yetish uchun tez yugurdi",
                "Iltimos, tez javob bering",
                "Zavqlanayotganingizda vaqt tez o'tadi"
            ]
        },
        "suv": {
            word: "suv",
            type: "noun",
            translation: "water",
            examples: [
                "Menga bir stakan suv kerak",
                "Suv hayot uchun zarur",
                "Ko'ldagi suv sovuq"
            ]
        },
        "yaxshi": {
            word: "yaxshi",
            type: "adjective",
            translation: "good",
            examples: [
                "Bu yaxshi fikr",
                "Kuningiz yaxshi o'tsin",
                "Bu taom mazasi yaxshi"
            ]
        },
        "uy": {
            word: "uy",
            type: "noun",
            translation: "house",
            examples: [
                "Ular yangi uy sotib olishdi",
                "Mening uyim park yaqinida",
                "Uyda uchta yotoq xona bor"
            ]
        }
    }
};

// PDF words will be stored here
// Structure for PDF words from your uploaded document
const pdfWords = {
    engToUzb: {
        // Words will be added as you provide PDF pages
        // Example structure:
        // "word": {
        //     word: "word",
        //     type: "noun/verb/adjective/etc",
        //     translation: "uzbek_translation",
        //     examples: ["example1", "example2", "example3"],
        //     source: "pdf"
        // }
    },
    uzbToEng: {
        // Reverse translations from PDF
    }
};

// Function to merge PDF words into main dictionary
function mergePdfWords() {
    Object.assign(dictionaryData.engToUzb, pdfWords.engToUzb);
    Object.assign(dictionaryData.uzbToEng, pdfWords.uzbToEng);
}

// MyMemory Translation API (Free, no key needed)
async function fetchFromMyMemory(word, fromLang = 'en', toLang = 'uz') {
    try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=${fromLang}|${toLang}`;
        const response = await fetch(url);
        
        if (!response.ok) return null;
        
        const data = await response.json();
        
        if (data.responseStatus !== 200) return null;
        
        // Get main translation
        let translation = data.responseData.translatedText;
        
        // If quality is low or result looks wrong, try to find better match
        if (data.matches && data.matches.length > 0) {
            // Find best quality match
            const bestMatch = data.matches.find(m => 
                m.quality && parseInt(m.quality) > 70 && 
                m.translation.toLowerCase() !== 'c/dictation' // Filter bad translations
            );
            
            if (bestMatch) {
                translation = bestMatch.translation;
            }
        }
        
        return {
            word: word,
            translation: translation,
            confidence: data.responseData.match // 0-1 score
        };
    } catch (error) {
        console.error('MyMemory API error:', error);
        return null;
    }
}

// Gemini API integration for enhanced definitions (Backup)
async function fetchFromGemini(word, sourceLanguage = 'english', targetLanguage = 'uzbek') {
    const apiKey = 'AIzaSyDeNh_1Li8C6fqqMGcvhhHuOsHTRR9R2w8';
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
    
    const prompt = `Dictionary translation for "${word}" from ${sourceLanguage} to ${targetLanguage}. Response as JSON only:
{
  "word": "${word}",
  "type": "noun/verb/adjective/adverb/preposition",
  "pronunciation": "IPA",
  "translation": "main ${targetLanguage} translation",
  "alternativeTranslations": ["alt1", "alt2"],
  "definition": "concise definition",
  "examples": [
    {"sentence": "Example 1", "translation": "${targetLanguage} translation", "highlight": "${word}", "explanation": "usage note"},
    {"sentence": "Example 2", "translation": "${targetLanguage} translation", "highlight": "${word}", "explanation": "usage note"},
    {"sentence": "Example 3", "translation": "${targetLanguage} translation", "highlight": "${word}", "explanation": "usage note"}
  ],
  "synonyms": ["syn1", "syn2"],
  "commonPhrases": [{"phrase": "phrase1", "meaning": "meaning1"}]
}
Be concise. JSON only, no markdown.`;

    try {
        const response = await fetch(`${apiUrl}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            console.error('Gemini API error:', response.status);
            return null;
        }

        const data = await response.json();
        const textResponse = data.candidates[0]?.content?.parts[0]?.text;
        
        if (!textResponse) return null;

        // Extract JSON from response (handle markdown code blocks)
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return null;

        const parsedData = JSON.parse(jsonMatch[0]);
        return parsedData;
    } catch (error) {
        console.error('Gemini API error:', error);
        return null;
    }
}

// Oxford API integration
async function fetchFromOxford(word) {
    // Free Oxford API (no key needed, but limited)
    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
        
        if (!response.ok) return null;
        
        const data = await response.json();
        return parseOxfordData(data, word);
    } catch (error) {
        console.error('Oxford API error:', error);
        return null;
    }
}

// Helper function to parse Oxford API response
function parseOxfordData(data, word) {
    if (!data || !data[0]) return null;
    
    const entry = data[0];
    const meaning = entry.meanings?.[0];
    const definition = meaning?.definitions?.[0];
    
    if (!definition) return null;
    
    return {
        word: word,
        type: meaning.partOfSpeech || 'word',
        pronunciation: entry.phonetic || '',
        translation: definition.definition || '',
        definition: definition.definition || '',
        examples: [
            { 
                sentence: definition.example || `This is an example with ${word}.`,
                highlight: word,
                explanation: 'Common usage'
            },
            { 
                sentence: meaning.definitions?.[1]?.example || `Another example using ${word}.`,
                highlight: word,
                explanation: 'Alternative context'
            },
            { 
                sentence: meaning.definitions?.[2]?.example || `${word} can be used this way.`,
                highlight: word,
                explanation: 'Additional usage'
            }
        ],
        synonyms: definition.synonyms?.slice(0, 5) || [],
        alternativeTranslations: definition.synonyms?.slice(0, 3) || []
    };
}

// Initialize - merge PDF words on load
mergePdfWords();
