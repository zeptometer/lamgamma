import { variable } from './variable';

interface Var {
    kind: 'Var';
    value: variable;
}

interface Func {
    kind: 'Func';
    var: variable;
    body: term;
}

interface App {
    kind: 'App';
    func: term;
    arg: term;
}

interface Int {
    kind: 'Int';
    value: number;
}

export type term = Var | Func | App | Int;

export function varOf(v: variable): term {
    return { kind: 'Var', value: v };
}

export function intOf(i: number): term {
    return { kind: 'Int', value: i };
}

export function funcOf(v: variable, t: term): term {
    return { kind: 'Func', var: v, body: t };
}

export function appOf(f: term, a: term): term {
    return { kind: 'App', func: f, arg: a };
}
