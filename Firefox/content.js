/**
 * CONTEXT.JS of TEXT CASE CHANGER, an EXTENSION for MOZILLA FIREFOX
 * © JOHN NAVAS 2025, ALL RIGHTS RESERVED
 */

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
 * @param {string} text
 * @returns {string}
 */
function lowerCase(text) {
  const parsed = parseText(text);
  const words = parsed.words.map(word =>
    isAllUpperCase(word) ? word : word.toLowerCase()
  );
  const changed = { words, separators: parsed.separators };
  return reassembleText(changed);
}

/**
 * Converts all words in the text to uppercase, unless the word is already all uppercase.
 * @param {string} text
 * @returns {string}
 */
function upperCase(text) {
  const parsed = parseText(text);
  const words = parsed.words.map(word =>
    isAllUpperCase(word) ? word : word.toUpperCase()
  );
  const changed = { words, separators: parsed.separators };
  return reassembleText(changed);
}

/**
 * Inverts the case of each letter in every word of the input text,
 * unless the word is all uppercase. Returns the changed text.
 * @param {string} text
 * @returns {string}
 */
function invertCase(text) {
  // Parse the input text
  const parsedObject = parseText(text);

  // Invert the case of each word (unless all uppercase)
  const words = parsedObject.words.map(word =>
    isAllUpperCase(word)
      ? word
      : Array.from(word).map(char =>
          char === char.toUpperCase()
            ? char.toLowerCase()
            : char.toUpperCase()
        ).join('')
  );

  // Reassemble the text with inverted words and original separators
  const changedText = reassembleText({
    words,
    separators: parsedObject.separators
  });

  return changedText;
}
/**
 * Converts a string to sentence case:
 *   - Capitalizes only the first word (unless it's all uppercase), lowercases others (unless all uppercase).
 * @param {string} text - The input text string.
 * @returns {string} - The sentence-cased string.
 */
function sentenceCase(text) {
  // Parse the text into words and separators
  const parsedObject = parseText(text);

  // Change case
  const words = parsedObject.words.map((word, idx) => {
    if (isAllUpperCase(word)) return word;
    if (idx === 0) {
      // Capitalize first letter, lowercase the rest
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
    // Lowercase all other words
    return word.toLowerCase();
  });

  // Reassemble text from the changed words and original separators
  const changedObject = { words, separators: parsedObject.separators };
  return reassembleText(changedObject);
}

/**
 * Converts the first character of each word to uppercase and the rest to lowercase,
 * unless the word is already all uppercase. Accepts a text string, parses it,
 * applies the logic, and returns the changed text.
 * @param {string} text
 * @returns {string}
 */
function startCase(text) {
  // Parse the input text into words and separators
  const parsedObject = parseText(text);

  // Change the case
  const changedWords = parsedObject.words.map(word =>
    isAllUpperCase(word)
      ? word
      : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );

  // Create new parsed object with changed words
  const changedObject = {
    words: changedWords,
    separators: parsedObject.separators
  };

  // Reassemble and return the changed text
  return reassembleText(changedObject);
}

// TITLE CASE CONVERSION /////////////////////////////////////////////////////////////////////////////

/**
 * Converts a text string to title case following specific rules.
 * @param {string} text - The text to convert.
 * @returns {string} - The title-cased text.
 */
function titleCase(text) {
  // Step 1: Parse the text into words and separators
  const parsedObject = parseText(text);
  const { words } = parsedObject;
  const len = words.length;
  const result = [];

  // Step 2: Apply title case logic to each word
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

  // Step 3: Reassemble and return the changed text
  return reassembleText({ words: result, separators: parsedObject.separators });
}

// CAMELCASE CONVERSION //////////////////////////////////////////////////////////////////////////////

/**
 * Converts a text string to camelCase.
 * - First word is lowercased unless all uppercase.
 * - Subsequent words are capitalized unless all uppercase.
 * @param {string} text
 * @returns {string}
 */
function camelCase(text) {
  const parsed = parseText(text);
  const words = parsed.words.map((word, idx) => {
    if (isAllUpperCase(word)) return word;
    if (idx === 0) {
      // Lowercase the first word
      return word.toLowerCase();
    }
    // Capitalize first letter, lowercase the rest
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
  // Reassemble with no separators (empty array of separators)
  return reassembleText({ words, separators: Array(words.length + 1).fill('') });
}

// SNAKE CASE CONVERSION & REASSEMBLY ////////////////////////////////////////////////////////////////

/**
 * Converts input text to snake_case using parseText and reassembleText logic.
 * @param {string} text
 * @returns {string}
 */
function snakeCase(text) {
  // Parse the text into words and separators
  const parsed = parseText(text);

  // Lowercase all words (snake_case logic)
  parsed.words = parsed.words.map(word => word.toLowerCase());

  // Replace all separators with underscores
  // (One less separator than words, so fill the rest with '')
  parsed.separators = parsed.separators.map(() => '_');
  // If separators array is shorter than words, pad it
  while (parsed.separators.length < parsed.words.length) {
    parsed.separators.push('_');
  }

  // Remove leading and trailing underscores (if any)
  // (Optional: depends on your requirements. If you want to keep them, remove this part.)
  if (parsed.separators[0] === '_') parsed.separators[0] = '';
  if (parsed.separators[parsed.separators.length - 1] === '_') parsed.separators[parsed.separators.length - 1] = '';

  // Reassemble the text with underscores as separators
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
        active.setRangeText(selected, start, end, "end");
      }
    } else if (active && active.isContentEditable) {
      const sel = window.getSelection();
      if (sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        if (!range.collapsed && active.contains(range.commonAncestorContainer)) {
          let selected = sel.toString();
          const newText = fn(selected);
          range.deleteContents();
          const textNode = document.createTextNode(newText);
          range.insertNode(textNode);
          sel.removeAllRanges();
          const newRange = document.createRange();
          newRange.setStartBefore(textNode);
          newRange.setEndAfter(textNode);
          sel.addRange(newRange);
        }
      }
    }
  }
});
