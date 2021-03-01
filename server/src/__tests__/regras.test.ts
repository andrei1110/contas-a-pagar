import { calcula_composto, calcula_simples } from '../controllers';

test('calcula juros composto', () => {
    const jurosComposto = calcula_composto(30, 0.3, 5, 12);
    expect(32.6).toEqual(parseFloat(jurosComposto));
});

test('calcula juros simples', () => {
    const jurosSimples = calcula_simples(30, .3, 5, 12);
    expect(32.58).toEqual(parseFloat(jurosSimples));
});