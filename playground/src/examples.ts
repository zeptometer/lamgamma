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
(fix fib -> (fn n ->
  if n <= 1
  then 1
  else (fib (n-1)) + (fib (n-2))
))
10
`.trim();

const spow = `
(fn spower_ ->
  (fn spower ->
    ~0{spower 3} 2
  )
  (fn n -> \`{fn x -> ~{ spower_ n \`{x}}})
)
(fix spower_ -> (fn n x ->
  if n == 0 then x
  else \`{ ~{ x } * ~{ spower_ (n-1) x } }
))
`

export const ExamplePrograms = { ski, churchnum, fib, spow };
