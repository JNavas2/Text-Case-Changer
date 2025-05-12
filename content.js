// Get the current selection as text
let text = getSelection();
let parsedObject = parseText(text);
parsedObject = startCase(parsedObject);
text = reassembleText(parsedObject);
putSelection(text);

// CONSTANTS

// Common articles, conjunctions, prepositions ≤3 letters
const minorWords = new Set([
  "a", "an", "the",      // articles
  "and", "but", "for", "nor", "or", "so", "yet", // conjunctions
  "as", "at", "by", "in", "of", "off", "on", "per", "to", "up", "via" // prepositions
]);

// HELPER FUNCTIONS

/**
 * Checks if a word is all uppercase (ignores non-letter characters).
 * @param {string} word
 * @returns {boolean}
 */
function isAllUpperCase(word) {
  // Only consider letters for the uppercase check
  const letters = word.match(/\p{L}+/gu);
  if (!letters) return false;
  return letters.join('') === letters.join('').toUpperCase();
}

// SIMPLE CASE CONVERSION FUNCTIONS

/**
 * Capitalizes only the first word (unless it's all uppercase), lowercases others (unless all uppercase).
 * @param {{words: string[], separators: string[]}} parsedObject
 * @returns {{words: string[], separators: string[]}}
 */
function sentenceCase(parsedObject) {
  const words = parsedObject.words.map((word, idx) => {
    if (isAllUpperCase(word)) return word;
    if (idx === 0) {
      // Capitalize first letter, lowercase the rest
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
    // Lowercase all other words
    return word.toLowerCase();
  });
  return { words, separators: parsedObject.separators };
}

/**
 * Converts the first character of each word to uppercase and the rest to lowercase,
 * unless the word is already all uppercase.
 * @param {{words: string[], separators: string[]}} parsedObject
 * @returns {{words: string[], separators: string[]}}
 */
function startCase(parsedObject) {
  const words = parsedObject.words.map(word =>
    isAllUpperCase(word)
      ? word
      : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );
  return { words, separators: parsedObject.separators };
}

/**
 * Inverts the case of each letter in every word, unless the word is all uppercase.
 * @param {{words: string[], separators: string[]}} parsedObject
 * @returns {{words: string[], separators: string[]}}
 */
function invertCase(parsedObject) {
  const words = parsedObject.words.map(word =>
    isAllUpperCase(word)
      ? word
      : Array.from(word).map(char =>
          char === char.toUpperCase()
            ? char.toLowerCase()
            : char.toUpperCase()
        ).join('')
  );
  return { words, separators: parsedObject.separators };
}

/**
 * Converts all words to uppercase, unless the word is already all uppercase.
 * @param {{words: string[], separators: string[]}} parsedObject
 * @returns {{words: string[], separators: string[]}}
 */
function upperCase(parsedObject) {
  const words = parsedObject.words.map(word =>
    isAllUpperCase(word) ? word : word.toUpperCase()
  );
  return { words, separators: parsedObject.separators };
}

/**
 * Converts all words to lowercase, unless the word is already all uppercase.
 * @param {{words: string[], separators: string[]}} parsedObject
 * @returns {{words: string[], separators: string[]}}
 */
function lowerCase(parsedObject) {
  const words = parsedObject.words.map(word =>
    isAllUpperCase(word) ? word : word.toLowerCase()
  );
  return { words, separators: parsedObject.separators };
}

// TITLE CASE CONVERSION

/**
 * Title case conversion following specific rules.
 * @param {{words: string[], separators: string[]}} parsedObject
 * @returns {{words: string[], separators: string[]}}
 */
function titleCase(parsedObject) {
  const { words } = parsedObject;
  const len = words.length;
  const result = [];

  for (let i = 0; i < len; i++) {
    let word = words[i];
    if (isAllUpperCase(word)) {
      result.push(word);
      continue;
    }

    const lower = word.toLowerCase();

    // Always capitalize first and last word
    if (i === 0 || i === len - 1) {
      result.push(word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
      continue;
    }

    // Capitalize "to" in infinitives: look for "to" followed by a verb (simplified: any word after "to")
    if (lower === "to" && i + 1 < len) {
      result.push("To");
      continue;
    }

    // Capitalize all words of 4+ letters
    if (word.length >= 4) {
      result.push(word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
      continue;
    }

    // Do not capitalize minor words (if 3 letters or fewer)
    if (minorWords.has(lower)) {
      result.push(lower);
      continue;
    }

    // Otherwise, capitalize principal words
    result.push(word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  }

  return { words: result, separators: parsedObject.separators };
}

// CAMELCASE CONVERSION

/**
 * Converts text to camelCase.
 * - First word is lowercased unless all uppercase.
 * - Subsequent words are capitalized unless all uppercase.
 * @param {{words: string[], separators: string[]}} parsedObject
 * @returns {{words: string[], separators: string[]}}
 */
function camelCase(parsedObject) {
  const words = parsedObject.words.map((word, idx) => {
    if (isAllUpperCase(word)) return word;
    if (idx === 0) {
      // Lowercase the first word
      return word.toLowerCase();
    }
    // Capitalize first letter, lowercase the rest
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
  return { words, separators: parsedObject.separators };
}

// FUNCTIONS TO PARSE AND REASSEMBLE TEXT

/**
 * Parses the input text into words and separators.
 * @param {string} text - The text to parse.
 * @returns {{words: string[], separators: string[]}}
 */
function parseText(text) {
  // Unicode regex: matches words including possessives (e.g., John's, niños', l'été)
  const wordRegex = /[\p{L}]+(?:'[\p{L}]+)?/gu;
  const words = text.match(wordRegex) || [];
  // Split by words to get all separators, including empty strings
  const separators = text.split(wordRegex);
  return {
    words,
    separators,
  };
}

/**
 * Reassembles text from words and separators arrays.
 * @param {{words: string[], separators: string[]}} param0
 * @returns {string}
 */
function reassembleText({ words, separators }) {
  let result = '';
  const maxLen = Math.max(words.length, separators.length);
  for (let i = 0; i < maxLen; i += 1) {
    if (separators[i] !== undefined) result += separators[i];
    if (words[i] !== undefined) result += words[i];
  }
  return result;
}

// SNAKE CASE CONVERSION & REASSEMBLY

/**
 * Reassembles words into snake_case (all lowercase, joined by underscores).
 * Ignores original separators.
 * @param {{words: string[], separators: string[]}} param0
 * @returns {string}
 */
function reassembleSnake({ words }) {
  return words.map(word => word.toLowerCase()).join('_');
}
