/**
 * CONTENT.JS of TEXT CASE CHANGER, an EXTENSION for CHROME BROWSERS
 * © JOHN NAVAS 2025, ALL RIGHTS RESERVED
 */

// SHIM FOR COMPATIBILITY WITH CHROME, WHICH USES `chrome` INSTEAD OF `browser` //////////////////
window.browser = window.browser || window.chrome;

// #region CONSTANTS AND HELPER FUNCTIONS ////////////////////////////////////////////////////////

// Common articles, conjunctions, prepositions ≤3 letters
const minorWords = new Set([
  "a", "an", "the",      // articles
  "and", "but", "for", "nor", "or", "so", "yet", // conjunctions
  "as", "at", "by", "in", "of", "off", "on", "per", "to", "up", "via" // prepositions
]);

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

/**
 * Splits a word into its base part and possessive suffix (if any).
 * Handles ordinals and possessives.
 * @param {string} word - The input word to split.
 * @returns {{ base: string, suffix: string }} - The base word and suffix.
 */
function splitBaseAndSuffix(word) {
  // Only split possessive: 's or ’s at end
  const match = word.match(/^([\p{L}\d]+)(['’]s)$/u);
  if (match) {
    return {
      base: match[1],
      suffix: match[2],
    };
  }
  // Otherwise, treat the whole word as base
  return {
    base: word,
    suffix: '',
  };
}

/**
 * Removes possessive suffixes from a word. 
 * Handles both 's and ’s at the end.
 * @param {string} word - The input word to process.  
 * @return {string} - The word without possessive suffixes.
 */
function removePossessive(word) {
  // If ends with 's or ’s, remove the apostrophe and keep the s
  // If ends with just ' or ’, remove the apostrophe
  return word.replace(/(['’])s$/i, 's').replace(/(['’])$/i, '');
}

/**
 * Checks if a string has internal capitals (e.g., "iPhone", "DeLorean"). 
 * This means it has at least one uppercase letter after the first character.
 * @param {string} str - The input string to check.     
 * @return {boolean} - True if the string has internal capitals, false otherwise.
 */
function hasInternalCapitals(str) {
  return /\p{Lu}/u.test(str.slice(1));
}

// #endregion // CONSTANTS AND HELPER FUNCTIONS ////////////////////////////////////////////////////////
// #region FUNCTIONS TO PARSE AND REASSEMBLE TEXT ///////////////////////////////////////////////////////

/**
 * Parses the input text into words and separators.
 * @param {string} text - The text to parse.
 * @returns {{words: string[], separators: string[]}}
 */
function parseText(text) {
  // Match words including contractions, possessives, and standalone numbers
  const wordRegex = /(?:\d+\p{L}+|[\p{L}]+(?:['’][\p{L}]+)?|\d+)/gu;
  const words = text.match(wordRegex) || [];
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

// #endregion // FUNCTIONS TO PARSE AND REASSEMBLE TEXT ////////////////////////////////////////////////////////
// #region SIMPLE CASE CONVERSION FUNCTIONS ///////////////////////////////////////////////////////

/**
 * Converts all letters in the text to lowercase.
 * @param {string} text
 * @returns {string}
 */
function lowerCase(text) {
  return text.toLowerCase();
}

/**
 * Converts all words in the text to uppercase, including possessive suffixes.
 * @param {string} text
 * @returns {string}
 */
function upperCase(text) {
  const parsed = parseText(text);
  const words = parsed.words.map(word => word.toUpperCase());
  return reassembleText({ words, separators: parsed.separators });
}

/**
 * Inverts the case of each letter in the input text.
 * Uppercase letters become lowercase and vice versa.
 * Non-letter characters are unchanged.
 * @param {string} text
 * @returns {string}
 */
function invertCase(text) {
  return Array.from(text).map(char => {
    // Check if character is a letter
    if (char === char.toUpperCase() && char !== char.toLowerCase()) {
      return char.toLowerCase();
    } else if (char === char.toLowerCase() && char !== char.toUpperCase()) {
      return char.toUpperCase();
    }
    return char; // Non-letter characters unchanged
  }).join('');
}

/**
 * Converts a string to sentence case:
 *   - Capitalizes only the first word (unless its base is all uppercase or has internal capitals),
 *     lowercases others (unless all uppercase or internal capitals).
 *   - Preserves proper nouns/brands with internal capitals.
 *   - Handles possessive suffixes correctly.
 * @param {string} text - The input text string.
 * @returns {string} - The sentence-cased string.
 */
function sentenceCase(text) {
  const parsed = parseText(text);
  const words = parsed.words.map((word, idx) => {
    const { base, suffix } = splitBaseAndSuffix(word);

    // Preserve all-uppercase words (acronyms, etc.), but lowercase suffix
    if (isAllUpperCase(base)) {
      return base + suffix.toLowerCase();
    }

    // Preserve words with internal capitals (proper names, brands)
    if (hasInternalCapitals(base)) {
      return base + suffix;
    }

    if (idx === 0) {
      // Capitalize first letter of base, lowercase the rest; lowercase suffix
      return (
        base.charAt(0).toUpperCase() +
        base.slice(1).toLowerCase() +
        suffix.toLowerCase()
      );
    }

    // Lowercase base and suffix
    return base.toLowerCase() + suffix.toLowerCase();
  });
  return reassembleText({ words, separators: parsed.separators });
}

/**
 * Converts a string to start case:
 *   - Capitalizes the first letter of each word's base, lowercases the rest (unless base is all uppercase).
 *   - Lowercases possessive suffixes.
 *   - Handles possessive suffixes and acronyms correctly.
 * @param {string} text - The input text string.
 * @returns {string} - The start-cased string.
 */
function startCase(text) {
  const parsed = parseText(text);
  const words = parsed.words.map(word => {
    const { base, suffix } = splitBaseAndSuffix(word);
    if (isAllUpperCase(base)) {
      // Already all uppercase, return as-is (with lowercased suffix)
      return base + suffix.toLowerCase();
    }
    // Preserve words with internal capitals
    if (hasInternalCapitals(base)) {
      return base + suffix;
    }
    // Capitalize first letter of base, lowercase the rest; lowercase suffix
    return (
      base.charAt(0).toUpperCase() +
      base.slice(1).toLowerCase() +
      suffix.toLowerCase()
    );
  });
  return reassembleText({ words, separators: parsed.separators });
}

// #endregion
// #region TITLE CASE CONVERSION //////////////////////////////////////////////////////////////////

function titleCase(text) {
  const parsed = parseText(text);
  const { words } = parsed;
  const len = words.length;
  const result = [];
  for (let i = 0; i < len; i++) {
    const word = words[i];
    const { base, suffix } = splitBaseAndSuffix(word);

    // 1. Preserve ALL-UPPERCASE words (acronyms, etc.), but lowercase suffix
    if (isAllUpperCase(base)) {
      result.push(base + suffix.toLowerCase());
      continue;
    }

    // 2. Preserve words with internal capitals (proper names, brands)
    //    e.g. "iPhone", "DeLorean", "eBay", "DMC-12", "McDonald's"
    if (hasInternalCapitals(base)) {
      result.push(base + suffix);
      continue;
    }

    // 3. Preserve words starting with a digit (ordinals, etc.)
    if (/^\d/.test(base)) {
      result.push(base + suffix);
      continue;
    }

    const lowerBase = base.toLowerCase();
    const lowerSuffix = suffix.toLowerCase();

    // 4. Always capitalize first and last word
    if (i === 0 || i === len - 1) {
      result.push(
        lowerBase.charAt(0).toUpperCase() +
        lowerBase.slice(1) +
        lowerSuffix
      );
      continue;
    }

    // 5. Capitalize "to" in infinitives (optional rule)
    if (lowerBase === "to" && i + 1 < len) {
      result.push("To");
      continue;
    }

    // 6. Capitalize all words of 4+ letters
    if (base.length >= 4) {
      result.push(
        lowerBase.charAt(0).toUpperCase() +
        lowerBase.slice(1) +
        lowerSuffix
      );
      continue;
    }

    // 7. Do not capitalize minor words (if 3 letters or fewer)
    if (minorWords.has(lowerBase)) {
      result.push(lowerBase + lowerSuffix);
      continue;
    }

    // 8. Otherwise, capitalize principal words
    result.push(
      lowerBase.charAt(0).toUpperCase() +
      lowerBase.slice(1) +
      lowerSuffix
    );
  }
  return reassembleText({ words: result, separators: parsed.separators });
}

// #endregion
// #region CAMELCASE & SNAKE_CASE CONVERSION ////////////////////////////////////////////////////////////

/**
 * Converts text to standard camelCase.
 * - First word is all lowercase.
 * - Each subsequent word is capitalized (first letter uppercase, rest lowercase).
 * - Internal capitals and acronyms are NOT preserved.
 * - Possessive suffixes are removed.
 * @param {string} text
 * @returns {string}
 */
function camelCase(text) {
  const parsed = parseText(text);
  return parsed.words
    .map((word, idx) => {
      const base = removePossessive(word).toLowerCase();
      if (idx === 0) return base;
      return base.charAt(0).toUpperCase() + base.slice(1);
    })
    .join('');
}

function snakeCase(text) {
  const parsed = parseText(text);
  parsed.words = parsed.words.map(word => removePossessive(word).toLowerCase());
  parsed.separators = parsed.separators.map(() => '_');
  while (parsed.separators.length < parsed.words.length) {
    parsed.separators.push('_');
  }
  if (parsed.separators[0] === '_') parsed.separators[0] = '';
  if (parsed.separators[parsed.separators.length - 1] === '_') parsed.separators[parsed.separators.length - 1] = '';
  return reassembleText(parsed);
}

// #endregion // CAMELCASE & SNAKE_CASE CONVERSION ////////////////////////////////////////////////////////////
// #region MESSAGING FROM BACKGROUND.JS TO SELECT FUNCTION ///////////////////////////////////////////////////

const caseFunctions = {
  lowerCase,
  upperCase,
  invertCase,
  sentenceCase,
  startCase,
  titleCase,
  camelCase,
  snakeCase
};

// Listen for messages from background.js
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "changeCase") {
    const fn = caseFunctions[message.caseType];
    if (typeof fn !== "function") {
      console.error("Unknown case type:", message.caseType);
      return;
    }
    const active = document.activeElement;
    if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA")) {
      const start = active.selectionStart;
      const end = active.selectionEnd;
      if (start !== end) {
        let selected = active.value.substring(start, end);
        selected = fn(selected);
        // Select the text to replace
        active.setSelectionRange(start, end);
        // Use execCommand to insert text, enabling undo
        document.execCommand('insertText', false, selected); //DEPRECATED, NO ALTERNATIVE, STILL WORKS
      }
    } else if (active && active.isContentEditable) {
      const sel = window.getSelection();
      if (sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        if (!range.collapsed && active.contains(range.commonAncestorContainer)) {
          let selected = sel.toString();
          const newText = fn(selected);
          // Selection is already set, just insert
          document.execCommand('insertText', false, newText); //DEPRECATED, NO ALTERNATIVE, STILL WORKS
        }
      }
    }
  }
});
// #endregion // MESSAGING FROM BACKGROUND.JS TO SELECT FUNCTION ///////////////////////////////////////////////////
