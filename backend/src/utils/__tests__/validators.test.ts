import {
  isValidUrl,
  sanitizeFileName,
  sanitizeThemeName,
  isAllowedAssetType,
  validateJobId,
} from '../validators';

describe('Validators', () => {
  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://example.com')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });
  });

  describe('sanitizeFileName', () => {
    it('should sanitize file names', () => {
      expect(sanitizeFileName('My File!@#.jpg')).toBe('my_file___.jpg');
      expect(sanitizeFileName('test-file.png')).toBe('test-file.png');
    });

    it('should limit length', () => {
      const longName = 'a'.repeat(150) + '.jpg';
      expect(sanitizeFileName(longName).length).toBeLessThanOrEqual(100);
    });
  });

  describe('sanitizeThemeName', () => {
    it('should sanitize theme names', () => {
      expect(sanitizeThemeName('My Awesome Theme!')).toBe('My Awesome Theme');
      expect(sanitizeThemeName('Theme-Name')).toBe('Theme-Name');
    });

    it('should limit length', () => {
      const longName = 'Theme '.repeat(20);
      expect(sanitizeThemeName(longName).length).toBeLessThanOrEqual(50);
    });
  });

  describe('isAllowedAssetType', () => {
    it('should allow valid asset types', () => {
      expect(isAllowedAssetType('image.jpg')).toBe(true);
      expect(isAllowedAssetType('style.css')).toBe(true);
      expect(isAllowedAssetType('script.js')).toBe(true);
      expect(isAllowedAssetType('font.woff2')).toBe(true);
    });

    it('should reject invalid asset types', () => {
      expect(isAllowedAssetType('file.exe')).toBe(false);
      expect(isAllowedAssetType('document.pdf')).toBe(false);
    });
  });

  describe('validateJobId', () => {
    it('should validate UUID format', () => {
      expect(validateJobId('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });

    it('should reject invalid UUIDs', () => {
      expect(validateJobId('not-a-uuid')).toBe(false);
      expect(validateJobId('12345')).toBe(false);
      expect(validateJobId('')).toBe(false);
    });
  });
});
