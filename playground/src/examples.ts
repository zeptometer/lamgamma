const quasiquote =
  `
let x = \`{ 1 + 2 } in
\`{ 2 * ~{ x } }
`.trim();

const runtime_evaluation =
  `
let x = \`{ 1 + 2 } in
~0{ x }
`.trim();

const fib = `
(fix fib -> (fn n ->
  if n <= 1
  then 1
  else (fib (n-1)) + (fib (n-2))
))
10
`.trim();

const runtime_evaluation_csp =
  `
let x = 3 in
let y = \`{ 1 + x } in
~0{ y }
`.trim();

const ill_staged_variable = `
\`{
  let y = 1 in
  ~{ y }
}
`.trim();

const scope_extrusion =
  `
let x = 1 in
\`{ 1 + x }
`.trim();

const spower = `
let spower_ = (fix self -> fn n x ->
  if n == 0 then 1
  else if n == 1 then x
  else \`{ ~{ x } * ~{ self (n-1) x } }) in
let spower = fn n ->
  \`{ fn x -> ~{ spower_ n \`{ x } } } in
spower 10
`.trim();

const spower_csp = `
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

const spower_cont = `
let spower_ = fix self -> fn n xq cont ->
  if n == 0 then
    cont \`{ 1 }
  else if n == 1 then
    cont xq
  else if n mod 2 == 1 then
    self (n - 1) xq
      (fn yq -> cont \`{ ~{ xq } * ~{ yq } })
  else
    \`{
      let x2 = ~{ xq } * ~{ xq } in
      ~{
        self (n / 2) \`{ x2 }
          (fn yq -> cont yq)
      }
    } in

let spower = fn n ->
  \`{
     fn x ->
       ~{ spower_ n \`{ x } (fn y -> y) }
   } in

\`{
  let power11 = ~{spower 11} in
  power11 2
}
`.trim()

export type Example = "quasiquote" | "runtime_evaluation" | "runtime_evaluation_csp" |
 "ill_staged_variable" |  "scope_extrusion" | "spower" | "spower_csp" | "spower_cont";
export const ExamplePrograms = {
  quasiquote,
  runtime_evaluation,
  runtime_evaluation_csp,
  scope_extrusion,
  ill_staged_variable,
  fib,
  spower,
  spower_csp,
  spower_cont
};
