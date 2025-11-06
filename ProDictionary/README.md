# ProDictionary

A modern English-Uzbek bilingual dictionary with real-time search suggestions and beautiful gradient design.

## Features

- ✅ Bilingual translation (English ↔ Uzbek)
- ✅ Real-time search suggestions
- ✅ Word type indicators (noun, verb, adjective, etc.)
- ✅ 3 example sentences per word in italic style
- ✅ Modern gradient design (crimson, purple, blue, orange)
- ✅ Minimalist UI with no bio/info text
- ✅ Oxford API integration ready
- ✅ PDF word source support

## How to Use

1. **Open the dictionary**: Simply open `index.html` in your web browser
2. **Switch languages**: Click the toggle buttons to switch between English→Uzbek or Uzbek→English
3. **Search**: Start typing and see instant suggestions
4. **View results**: Click a suggestion or press Enter to see the full translation with examples

## Adding Words from PDF

### Method 1: Using the Browser Console

Open the browser console (F12 or Cmd+Option+I) and use these functions:

```javascript
// Add a single word
addPdfWord(
    'abandon',           // word
    'verb',             // type (noun, verb, adjective, adverb, etc.)
    'tashlab ketmoq',   // Uzbek translation
    [                   // 3 example sentences
        'Don\'t abandon your dreams',
        'They had to abandon the ship',
        'Never abandon hope'
    ],
    true                // true for English→Uzbek, false for Uzbek→English
);

// Add multiple words at once
addMultiplePdfWords([
    {
        word: 'ability',
        type: 'noun',
        translation: 'qobiliyat',
        examples: [
            'She has the ability to succeed',
            'His ability is impressive',
            'Everyone has hidden abilities'
        ],
        isEngToUzb: true
    },
    {
        word: 'accept',
        type: 'verb',
        translation: 'qabul qilmoq',
        examples: [
            'I accept your offer',
            'Please accept my apology',
            'They accepted the challenge'
        ],
        isEngToUzb: true
    }
]);
```

### Method 2: Edit the dictionary-data.js File

Add words directly to the `pdfWords` object in `js/dictionary-data.js`:

```javascript
const pdfWords = {
    engToUzb: {
        "abandon": {
            word: "abandon",
            type: "verb",
            translation: "tashlab ketmoq",
            examples: [
                "Don't abandon your dreams",
                "They had to abandon the ship",
                "Never abandon hope"
            ],
            source: "pdf"
        },
        // Add more words here
    },
    uzbToEng: {
        // Reverse translations
    }
};
```

## Oxford API Integration

To enable Oxford Dictionary API:

1. Get API credentials from [Oxford Dictionaries API](https://developer.oxforddictionaries.com/)
2. Open `js/dictionary-data.js`
3. Add your credentials in the `fetchFromOxford` function:

```javascript
const apiKey = 'YOUR_API_KEY';
const apiId = 'YOUR_API_ID';
```

4. Uncomment the API call code

## File Structure

```
ProDictionary/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # All styles with gradient design
├── js/
│   ├── app.js              # Main application logic
│   └── dictionary-data.js  # Dictionary data storage
├── data/                   # For storing JSON exports
└── README.md              # This file
```

## Technical Details

- **Search Engine**: Real-time filtering with `.startsWith()` for predictive suggestions
- **UI Language**: English only
- **Gradient Colors**: 
  - Crimson (#DC143C)
  - Purple (#9B59B6)
  - Royal Blue (#4169E1)
  - Orange (#FF8C00)
- **Examples**: Always 3 examples, displayed in italic with proper spacing
- **Word Types**: Displayed in lowercase (noun, verb, adjective, etc.)

## Sending PDF Pages

When you're ready to add words from your PDF:

1. Share the PDF page or bold words list
2. I'll extract the bold words
3. Format them with accurate Uzbek translations
4. Provide code to add them to the dictionary

You can send pages one by one, and we'll incrementally build the complete dictionary.

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Any modern browser with ES6 support

## Notes

- No "no suggestion found" message is shown
- Search suggestions appear as you type each letter
- All translations use accurate Uzbek language
- Examples are in English for both language directions
