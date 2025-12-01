@genType
type rec t = int

module Source = {
  type t = int

  let counter = ref(0)
  @genType
  let reset = () => counter := 0
}

let alloc = (): int => {
  Source.counter := Source.counter.contents + 1

  Source.counter.contents
}

let toString = l => {
    `#loc_${l->Int.toString}`
}

module Cmp = Belt.Id.MakeComparableU({
  type t = t
  let cmp = (a: t, b: t) => {
    Pervasives.compare(a, b)
  }
})
