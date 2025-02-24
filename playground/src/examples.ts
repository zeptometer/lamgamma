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

const fib = `
(fn t -> (fn f -> t (fn z -> f f z)) (fn f -> t (fn z -> f f z)))
(fn fib -> (fn n ->
  if n <= 1
  then 1
  else (fib (n-1)) + (fib (n-2))
))
10
`.trim();

export const ExamplePrograms = { ski, churchnum, fib };
