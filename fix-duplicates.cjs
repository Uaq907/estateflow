const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/contexts/language-context.tsx');
const content = fs.readFileSync(filePath, 'utf-8');

function removeDuplicateKeys(sectionContent) {
  const lines = sectionContent.split('\n');
  const seen = new Set();
  const result = [];
  let duplicateCount = 0;
  
  for (const line of lines) {
    // Match lines that define keys: 'key': 'value',
    const keyMatch = line.match(/^\s*'([^']+)':/);
    
    if (keyMatch) {
      const key = keyMatch[1];
      if (!seen.has(key)) {
        seen.add(key);
        result.push(line);
      } else {
        console.log(`  Removed duplicate: '${key}'`);
        duplicateCount++;
      }
    } else {
      // Keep non-key lines (comments, blank lines, etc.)
      result.push(line);
    }
  }
  
  console.log(`  Total duplicates removed: ${duplicateCount}`);
  return result.join('\n');
}

// Find the ar section
const arStart = content.indexOf('ar: {');
const enStart = content.indexOf('en: {');

if (arStart === -1 || enStart === -1) {
  console.error('❌ Could not find ar or en sections');
  process.exit(1);
}

// Extract the ar section content
const arSectionStart = arStart + 5; // Length of "ar: {"
const arSectionEnd = enStart - 1; // Just before "en: {"
const arSection = content.substring(arSectionStart, arSectionEnd).trim();

// Extract the en section content  
const enSectionStart = enStart + 5; // Length of "en: {"
// Find the closing of the en object
let braceCount = 1;
let enSectionEnd = enSectionStart;
for (let i = enSectionStart; i < content.length; i++) {
  if (content[i] === '{') braceCount++;
  if (content[i] === '}') braceCount--;
  if (braceCount === 0) {
    enSectionEnd = i;
    break;
  }
}
const enSection = content.substring(enSectionStart, enSectionEnd).trim();

console.log('📝 Processing Arabic section...');
const cleanedAr = removeDuplicateKeys(arSection);

console.log('\n📝 Processing English section...');
const cleanedEn = removeDuplicateKeys(enSection);

// Reconstruct the file
const before = content.substring(0, arSectionStart);
const between = '\n  },\n  en: {\n    ';
const after = content.substring(enSectionEnd);

const newContent = before + cleanedAr + between + cleanedEn + after;

fs.writeFileSync(filePath, newContent, 'utf-8');
console.log('\n✅ File cleaned successfully!');
console.log('💾 Saved to:', filePath);
