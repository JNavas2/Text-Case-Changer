/**
 * CONTENT.JS of TEXT CASE CHANGER, an EXTENSION for MOZILLA FIREFOX
 * © JOHN NAVAS 2025, ALL RIGHTS RESERVED
 */

// SHIM FOR COMPATIBILITY WITH CHROME, WHICH USES `chrome` INSTEAD OF `browser` //////////////////
window.browser = window.browser || window.chrome;

// CONSTANTS /////////////////////////////////////////////////////////////////////////////////////

// Common articles, conjunctions, prepositions ≤3 letters
const minorWords = new Set([
  "a", "an", "the",      // articles
  "and", "but", "for", "nor", "or", "so", "yet", // conjunctions
  "as", "at", "by", "in", "of", "off", "on", "per", "to", "up", "via" // prepositions
]);

// HELPER FUNCTIONS /////////////////////////////////////////////////////////////////////////////////////

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
 * Handles apostrophes like ' or ’ and optional trailing s.
 * @param {string} word - The input word to split.
 * @returns {{ base: string, suffix: string }} - The base word and suffix.
 */
function splitBaseAndSuffix(word) {
  // Regex explanation:
  // ^([\p{L}]+)   -> capture one or more Unicode letters at the start (base)
  // (['’]s?|)     -> optional suffix: apostrophe (straight or curly) + optional s
  // $             -> end of string
  const match = word.match(/^([\p{L}]+)(['’]s?|)$/u);
  if (match) {
    return {
      base: match[1],
      suffix: match[2] || '',
    };
  }
  // If no match, treat entire word as base, no suffix
  return {
    base: word,
    suffix: '',
  };
}

function removePossessive(word) {
  // If ends with 's or ’s, remove the apostrophe and keep the s
  // If ends with just ' or ’, remove the apostrophe
  return word.replace(/(['’])s$/i, 's').replace(/(['’])$/i, '');
}

// FUNCTIONS TO PARSE AND REASSEMBLE TEXT ////////////////////////////////////////////////////////////

/**
 * Parses the input text into words and separators.
 * @param {string} text - The text to parse.
 * @returns {{words: string[], separators: string[]}}
 */
function parseText(text) {
  // Unicode regex: matches words including possessives (e.g., John's, niños', l'été)
  const wordRegex = /[\p{L}]+(?:['’]s|['’])?/gu;
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

// SIMPLE CASE CONVERSION FUNCTIONS //////////////////////////////////////////////////////////////////////

/**
 * Converts all words in the text to lowercase, unless the word is already all uppercase.
 * But if all letters in the selection are uppercase, convert the entire selection to lowercase.
 * @param {string} text
 * @returns {string}
 */
function lowerCase(text) {
  if (isAllUpperCase(text)) {
    // Edge case: all letters in the selection are uppercase
    return text.toLowerCase();
  }
  // Converts all words in the text to lowercase, unless the word is already all uppercase
  const parsed = parseText(text);
  const words = parsed.words.map(word => {
    const { base, suffix } = splitBaseAndSuffix(word);
    if (isAllUpperCase(base)) {
      // Preserve uppercase base, lowercase suffix
      return base + suffix.toLowerCase();
    } else {
      // Lowercase entire word
      return (base + suffix).toLowerCase();
    }
  });
  return reassembleText({ words, separators: parsed.separators });
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
 * Inverts the case of each letter in every word of the input text,
 * unless the base word is all uppercase. Handles possessive suffixes correctly.
 * @param {string} text
 * @returns {string}
 */
function invertCase(text) {
  const parsed = parseText(text);
  const words = parsed.words.map(word => {
    const { base, suffix } = splitBaseAndSuffix(word);
    if (isAllUpperCase(base)) {
      // Already all uppercase, return as-is (including suffix)
      return base + suffix;
    } else {
      // Invert case of base and suffix separately, then join
      const invert = s => Array.from(s).map(
        c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()
      ).join('');
      return invert(base) + invert(suffix);
    }
  });
  return reassembleText({ words, separators: parsed.separators });
}

/**
 * Converts a string to sentence case:
 *   - Capitalizes only the first word (unless its base is all uppercase), lowercases others (unless all uppercase).
 *   - Handles possessive suffixes correctly.
 * @param {string} text - The input text string.
 * @returns {string} - The sentence-cased string.
 */
function sentenceCase(text) {
  const parsed = parseText(text);
  const words = parsed.words.map((word, idx) => {
    const { base, suffix } = splitBaseAndSuffix(word);
    if (isAllUpperCase(base)) {
      // Already all uppercase, return as-is (with suffix)
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
    // Lowercase base and suffix for all other words
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
      // Already all uppercase, return as-is (with suffix)
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

// TITLE CASE CONVERSION /////////////////////////////////////////////////////////////////////////////

/**
 * Converts a text string to title case following specific rules.
 * Handles possessive suffixes and acronyms correctly.
 * @param {string} text - The text to convert.
 * @returns {string} - The title-cased text.
 */
function titleCase(text) {
  const parsed = parseText(text);
  const { words } = parsed;
  const len = words.length;
  const result = [];
  for (let i = 0; i < len; i++) {
    const word = words[i];
    const { base, suffix } = splitBaseAndSuffix(word);
    // If base is all uppercase, preserve as-is (with suffix)
    if (isAllUpperCase(base)) {
      result.push(base + suffix);
      continue;
    }
    const lowerBase = base.toLowerCase();
    const lowerSuffix = suffix.toLowerCase();
    // Always capitalize first and last word
    if (i === 0 || i === len - 1) {
      result.push(
        lowerBase.charAt(0).toUpperCase() +
        lowerBase.slice(1) +
        lowerSuffix
      );
      continue;
    }
    // Capitalize "to" in infinitives: look for "to" followed by a verb (simplified: any word after "to")
    if (lowerBase === "to" && i + 1 < len) {
      result.push("To");
      continue;
    }
    // Capitalize all words of 4+ letters (base only)
    if (base.length >= 4) {
      result.push(
        lowerBase.charAt(0).toUpperCase() +
        lowerBase.slice(1) +
        lowerSuffix
      );
      continue;
    }
    // Do not capitalize minor words (if 3 letters or fewer)
    if (minorWords.has(lowerBase)) {
      result.push(lowerBase + lowerSuffix);
      continue;
    }
    // Otherwise, capitalize principal words
    result.push(
      lowerBase.charAt(0).toUpperCase() +
      lowerBase.slice(1) +
      lowerSuffix
    );
  }
  return reassembleText({ words: result, separators: parsed.separators });
}

// CAMELCASE CONVERSION //////////////////////////////////////////////////////////////////////////////

function camelCase(text) {
  const parsed = parseText(text);
  const words = parsed.words.map((word, idx) => {
    // Remove possessive punctuation
    const base = removePossessive(word);
    if (idx === 0) {
      // Lowercase the first word
      return base.toLowerCase();
    }
    // Capitalize first letter, lowercase the rest
    return base.charAt(0).toUpperCase() + base.slice(1).toLowerCase();
  });
  // Reassemble with no separators
  return reassembleText({ words, separators: Array(words.length + 1).fill('') });
}

// SNAKE CASE CONVERSION & REASSEMBLY ////////////////////////////////////////////////////////////////

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

// MESSAGING FROM BACKGROUND.JS TO SELECT FUNCTION ///////////////////////////////////////////////////

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
