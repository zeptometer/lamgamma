@genType
type rec t = Raw({name: string})

module Cmp = Belt.Id.MakeComparableU({
  type t = t
  let cmp = (Raw({name: nameA}), Raw({name: nameB})) => { Pervasives.compare(nameA, nameB) }
})
