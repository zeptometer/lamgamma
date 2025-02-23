const ski =
`(fn s k i -> s k k i)
(fn x y z -> x z (y z))
(fn x y -> x)
(fn x -> x)
`.trim();

const churchnum =
`
(fn f x -> f (f x))
(fn f x -> f (f x))
(fn f x -> f (f x))
(fn f x -> f (f x))
(fn x -> x + 1)
0
`.trim();

export const ExamplePrograms = { ski, churchnum };
