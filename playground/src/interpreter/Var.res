@genType
type rec t =
  | Raw({name: string})
  | Colored({name: string, id: int})

module Source = {
  type t = int

  let counter = ref(0)
  @genType
  let reset = () => counter := 0
}

let color = var => {
  Source.counter := Source.counter.contents + 1

  let name = switch var {
  | Raw({name}) => name
  | Colored({name}) => name
  }

  Colored({name, id: Source.counter.contents})
}

module Cmp = Belt.Id.MakeComparableU({
  type t = t
  let cmp = (a: t, b: t) => {
    switch (a, b) {
    | (Raw({name: nameA}), Raw({name: nameB})) => Pervasives.compare(nameA, nameB)
    | (Raw(_), Colored(_)) => -1
    | (Colored(_), Raw(_)) => 1
    | (Colored({name: nameA, id: idA}), Colored({name: nameB, id: idB})) =>
      if nameA == nameB {
        Pervasives.compare(idA, idB)
      } else {
        Pervasives.compare(nameA, nameB)
      }
    }
  }
})
