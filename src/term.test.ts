/* test that creator functions generates expected syntax tree */
import { intOf, varOf, funcOf, appOf } from './term';

test('intOf', () => {
    expect(intOf(42))
    .toEqual({ kind: 'Int', value: 42 });
});

test('varOf', () => {
    expect(varOf({ kind: 'RawVariable', value: 'x' }))
    .toEqual({ kind: 'Var', value: { kind: 'RawVariable', value: 'x' } });
});

test('funcOf', () => {
    expect(funcOf({ kind: 'RawVariable', value: 'x' }, { kind: 'Int', value: 42 }))
        .toEqual({ kind: 'Func', var: { kind: 'RawVariable', value: 'x' }, body: { kind: 'Int', value: 42 } });
});