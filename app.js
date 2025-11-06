// ProDictionary App
let currentLanguage = 'eng-uzb';
let currentDictionary = dictionaryData.engToUzb;
let searchCount = 0;

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const suggestionsDropdown = document.getElementById('suggestionsDropdown');
const resultsSection = document.getElementById('resultsSection');
const toggleBtns = document.querySelectorAll('.toggle-btn');
const searchCountEl = document.getElementById('searchCount');
const wordCountEl = document.getElementById('wordCount');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
});

function initializeEventListeners() {
    // Update word count
    updateWordCount();

    // Language toggle
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            toggleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentLanguage = btn.dataset.lang;
            currentDictionary = currentLanguage === 'eng-uzb' 
                ? dictionaryData.engToUzb 
                : dictionaryData.uzbToEng;
            searchInput.value = '';
            suggestionsDropdown.classList.remove('show');
            showWelcomeMessage();
            updateWordCount();
        });
    });

    // Search input - real-time suggestions
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query.length > 0) {
            showSuggestions(query);
        } else {
            hideSuggestions();
        }
    });

    // Search button
    searchBtn.addEventListener('click', () => {
        performSearch();
    });

    // Enter key to search
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Click outside to close suggestions
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            hideSuggestions();
        }
    });
}

function showSuggestions(query) {
    const lowerQuery = query.toLowerCase();
    const matches = Object.keys(currentDictionary)
        .filter(word => word.toLowerCase().startsWith(lowerQuery))
        .sort()
        .slice(0, 10); // Show max 10 suggestions

    if (matches.length === 0) {
        hideSuggestions();
        return;
    }

    const suggestionsHTML = matches.map(word => {
        const data = currentDictionary[word];
        return `
            <div class="suggestion-item" data-word="${word}">
                <span class="word">${word}</span>
                <span class="type">${data.type}</span>
            </div>
        `;
    }).join('');

    suggestionsDropdown.innerHTML = suggestionsHTML;
    suggestionsDropdown.classList.add('show');

    // Add click handlers to suggestions
    document.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
            const word = item.dataset.word;
            searchInput.value = word;
            hideSuggestions();
            performSearch();
        });
    });
}

function hideSuggestions() {
    suggestionsDropdown.classList.remove('show');
    suggestionsDropdown.innerHTML = '';
}

async function performSearch() {
    const query = searchInput.value.trim().toLowerCase();
    
    if (!query) {
        showWelcomeMessage();
        return;
    }

    hideSuggestions();
    showLoadingState();

    // First try local dictionary
    let result = currentDictionary[query];
    let isEnhanced = false;

    // If not found locally, use free APIs
    if (!result && currentLanguage === 'eng-uzb') {
        // English -> Uzbek
        const isPhrase = query.includes(' '); // Check if it's a phrase
        
        if (isPhrase) {
            // For phrases, use MyMemory directly (faster)
            const translation = await fetchFromMyMemory(query, 'en', 'uz');
            
            if (translation) {
                result = {
                    word: query,
                    type: 'phrase',
                    translation: translation.translation,
                    definition: `The phrase "${query}"`,
                    examples: [
                        { sentence: query, highlight: query, explanation: 'Common phrase usage' }
                    ]
                };
                isEnhanced = true;
            } else {
                // Fallback to Gemini for phrases
                result = await fetchFromGemini(query, 'english', 'uzbek');
                isEnhanced = true;
            }
        } else {
            // For single words, use Oxford + MyMemory
            const oxfordResult = await fetchFromOxford(query);
            
            if (oxfordResult) {
                // Get Uzbek translation from MyMemory
                const translation = await fetchFromMyMemory(query, 'en', 'uz');
                
                if (translation) {
                    // Combine Oxford definition with MyMemory translation
                    result = {
                        ...oxfordResult,
                        translation: translation.translation,
                        alternativeTranslations: oxfordResult.synonyms?.slice(0, 3).map(syn => syn) || []
                    };
                    isEnhanced = true;
                } else {
                    // Use Oxford only (English definition, no Uzbek translation)
                    result = oxfordResult;
                    isEnhanced = true;
                }
            } else {
                // Try MyMemory for translation
                const translation = await fetchFromMyMemory(query, 'en', 'uz');
                if (translation) {
                    result = {
                        word: query,
                        type: 'word',
                        translation: translation.translation,
                        definition: translation.translation,
                        examples: []
                    };
                    isEnhanced = true;
                } else {
                    // Last resort: Gemini
                    result = await fetchFromGemini(query, 'english', 'uzbek');
                    isEnhanced = true;
                }
            }
        }
    } else if (!result && currentLanguage === 'uzb-eng') {
        // Uzbek -> English
        // Use MyMemory for translation
        const translation = await fetchFromMyMemory(query, 'uz', 'en');
        
        if (translation) {
            result = {
                word: query,
                type: 'word',
                translation: translation.translation,
                definition: translation.translation,
                examples: [
                    { sentence: `Example with ${query}`, highlight: query, explanation: 'Common usage' },
                    { sentence: `Another example: ${query}`, highlight: query, explanation: 'Alternative context' },
                    { sentence: `${query} in different context`, highlight: query, explanation: 'Additional usage' }
                ]
            };
            isEnhanced = true;
        } else {
            // Fallback to Gemini
            result = await fetchFromGemini(query, 'uzbek', 'english');
            isEnhanced = true;
        }
    }

    // Increment search count
    searchCount++;
    if (searchCountEl) {
        searchCountEl.textContent = searchCount;
    }

    if (result) {
        displayResult(result, isEnhanced);
    } else {
        displayNoResults(query);
    }
}

