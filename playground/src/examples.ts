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
let sqr = (fn y -> y * y) in
let spower_ = (fix self -> fn n x ->
  if n == 0 then \`{ 1 }
  else if (n mod 2) == 0 then
    \`{sqr ~{self (n / 2)  x}}
  else
    \`{~{x} * ~{self (n-1) x}}
) in
let spower = (fn n -> \`{fn x -> ~{ spower_ n \`{ x } }}) in
let pow11 = ~0{ spower 11 } in
pow11 2
`.trim();

export const ExamplePrograms = { ski, churchnum, fib, spow };
