// Validators test suite
describe('Validators', () => {
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255;
  }

  function validatePassword(password) {
    return typeof password === 'string' && password.length >= 6 && password.length <= 128;
  }

  function validateAmount(amount) {
    return typeof amount === 'number' && amount > 0;
  }

  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('invalid@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('test@domain')).toBe(false);
    });

    it('should reject emails over 255 characters', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      expect(validateEmail(longEmail)).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate correct passwords', () => {
      expect(validatePassword('password123')).toBe(true);
      expect(validatePassword('securePass@123')).toBe(true);
    });

    it('should reject passwords shorter than 6 characters', () => {
      expect(validatePassword('pass')).toBe(false);
      expect(validatePassword('12345')).toBe(false);
    });

    it('should reject passwords longer than 128 characters', () => {
      const longPassword = 'a'.repeat(129);
      expect(validatePassword(longPassword)).toBe(false);
    });

    it('should reject non-string passwords', () => {
      expect(validatePassword(123456)).toBe(false);
      expect(validatePassword(null)).toBe(false);
      expect(validatePassword(undefined)).toBe(false);
    });
  });

  describe('validateAmount', () => {
    it('should validate positive amounts', () => {
      expect(validateAmount(10)).toBe(true);
      expect(validateAmount(100.50)).toBe(true);
      expect(validateAmount(0.01)).toBe(true);
    });

    it('should reject zero and negative amounts', () => {
      expect(validateAmount(0)).toBe(false);
      expect(validateAmount(-10)).toBe(false);
    });

    it('should reject non-numeric values', () => {
      expect(validateAmount('100')).toBe(false);
      expect(validateAmount(NaN)).toBe(false);
    });
  });
});
