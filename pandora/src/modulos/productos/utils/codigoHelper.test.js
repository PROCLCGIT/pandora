/**
 * Tests para codigoHelper.js
 * 
 * Pruebas unitarias para las funciones puras de generación de códigos
 */

import {
  DEFAULT_CODE_CONFIG,
  generateRandomNumber,
  generateRandomLetter,
  formatDateForCode,
  isValidCategoryCode,
  normalizeCategoryCode,
  generateCategoryBasedCode,
  generateCustomCode,
  generateCode,
  validateCodeFormat,
  parseCode
} from './codigoHelper.js';

describe('codigoHelper', () => {
  
  describe('generateRandomNumber', () => {
    test('should generate a 3-digit number by default', () => {
      const result = generateRandomNumber();
      expect(result).toMatch(/^\d{3}$/);
      expect(parseInt(result)).toBeGreaterThanOrEqual(1);
      expect(parseInt(result)).toBeLessThanOrEqual(999);
    });

    test('should generate number with specified length', () => {
      const result = generateRandomNumber(5);
      expect(result).toMatch(/^\d{5}$/);
      expect(parseInt(result)).toBeGreaterThanOrEqual(1);
      expect(parseInt(result)).toBeLessThanOrEqual(99999);
    });

    test('should handle edge cases', () => {
      expect(generateRandomNumber(0)).toBe('001');
      expect(generateRandomNumber(-1)).toBe('001');
    });

    test('should pad with zeros', () => {
      const result = generateRandomNumber(4);
      expect(result.length).toBe(4);
      if (parseInt(result) < 1000) {
        expect(result).toMatch(/^0/);
      }
    });
  });

  describe('generateRandomLetter', () => {
    test('should generate a single uppercase letter', () => {
      const result = generateRandomLetter();
      expect(result).toMatch(/^[A-Z]$/);
      expect(result.length).toBe(1);
    });

    test('should generate different letters on multiple calls', () => {
      const results = Array.from({ length: 10 }, () => generateRandomLetter());
      const uniqueResults = new Set(results);
      
      // Should have some variation (not all the same letter)
      expect(uniqueResults.size).toBeGreaterThan(1);
    });
  });

  describe('formatDateForCode', () => {
    test('should format current date correctly', () => {
      const result = formatDateForCode();
      expect(result).toMatch(/^\d{6}$/);
    });

    test('should format specific date correctly', () => {
      const testDate = new Date('2024-03-15');
      const result = formatDateForCode(testDate);
      expect(result).toBe('240315');
    });

    test('should handle different years', () => {
      const testDate = new Date('2023-12-31');
      const result = formatDateForCode(testDate);
      expect(result).toBe('231231');
    });
  });

  describe('isValidCategoryCode', () => {
    test('should validate correct category codes', () => {
      expect(isValidCategoryCode('MED')).toBe(true);
      expect(isValidCategoryCode('ELECTRONICS')).toBe(true);
      expect(isValidCategoryCode('A')).toBe(true);
    });

    test('should reject invalid category codes', () => {
      expect(isValidCategoryCode('')).toBe(false);
      expect(isValidCategoryCode('   ')).toBe(false);
      expect(isValidCategoryCode(null)).toBe(false);
      expect(isValidCategoryCode(undefined)).toBe(false);
      expect(isValidCategoryCode('VERYLONGCODE123')).toBe(false);
    });
  });

  describe('normalizeCategoryCode', () => {
    test('should normalize category codes', () => {
      expect(normalizeCategoryCode('med')).toBe('MED');
      expect(normalizeCategoryCode('  electronics  ')).toBe('ELECTRONICS');
      expect(normalizeCategoryCode('123')).toBe('123');
    });

    test('should handle invalid inputs', () => {
      expect(normalizeCategoryCode(null)).toBe('');
      expect(normalizeCategoryCode(undefined)).toBe('');
      expect(normalizeCategoryCode('')).toBe('');
    });
  });

  describe('generateCategoryBasedCode', () => {
    test('should generate code with correct format', () => {
      const result = generateCategoryBasedCode('MED');
      expect(result).toMatch(/^MED-[A-Z]-\d{3}$/);
    });

    test('should handle different category codes', () => {
      const result1 = generateCategoryBasedCode('ELEC');
      const result2 = generateCategoryBasedCode('FOOD');
      
      expect(result1).toMatch(/^ELEC-[A-Z]-\d{3}$/);
      expect(result2).toMatch(/^FOOD-[A-Z]-\d{3}$/);
    });

    test('should normalize category codes', () => {
      const result = generateCategoryBasedCode('  med  ');
      expect(result).toMatch(/^MED-[A-Z]-\d{3}$/);
    });

    test('should handle custom number length', () => {
      const result = generateCategoryBasedCode('TEST', { numberLength: 5 });
      expect(result).toMatch(/^TEST-[A-Z]-\d{5}$/);
    });

    test('should return empty string for invalid category codes', () => {
      expect(generateCategoryBasedCode('')).toBe('');
      expect(generateCategoryBasedCode(null)).toBe('');
      expect(generateCategoryBasedCode('VERYLONGCATEGORYCODE')).toBe('');
    });
  });

  describe('generateCustomCode', () => {
    test('should generate code with default config', () => {
      const result = generateCustomCode();
      expect(result).toMatch(/^PDIS-\d{3}$/);
    });

    test('should use custom prefix', () => {
      const result = generateCustomCode({ customPrefix: 'CUSTOM' });
      expect(result).toMatch(/^CUSTOM-\d{3}$/);
    });

    test('should include date when requested', () => {
      const testDate = new Date('2024-03-15');
      const result = generateCustomCode({ 
        includeDate: true, 
        date: testDate 
      });
      expect(result).toMatch(/^PDIS-240315-\d{3}$/);
    });

    test('should use custom separator', () => {
      const result = generateCustomCode({ separator: '_' });
      expect(result).toMatch(/^PDIS_\d{3}$/);
    });

    test('should use custom number length', () => {
      const result = generateCustomCode({ numberLength: 5 });
      expect(result).toMatch(/^PDIS-\d{5}$/);
    });
  });

  describe('generateCode', () => {
    test('should use category-based generation when category code provided', () => {
      const result = generateCode('MED');
      expect(result).toMatch(/^MED-[A-Z]-\d{3}$/);
    });

    test('should use custom generation when no category code', () => {
      const result = generateCode();
      expect(result).toMatch(/^PDIS-\d{3}$/);
    });

    test('should use custom generation when invalid category code', () => {
      const result = generateCode('');
      expect(result).toMatch(/^PDIS-\d{3}$/);
    });

    test('should pass custom config to appropriate generator', () => {
      const result = generateCode('MED', { numberLength: 4 });
      expect(result).toMatch(/^MED-[A-Z]-\d{4}$/);
    });
  });

  describe('validateCodeFormat', () => {
    test('should validate basic code requirements', () => {
      expect(validateCodeFormat('ABC')).toEqual({
        isValid: true,
        reason: null
      });
      
      expect(validateCodeFormat('')).toEqual({
        isValid: false,
        reason: 'El código no puede estar vacío'
      });
      
      expect(validateCodeFormat('AB')).toEqual({
        isValid: false,
        reason: 'El código debe tener al menos 3 caracteres'
      });
    });

    test('should validate category-based format when expected', () => {
      expect(validateCodeFormat('MED-A-001', 'MED')).toEqual({
        isValid: true,
        reason: null
      });
      
      expect(validateCodeFormat('WRONG-A-001', 'MED')).toEqual({
        isValid: false,
        reason: 'El código debe seguir el formato: MED-LETRA-NÚMERO (ej: MED-A-001)'
      });
    });

    test('should handle case insensitive validation', () => {
      expect(validateCodeFormat('med-a-001', 'MED')).toEqual({
        isValid: false,
        reason: 'El código debe seguir el formato: MED-LETRA-NÚMERO (ej: MED-A-001)'
      });
    });
  });

  describe('parseCode', () => {
    test('should parse category-based codes', () => {
      const result = parseCode('MED-A-001');
      expect(result).toEqual({
        prefix: 'MED',
        letter: 'A',
        number: '001',
        date: null,
        format: 'category-based'
      });
    });

    test('should parse custom codes with date', () => {
      const result = parseCode('PDIS-240315-123');
      expect(result).toEqual({
        prefix: 'PDIS',
        letter: null,
        number: '123',
        date: '240315',
        format: 'custom-with-date'
      });
    });

    test('should parse simple custom codes', () => {
      const result = parseCode('PDIS-123');
      expect(result).toEqual({
        prefix: 'PDIS',
        letter: null,
        number: '123',
        date: null,
        format: 'custom-simple'
      });
    });

    test('should handle invalid codes', () => {
      const result = parseCode('invalid-code-format-test');
      expect(result).toEqual({
        prefix: null,
        letter: null,
        number: null,
        date: null,
        format: 'unknown'
      });
    });

    test('should handle empty or null codes', () => {
      expect(parseCode('')).toEqual({
        prefix: null,
        letter: null,
        number: null,
        date: null,
        format: 'invalid'
      });
      
      expect(parseCode(null)).toEqual({
        prefix: null,
        letter: null,
        number: null,
        date: null,
        format: 'invalid'
      });
    });
  });

  describe('DEFAULT_CODE_CONFIG', () => {
    test('should have expected default values', () => {
      expect(DEFAULT_CODE_CONFIG).toEqual({
        prefix: 'PDIS',
        numberLength: 3,
        separator: '-',
        includeDate: false,
        customPrefix: ''
      });
    });
  });
});