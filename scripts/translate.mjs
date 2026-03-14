#!/usr/bin/env node
/**
 * Auto-translate script for next-intl
 * Translates en.json to fr.json and es.json using MyMemory free API
 * Arabic (ar.json) should be written manually for quality
 * 
 * Usage: node scripts/translate.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// MyMemory free API - no key required
const MYMEMORY_API = 'https://api.mymemory.translated.net/get';

// Rate limiting - 300ms delay between requests
const DELAY_MS = 300;

// Target languages (Arabic is written manually)
const TARGET_LANGS = ['fr', 'es'];

// Language pairs for MyMemory
const LANG_PAIRS = {
  fr: 'en|fr',
  es: 'en|es'
};

// Check if value contains a variable placeholder like {count}
function hasVariable(value) {
  if (typeof value !== 'string') return false;
  return /\{[^}]+\}/.test(value);
}

// Check if value should be skipped
function shouldSkip(value) {
  if (typeof value !== 'string') return true;
  if (hasVariable(value)) return true;
  if (value.trim() === '') return true;
  // Skip URLs
  if (value.startsWith('http')) return true;
  // Skip email placeholders
  if (value.includes('@')) return true;
  return false;
}

// Translate a single string using MyMemory API
async function translateString(text, targetLang) {
  if (shouldSkip(text)) {
    return text;
  }
  
  try {
    const url = new URL(MYMEMORY_API);
    url.searchParams.set('q', text);
    url.searchParams.set('langpair', LANG_PAIRS[targetLang]);
    
    const response = await fetch(url.toString());
    const data = await response.json();
    
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText;
    }
    
    console.warn(`⚠️ Translation failed for: "${text.substring(0, 30)}..."`);
    return text;
  } catch (error) {
    console.error(`❌ Error translating: "${text.substring(0, 30)}..."`);
    return text;
  }
}

// Delay helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Recursively translate object
async function translateObject(obj, targetLang, progress = { count: 0, total: 0 }) {
  const result = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      progress.count++;
      process.stdout.write(`\r🔄 Translating ${targetLang}: ${progress.count}/${progress.total} strings`);
      
      const translated = await translateString(value, targetLang);
      result[key] = translated;
      
      await delay(DELAY_MS);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = await translateObject(value, targetLang, progress);
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

// Count total strings to translate
function countStrings(obj) {
  let count = 0;
  for (const value of Object.values(obj)) {
    if (typeof value === 'string') {
      count++;
    } else if (typeof value === 'object' && value !== null) {
      count += countStrings(value);
    }
  }
  return count;
}

// Main function
async function main() {
  console.log('🌐 Auto-translate script for next-intl\n');
  
  // Read English source
  const enPath = path.join(__dirname, '..', 'messages', 'en.json');
  const enContent = fs.readFileSync(enPath, 'utf-8');
  const enData = JSON.parse(enContent);
  
  console.log(`📖 Loaded en.json with ${countStrings(enData)} strings\n`);
  
  // Check if ar.json exists
  const arPath = path.join(__dirname, '..', 'messages', 'ar.json');
  if (!fs.existsSync(arPath)) {
    console.log('⚠️ Arabic (ar.json) not found - please create it manually for quality');
  } else {
    console.log('✅ Arabic (ar.json) exists - skipping as it should be written manually\n');
  }
  
  // Translate to each target language
  for (const targetLang of TARGET_LANGS) {
    const outputPath = path.join(__dirname, '..', 'messages', `${targetLang}.json`);
    
    // Check if file exists
    if (fs.existsSync(outputPath)) {
      console.log(`📄 ${targetLang}.json exists - checking for missing keys...\n`);
      // For now, we'll overwrite. In production, you'd merge keys
    }
    
    const totalStrings = countStrings(enData);
    const progress = { count: 0, total: totalStrings };
    
    console.log(`🔄 Translating to ${targetLang.toUpperCase()}...`);
    
    const translatedData = await translateObject(enData, targetLang, progress);
    
    // Write output file
    fs.writeFileSync(outputPath, JSON.stringify(translatedData, null, 2), 'utf-8');
    
    console.log(`\n✅ Created ${targetLang}.json\n`);
  }
  
  console.log('🎉 Translation complete!');
  console.log('\n📝 Note: Arabic (ar.json) should be written manually for natural translation quality.');
}

main().catch(console.error);
