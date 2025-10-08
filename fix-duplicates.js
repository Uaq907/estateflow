const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/contexts/language-context.tsx');
const content = fs.readFileSync(filePath, 'utf-8');

// Split into Arabic and English sections
const arSectionMatch = content.match(/const ar = \{([^}]+(?:\{[^}]*\}[^}]*)*)\};/s);
const enSectionMatch = content.match(/const en = \{([^}]+(?:\{[^}]*\}[^}]*)*)\};/s);

function removeDuplicateKeys(objString) {
  const lines = objString.split('\n');
  const seen = new Set();
  const result = [];
  
  for (const line of lines) {
    // Match lines that define keys: 'key': 'value',
    const keyMatch = line.match(/^\s*'([^']+)':/);
    
    if (keyMatch) {
      const key = keyMatch[1];
      if (!seen.has(key)) {
        seen.add(key);
        result.push(line);
      } else {
        console.log(`Removed duplicate key: ${key}`);
      }
    } else {
      // Keep non-key lines (comments, etc.)
      result.push(line);
    }
  }
  
  return result.join('\n');
}

if (arSectionMatch && enSectionMatch) {
  console.log('Processing Arabic section...');
  const cleanedAr = removeDuplicateKeys(arSectionMatch[1]);
  
  console.log('Processing English section...');
  const cleanedEn = removeDuplicateKeys(enSectionMatch[1]);
  
  // Reconstruct the file
  const newContent = content
    .replace(/const ar = \{[^}]+(?:\{[^}]*\}[^}]*)*\};/s, `const ar = {${cleanedAr}};`)
    .replace(/const en = \{[^}]+(?:\{[^}]*\}[^}]*)*\};/s, `const en = {${cleanedEn}};`);
  
  fs.writeFileSync(filePath, newContent, 'utf-8');
  console.log('✅ File cleaned successfully!');
} else {
  console.error('❌ Could not find Arabic or English sections');
}

