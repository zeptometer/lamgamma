interface RawVariable {
    kind: 'RawVariable';
    value: string;
}

export type variable = RawVariable;
// | { kind: 'colored'; value: string; id: number }
// | { kind: 'generated'; id: number }