import { UUID } from './../../config/uuid.adapter';
describe('uuid.adapter.ts', () => {
  test('should return true when given a valid UUID string', () => {
    const validUUID = '123e4567-e89b-12d3-a456-426614174000';
    const result = UUID.validate(validUUID);
    expect(result).toBe(true);
  });

  test('should return false when given an invalid UUID string', () => {
    const invalidUUID = 'invalid-uuid';
    const result = UUID.validate(invalidUUID);
    expect(result).toBe(false);
  });
});