function displayResult(data, isEnhanced = false) {
    const translationLabel = currentLanguage === 'eng-uzb' 
        ? 'Uzbek Translation' 
        : 'English Translation';

    let examplesHTML = '';
    
    if (isEnhanced && data.examples && Array.isArray(data.examples) && data.examples[0]?.sentence) {
        // Enhanced examples with highlights and explanations
        examplesHTML = data.examples.map(ex => {
            let highlightedSentence = ex.sentence;
            if (ex.highlight) {
                highlightedSentence = ex.sentence.replace(
                    new RegExp(ex.highlight, 'gi'),
                    `<span class="highlight">${ex.highlight}</span>`
                );
            }
            
            return `
                <div class="example-enhanced">
                    <div class="example-sentence">${highlightedSentence}</div>
                    ${ex.translation ? `<div class="example-translation">${ex.translation}</div>` : ''}
                    ${ex.explanation ? `<div class="example-explanation">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="#9B59B6" stroke-width="2"/>
                            <path d="M12 16v-4M12 8h.01" stroke="#9B59B6" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        ${ex.explanation}
                    </div>` : ''}
                </div>
            `;
        }).join('');
    } else {
        // Basic examples (for local dictionary)
        const examples = Array.isArray(data.examples) ? data.examples : [];
        examplesHTML = examples
            .map(example => `<div class="example">${example}</div>`)
            .join('');
    }

    // Build additional sections for enhanced results
    let enhancedSections = '';
    
    if (isEnhanced) {
        // Pronunciation
        if (data.pronunciation) {
            enhancedSections += `
                <div class="pronunciation-section">
                    <span class="pronunciation-label">Pronunciation:</span>
                    <span class="pronunciation-text">${data.pronunciation}</span>
                </div>
            `;
        }

        // Definition
        if (data.definition) {
            enhancedSections += `
                <div class="definition-section">
                    <div class="section-title">Definition</div>
                    <div class="definition-text">${data.definition}</div>
                </div>
            `;
        }

        // Alternative translations
        if (data.alternativeTranslations && data.alternativeTranslations.length > 0) {
            enhancedSections += `
                <div class="alternatives-section">
                    <div class="section-title">Alternative Translations</div>
                    <div class="alternatives-list">
                        ${data.alternativeTranslations.map(alt => 
                            `<span class="alt-badge">${alt}</span>`
                        ).join('')}
                    </div>
                </div>
            `;
        }

        // Synonyms
        if (data.synonyms && data.synonyms.length > 0) {
            enhancedSections += `
                <div class="synonyms-section">
                    <div class="section-title">Synonyms</div>
                    <div class="synonyms-list">
                        ${data.synonyms.map(syn => 
                            `<span class="synonym-badge">${syn}</span>`
                        ).join('')}
                    </div>
                </div>
            `;
        }

        // Common phrases
        if (data.commonPhrases && data.commonPhrases.length > 0) {
            enhancedSections += `
                <div class="phrases-section">
                    <div class="section-title">Common Phrases</div>
                    ${data.commonPhrases.map(phrase => `
                        <div class="phrase-item">
                            <div class="phrase-text">"${phrase.phrase}"</div>
                            <div class="phrase-meaning">${phrase.meaning}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    const resultHTML = `
        <div class="result-card">
            <div class="word-header">
                <h2 class="word-title">${data.word}</h2>
                <div class="word-meta">
                    <span class="word-type">${data.type}</span>
                    ${isEnhanced ? '<span class="ai-badge">✨ AI Enhanced</span>' : ''}
                </div>
            </div>
            ${enhancedSections}
            <div class="translation">
                <div class="translation-title">${translationLabel}</div>
                <div class="translation-text">${data.translation}</div>
            </div>
            ${examplesHTML ? `
                <div class="examples-section">
                    <div class="examples-title">Examples</div>
                    ${examplesHTML}
                </div>
            ` : ''}
        </div>
    `;

    resultsSection.innerHTML = resultHTML;
}

function displayNoResults(query) {
    const resultHTML = `
        <div class="no-results">
            <div class="no-results-icon">📚</div>
            <div class="no-results-text">No translation found for "${query}"</div>
        </div>
    `;
    resultsSection.innerHTML = resultHTML;
}

function showLoadingState() {
    const loadingHTML = `
        <div class="loading-state">
            <div class="loader"></div>
            <p>Loading...</p>
        </div>
    `;
    resultsSection.innerHTML = loadingHTML;
}

function showWelcomeMessage() {
    const welcomeHTML = `
        <div class="welcome-message">
            <div class="welcome-icon">📚</div>
            <h2>Welcome to ProDictionary</h2>
            <p>Start typing to discover translations</p>
            <div class="feature-tags">
                <span class="tag">Real-time Search</span>
                <span class="tag">Smart Suggestions</span>
                <span class="tag">Examples Included</span>
            </div>
        </div>
    `;
    resultsSection.innerHTML = welcomeHTML;
}

// Helper function to add new words from PDF
function addPdfWord(word, type, translation, examples, isEngToUzb = true) {
    const wordData = {
        word: word.toLowerCase(),
        type: type,
        translation: translation,
        examples: examples,
        source: 'pdf'
    };

    if (isEngToUzb) {
        pdfWords.engToUzb[word.toLowerCase()] = wordData;
        // Also add reverse translation
        pdfWords.uzbToEng[translation.toLowerCase()] = {
            word: translation.toLowerCase(),
            type: type,
            translation: word,
            examples: examples,
            source: 'pdf'
        };
    } else {
        pdfWords.uzbToEng[word.toLowerCase()] = wordData;
        // Also add reverse translation
        pdfWords.engToUzb[translation.toLowerCase()] = {
            word: translation.toLowerCase(),
            type: type,
            translation: word,
            examples: examples,
            source: 'pdf'
        };
    }

    // Merge into main dictionary
    mergePdfWords();
}

// Batch add words from PDF (you'll use this when processing PDF pages)
function addMultiplePdfWords(wordsArray) {
    wordsArray.forEach(wordObj => {
        addPdfWord(
            wordObj.word,
            wordObj.type,
            wordObj.translation,
            wordObj.examples,
            wordObj.isEngToUzb !== undefined ? wordObj.isEngToUzb : true
        );
    });
    console.log(`Added ${wordsArray.length} words from PDF`);
}

// Update word count display
function updateWordCount() {
    if (wordCountEl) {
        const count = Object.keys(currentDictionary).length;
        wordCountEl.textContent = count;
    }
}

// Export functions for console access
window.addPdfWord = addPdfWord;
window.addMultiplePdfWords = addMultiplePdfWords;
window.dictionaryData = dictionaryData;
window.pdfWords = pdfWords;
window.updateWordCount = updateWordCount;
