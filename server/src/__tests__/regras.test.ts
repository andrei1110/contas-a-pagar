import { calcula_composto, calcula_simples, verifica_regra } from '../controllers';

test('calcula juros composto', () => {
    const jurosComposto = calcula_composto(30, 0.3, 5, 12);
    expect(32.6).toEqual(parseFloat(jurosComposto));
});

test('calcula juros simples', () => {
    const jurosSimples = calcula_simples(30, .3, 5, 12);
    expect(32.58).toEqual(parseFloat(jurosSimples));
});

test('busca regra atraso 1 dia', async () => {
    const regra = await verifica_regra(1);
    expect(3).toEqual(regra?.qtd_dias_final);
});

test('busca regra atraso 4 dias', async () => {
    const regra = await verifica_regra(4);
    expect(5).toEqual(regra?.qtd_dias_final);
});

test('busca regra atraso 30 dias', async () => {
    const regra = await verifica_regra(30);
    expect(Infinity).toEqual(regra?.qtd_dias_final);
});

test('busca regra adiantado', async () => {
    const regra = await verifica_regra(-3);
    expect(undefined).toEqual(regra);
});

test('busca regra em dia', async () => {
    const regra = await verifica_regra(0);
    expect(undefined).toEqual(regra);
});