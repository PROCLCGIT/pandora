/**
 * Validación rápida de las funciones del codigoHelper
 * Este archivo se puede ejecutar directamente con Node.js para validar la funcionalidad
 */

import {
  generateRandomNumber,
  generateRandomLetter,
  generateCategoryBasedCode,
  generateCustomCode,
  generateCode,
  validateCodeFormat,
  parseCode
} from './codigoHelper.js';

function runValidations() {
  console.log('🧪 Validando funciones del codigoHelper...\n');

  // Test generateRandomNumber
  console.log('📊 generateRandomNumber:');
  console.log('  3 dígitos:', generateRandomNumber());
  console.log('  5 dígitos:', generateRandomNumber(5));
  console.log('  Edge case (0):', generateRandomNumber(0));
  console.log('');

  // Test generateRandomLetter
  console.log('🔤 generateRandomLetter:');
  const letters = Array.from({ length: 5 }, () => generateRandomLetter());
  console.log('  5 letras aleatorias:', letters.join(', '));
  console.log('');

  // Test generateCategoryBasedCode
  console.log('🏷️ generateCategoryBasedCode:');
  console.log('  MED:', generateCategoryBasedCode('MED'));
  console.log('  ELECTRONICS:', generateCategoryBasedCode('ELECTRONICS'));
  console.log('  Código vacío:', generateCategoryBasedCode(''));
  console.log('  Código muy largo:', generateCategoryBasedCode('VERYLONGCATEGORYCODE'));
  console.log('');

  // Test generateCustomCode
  console.log('⚙️ generateCustomCode:');
  console.log('  Default:', generateCustomCode());
  console.log('  Con fecha:', generateCustomCode({ includeDate: true }));
  console.log('  Prefijo custom:', generateCustomCode({ customPrefix: 'CUSTOM' }));
  console.log('  Separador custom:', generateCustomCode({ separator: '_' }));
  console.log('');

  // Test generateCode
  console.log('🎯 generateCode:');
  console.log('  Con categoría MED:', generateCode('MED'));
  console.log('  Sin categoría:', generateCode());
  console.log('  Categoría inválida:', generateCode(''));
  console.log('');

  // Test validateCodeFormat
  console.log('✅ validateCodeFormat:');
  const testCodes = [
    'MED-A-001',
    'ELEC-Z-999',
    'PDIS-123',
    'AB',
    '',
    'WRONG-A-001'
  ];
  
  testCodes.forEach(code => {
    const result = validateCodeFormat(code, 'MED');
    console.log(`  "${code}": ${result.isValid ? '✅' : '❌'} ${result.reason || 'Válido'}`);
  });
  console.log('');

  // Test parseCode
  console.log('🔍 parseCode:');
  const parseCodes = [
    'MED-A-001',
    'PDIS-240315-123',
    'PDIS-123',
    'invalid-format'
  ];
  
  parseCodes.forEach(code => {
    const parsed = parseCode(code);
    console.log(`  "${code}":`, parsed);
  });

  console.log('\n✨ Validación completada!');
}

// Ejecutar validaciones si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runValidations();
}

export { runValidations };