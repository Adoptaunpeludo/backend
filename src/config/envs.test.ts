describe('envs.ts', () => {
  test('should return error if not found env', async () => {
    jest.resetModules();
    process.env.PORT = 'ABC';

    try {
      await import('./envs');
      expect(true).toBe(false);
    } catch (error) {
      expect(`${error}`).toContain('should be a valid integer');
    }
  });
});
