import { describe, it, expect } from 'vitest';
import { SQLValidator } from '../src/sql-validator';

describe('SQLValidator', () => {
  const validator = new SQLValidator();

  describe('valid queries', () => {
    it('should validate simple SELECT query', () => {
      const result = validator.validate('SELECT * FROM Contact LIMIT 10');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate SELECT with WHERE clause', () => {
      const result = validator.validate('SELECT id, name FROM Contact WHERE score > 50 LIMIT 100');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate SELECT with JOIN', () => {
      const result = validator.validate(`
        SELECT c.name, d.amount 
        FROM Contact c 
        JOIN Donation d ON c.id = d.contactId 
        LIMIT 50
      `);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate SELECT with aggregation', () => {
      const result = validator.validate(`
        SELECT COUNT(*) as total_donations, SUM(amount) as total_amount 
        FROM Donation 
        WHERE date >= '2024-01-01' 
        LIMIT 1
      `);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('invalid queries', () => {
    it('should reject INSERT statements', () => {
      const result = validator.validate('INSERT INTO Contact (name) VALUES ("Test")');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Forbidden keywords detected: INSERT');
    });

    it('should reject UPDATE statements', () => {
      const result = validator.validate('UPDATE Contact SET name = "Updated" WHERE id = 1');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Forbidden keywords detected: UPDATE');
    });

    it('should reject DELETE statements', () => {
      const result = validator.validate('DELETE FROM Contact WHERE id = 1');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Forbidden keywords detected: DELETE');
    });

    it('should reject DROP statements', () => {
      const result = validator.validate('DROP TABLE Contact');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Forbidden keywords detected: DROP');
    });

    it('should reject non-SELECT statements', () => {
      const result = validator.validate('SHOW TABLES');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Only SELECT statements are allowed');
    });

    it('should reject queries without LIMIT', () => {
      const result = validator.validate('SELECT * FROM Contact');
      expect(result.isValid).toBe(false);
      expect(result.warnings).toContain('Query should include LIMIT clause (max 1000 rows)');
    });

    it('should reject queries with excessive LIMIT', () => {
      const result = validator.validate('SELECT * FROM Contact LIMIT 2000');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('LIMIT exceeds maximum allowed rows (1000)');
    });
  });

  describe('table restrictions', () => {
    it('should allow queries on allowed tables', () => {
      const result = validator.validate('SELECT * FROM Contact LIMIT 10', {
        allowedTables: ['Contact', 'Donation']
      });
      expect(result.isValid).toBe(true);
    });

    it('should reject queries on unauthorized tables', () => {
      const result = validator.validate('SELECT * FROM User LIMIT 10', {
        allowedTables: ['Contact', 'Donation']
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Unauthorized tables: User');
    });
  });

  describe('dangerous patterns', () => {
    it('should warn about subqueries', () => {
      const result = validator.validate(`
        SELECT * FROM Contact 
        WHERE id IN (SELECT contactId FROM Donation WHERE amount > 1000) 
        LIMIT 10
      `);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Potentially dangerous patterns detected: subqueries');
    });

    it('should warn about UNION statements', () => {
      const result = validator.validate(`
        SELECT name FROM Contact 
        UNION 
        SELECT name FROM Organization 
        LIMIT 10
      `);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Potentially dangerous patterns detected: UNION statements');
    });
  });

  describe('SQL sanitization', () => {
    it('should remove comments', () => {
      const result = validator.validate(`
        SELECT * FROM Contact -- This is a comment
        /* Multi-line comment */
        LIMIT 10
      `);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedSQL).not.toContain('--');
      expect(result.sanitizedSQL).not.toContain('/*');
    });

    it('should normalize whitespace', () => {
      const result = validator.validate('SELECT   *   FROM   Contact   LIMIT   10');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedSQL).toBe('SELECT * FROM Contact LIMIT 10');
    });
  });

  describe('utility methods', () => {
    it('should add LIMIT if missing', () => {
      const result = validator.addLimitIfMissing('SELECT * FROM Contact', 50);
      expect(result).toBe('SELECT * FROM Contact LIMIT 50');
    });

    it('should not add LIMIT if already present', () => {
      const result = validator.addLimitIfMissing('SELECT * FROM Contact LIMIT 25', 50);
      expect(result).toBe('SELECT * FROM Contact LIMIT 25');
    });

    it('should validate for reports with tenant context', () => {
      const result = validator.validateForReports('SELECT * FROM Contact LIMIT 10', 'tenant-123');
      expect(result.isValid).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty SQL', () => {
      const result = validator.validate('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Only SELECT statements are allowed');
    });

    it('should handle malformed SQL', () => {
      const result = validator.validate('SELECT * FROM');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle case-insensitive keywords', () => {
      const result = validator.validate('select * from contact limit 10');
      expect(result.isValid).toBe(true);
    });

    it('should handle keywords in strings', () => {
      const result = validator.validate('SELECT * FROM Contact WHERE name = "INSERT INTO" LIMIT 10');
      expect(result.isValid).toBe(true);
    });
  });
});
