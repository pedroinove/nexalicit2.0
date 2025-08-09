// path: tests/sample.test.js
describe('Sample Test', () => {
  it('deve somar corretamente', () => {
    const a = 2;
    const b = 3;
    const soma = a + b;
    expect(soma).toBe(5);
  });

  it('deve validar string', () => {
    const texto = 'NEXALICIT';
    expect(texto).toMatch(/NEXA/);
  });
});