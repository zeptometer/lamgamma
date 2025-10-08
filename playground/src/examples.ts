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
let rec fib = (n:int):int => {
  if n <= 1
  then 1
  else fib(n - 1) + fib(n - 2)
} in
fib 20
`.trim();

const runtime_evaluation_csp =
  `
let x = 3 in
let y = \`{ 1 + x } in
~0{ y }
`.trim();

const nested_quote =
`
let x = \`{1} in
\`{\`{~2{x}}}
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
\`{
  let power11 = ~{ spower 11 } in
  power11 2
}
`.trim();

const spower_sqr = `
\`{
  let sqr = (fn y -> y * y) in ~{
    let spower_ = (fix self -> fn n x ->
    if n == 0 then \`{ 1 }
    else if (n mod 2) == 0 then
        \`{sqr ~{self (n / 2)  x}}
    else
        \`{~{x} * ~{self (n-1) x}}
    ) in
    let spower = (fn n -> \`{fn x -> ~{ spower_ n \`{ x } }}) in
    \`{
      let power11 = ~{ spower 11 } in
      power11 2
    }
  }
}

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

const gibonacci = `
let nil = 0 in
let empty_memo = fn idx fail ok -> fail nil in
let ext_memo = fn memo newidx newval ->
  fn idx fail ok ->
    if idx == newidx
    then (ok newval)
    else (memo idx fail ok) in
let gibonacci_st_ = fix self ->
  fn memo n m1 m2 k ->
    memo n
      (fn _ ->
        if n == 0 then k (ext_memo memo 0 m1) m1
        else if n == 1 then k (ext_memo memo 1 m2) m2
        else
        self memo (n - 1) m1 m2
          (fn memo1 v1 ->
            self memo1 (n - 2) m1 m2
              (fn memo2 v2 ->
              \`{
                let x3 = ~{ v1 } + ~{ v2 } in
                ~{ k (ext_memo memo2 n \`{ x3 }) \`{ x3 } }
              })))
      (fn v -> k memo v) in
let gibonacci_st = fn n -> \`{ fn x y ->
  ~{ gibonacci_st_ empty_memo n \`{ x } \`{ y } (fn memo x -> x) }
} in
\`{
  let gibonacci_10 = ~{ gibonacci_st 10 } in
  gibonacci_10 1 1
}
`.trim();

export type Example = "fib" | "quasiquote" | "runtime_evaluation" | "runtime_evaluation_csp" |
 "nested_quote" | "ill_staged_variable" |  "scope_extrusion" | "spower" | "spower_sqr" | "spower_cont" |
 "gibonacci";
export const ExamplePrograms = {
  fib
};
