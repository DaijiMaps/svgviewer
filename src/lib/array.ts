// https://www.npmjs.com/package/is-immutable-type

export type ImmutableShallow<T extends object> = {
  readonly [P in keyof T & {}]: T[P]
}

export type ReallyReadonlyArray<T> = ImmutableShallow<ReadonlyArray<T>>
