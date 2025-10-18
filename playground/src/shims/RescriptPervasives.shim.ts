// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import $$Array from "bs-platform/lib/js/array";

export abstract class EmptyList {
  protected opaque: unknown;
}

export abstract class Cons<T> {
  protected opaque!: T;
}

export type list<T> = Cons<T> | EmptyList;

export function cons<T>(itm: T, lst: list<T>): list<T> {
  // biome-ignore lint/suspicious/noExplicitAny: intended use
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return /* :: */ [itm, lst] as any;
}

// biome-ignore lint/suspicious/noExplicitAny: intended use
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const emptyList: EmptyList = /* [] */ 0 as any;

export const fromArray = $$Array.to_list;
