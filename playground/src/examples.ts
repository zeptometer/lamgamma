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
let rec pow1 = [g1:>!](n:int, xq:<int@g1>):<int@g1> => {
  if n == 0 then
    \`{@g1 1 }
  else if n == 1 then
    xq
  else
    \`{@g1 ~{ xq } * ~{ pow1^g1 (n-1) xq } }
} in
let pow = (n:int):<int->int@!> => {
  \`{@! (x:int@g2) => { ~{ pow1^g2 n \`{@g2 x } } } }
} in
pow 4
`.trim();

const spower_sqr_run = `
let sqr@g1 = (y:int) => { y * y } in
let rec spower_ = [h1:>g1](n:int, xq:<int@h1>):<int@h1> => {
  if n == 0 then \`{@h1 1 }
  else if (n mod 2) == 0 then
    \`{@h1 sqr ~{ spower_^h1 (n / 2) xq } }
  else
    \`{@h1 ~{xq} * ~{ spower_^h1 (n - 1) xq } }
} in
let spower = (n:int) => {
  \`{@g1 (x:int@g2) => {
           ~{ spower_^g2 n \`{@g2 x } }
         }
  }
} in
let spower11:<int->int@g1> = spower 11 in
~0{spower11} 2
`.trim();

const spower_cont = `
let rec spower_ = [g1:>!](
    n:int,
    xq:<int@g1>,
    cont:[g2:>g1](<int@g2>-><int@g2>)
  ): <int@g1> => {
  if n == 0 then
    cont^g1 \`{@g1 1 }
  else if n == 1 then
    cont^g1 xq
  else if n mod 2 == 1 then
    spower_^g1
      (n - 1)
      xq
      [h:>g1](yq:<int@h>) => {
        cont^h \`{@h ~{ xq } * ~{ yq } }
      }
  else
    \`{@g1
      let x2@g3 = ~{ xq } * ~{ xq } in
      ~{
        spower_^g3
          (n / 2)
          \`{@g3 x2 }
          [h:>g3](yq:<int@h>) => {cont^h yq}
      }
    }
} in

let spower = (n:int) => {
  \`{@!
     (x:int@g4) => {
       ~{ spower_^g4 n \`{@g4 x } [h:>g4](y:<int@h>)=>{y} }
     }
   }
} in

\`{@!
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
  spower,
  spower_sqr_run,
  spower_cont
};
