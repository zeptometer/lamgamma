type t =
  | Named(string)
  | Generated(int)

module Source = {
    type t = int

    let counter = ref(0)
    @genType
    let reset = () => counter := 0
    let fresh = () => {
      counter := counter.contents + 1;
      Generated(counter.contents)
    }
}
module Decl = {
  type t = {cls: t, base: t}
}
