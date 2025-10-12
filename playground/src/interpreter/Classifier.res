type t =
  | Initial
  | Named(string)
  | Generated(int)

module Source = {
  type t = int

  let counter = ref(0)
  @genType
  let reset = () => counter := 0
  let fresh = () => {
    counter := counter.contents + 1
    Generated(counter.contents)
  }
}
module Cmp = Belt.Id.MakeComparableU({
  type t = t
  let cmp = (a, b) =>
    switch (a, b) {
    | (Initial, Initial) => 0
    | (Initial, _) => -1
    | (_, Initial) => 1
    | (Named(nameA), Named(nameB)) => Pervasives.compare(nameA, nameB)
    | (Named(_), Generated(_)) => -1
    | (Generated(_), Named(_)) => 1
    | (Generated(idA), Generated(idB)) => Pervasives.compare(idA, idB)
    }
})

let eq = (a: t, b: t): bool => {
  Belt.Id.getCmpInternal(Cmp.cmp)(a, b) == 0
}

let toString = (cls: t): string => {
  switch cls {
  | Initial => "!"
  | Named(name) => name
  | Generated(id) => `#${id->Int.toString}`
  }
}
