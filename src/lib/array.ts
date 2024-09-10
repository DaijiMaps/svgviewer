import { ImmutableShallow } from './utils'

export type ReallyReadonlyArray<T> = ImmutableShallow<ReadonlyArray<T>>
