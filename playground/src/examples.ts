const ski =
`(fn s k i -> s k k i)
(fn x y z -> x z (y z))
(fn x y -> x)
(fn x -> x)
`

const churchnum =
`
(fn f x -> f (f x))
(fn f x -> f (f x))
(fn n -> n + 1)
0
`

export const ExamplePrograms = { ski, churchnum };
