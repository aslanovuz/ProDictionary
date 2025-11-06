// PDF Word Processor Helper
// This file helps you quickly add words from PDF pages

// Template for adding words
const wordTemplate = {
    word: "",
    type: "", // noun, verb, adjective, adverb, preposition, conjunction, interjection
    translation: "",
    examples: [
        "",
        "",
        ""
    ],
    isEngToUzb: true
};

// Example batch from PDF page
const exampleBatch = [
    {
        word: "abandon",
        type: "verb",
        translation: "tashlab ketmoq, qo'yib yubormoq",
        examples: [
            "Don't abandon your responsibilities",
            "They had to abandon the old building",
            "Never abandon hope in difficult times"
        ],
        isEngToUzb: true
    },
    {
        word: "ability",
        type: "noun",
        translation: "qobiliyat, layoqat",
        examples: [
            "She has great ability in mathematics",
            "His leadership abilities are impressive",
            "Everyone has unique abilities"
        ],
        isEngToUzb: true
    },
    {
        word: "able",
        type: "adjective",
        translation: "qodir, layoqatli",
        examples: [
            "He is able to solve complex problems",
            "Are you able to attend the meeting?",
            "She was able to finish on time"
        ],
        isEngToUzb: true
    }
];

// Function to convert batch to importable format
function generateImportCode(wordsArray) {
    return `
// Add this to dictionary-data.js in the pdfWords.engToUzb object:

${wordsArray.map(word => `"${word.word}": {
    word: "${word.word}",
    type: "${word.type}",
    translation: "${word.translation}",
    examples: [
        "${word.examples[0]}",
        "${word.examples[1]}",
        "${word.examples[2]}"
    ],
    source: "pdf"
}`).join(',\n')}

// Or use this in browser console:
addMultiplePdfWords(${JSON.stringify(wordsArray, null, 4)});
`;
}

// Helper to validate word entries
function validateWordEntry(wordObj) {
    const errors = [];
    
    if (!wordObj.word || typeof wordObj.word !== 'string') {
        errors.push('Missing or invalid word');
    }
    
    const validTypes = ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'interjection', 'pronoun'];
    if (!wordObj.type || !validTypes.includes(wordObj.type.toLowerCase())) {
        errors.push('Invalid word type');
    }
    
    if (!wordObj.translation || typeof wordObj.translation !== 'string') {
        errors.push('Missing or invalid translation');
    }
    
    if (!Array.isArray(wordObj.examples) || wordObj.examples.length !== 3) {
        errors.push('Must have exactly 3 examples');
    }
    
    wordObj.examples.forEach((ex, i) => {
        if (!ex || typeof ex !== 'string' || ex.trim() === '') {
            errors.push(`Example ${i + 1} is empty or invalid`);
        }
    });
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// Batch validate
function validateBatch(wordsArray) {
    const results = wordsArray.map((word, index) => ({
        index,
        word: word.word,
        ...validateWordEntry(word)
    }));
    
    const invalid = results.filter(r => !r.isValid);
    
    if (invalid.length > 0) {
        console.error('Validation errors found:');
        invalid.forEach(item => {
            console.error(`Word ${item.index + 1} (${item.word}):`, item.errors);
        });
        return false;
    }
    
    console.log(`✅ All ${wordsArray.length} words validated successfully!`);
    return true;
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        wordTemplate,
        exampleBatch,
        generateImportCode,
        validateWordEntry,
        validateBatch
    };
}

// Instructions for use:
console.log(`
📚 PDF WORD PROCESSOR READY

To add words from your PDF:

1. Create an array of words following the wordTemplate format
2. Validate with: validateBatch(yourWordsArray)
3. Generate code with: generateImportCode(yourWordsArray)
4. Copy and paste the generated code

Example:
const myWords = [
    {
        word: "example",
        type: "noun",
        translation: "misol",
        examples: [
            "This is an example",
            "Follow this example",
            "A good example to follow"
        ],
        isEngToUzb: true
    }
];

validateBatch(myWords);
console.log(generateImportCode(myWords));
`);
