type F1<A, B> = (_a: A) => B
type F2<A, B, C> = (_a: A, _b: B) => C
type F3<A, B, C, D> = (_a: A, _b: B, _c: C) => D
type F4<A, B, C, D, E> = (_a: A, _b: B, _c: C, _d: D) => E

type MF1<A> = F1<A, A>
type MF2<A> = F2<A, A, A>
type MF3<A, T> = F3<A, A, T, A>
type MF4<A, T1, T2> = F4<A, A, T1, T2, A>

type C1<A, B> = F1<A, B> // a => b
type C2<A, B, C> = (_a: A) => C1<B, C> // a => b => c
type C3<A, B, C, D> = (_a: A) => C2<B, C, D> // a => b => c => d
type C4<A, B, C, D, E> = (_a: A) => C3<B, C, D, E> // a => b => c => d => e

type MC1<A> = C1<A, A> // a => a
type MC2<A> = C2<A, A, A> // a => a => a
type MC3<A, T> = C3<T, A, A, A> // t => a => a => a
type MC4<A, T1, T2> = C4<T2, T1, A, A, A> // t2 => t1 => a => a => a

function F1ToC1<A, B>(f: F1<A, B>): C1<A, B> {
  return function (a: A) {
    return f(a)
  }
}

function F2ToC2<A, B, C>(f: F2<A, B, C>): C2<A, B, C> {
  return function (a: A) {
    return function (b: B) {
      return f(a, b)
    }
  }
}

function F3ToC3<A, B, C, D>(f: F3<A, B, C, D>): C3<A, B, C, D> {
  return function (a: A) {
    return function (b: B) {
      return function (c: C) {
        return f(a, b, c)
      }
    }
  }
}

function F4ToC4<A, B, C, D, E>(f: F4<A, B, C, D, E>): C4<A, B, C, D, E> {
  return function (a: A) {
    return function (b: B) {
      return function (c: C) {
        return function (d: D) {
          return f(a, b, c, d)
        }
      }
    }
  }
}

export { F1ToC1, F2ToC2, F3ToC3, F4ToC4 }

function MF1ToMC1<A>(f: MF1<A>): MC1<A> {
  return function (a: A) {
    return f(a)
  }
}

function MF2ToMC2<A>(f: MF2<A>): MC2<A> {
  return function (b: A) {
    return function (a: A) {
      return f(a, b)
    }
  }
}

function MF3ToMC3<A, T>(f: MF3<A, T>): MC3<A, T> {
  return function (t: T) {
    return function (b: A) {
      return function (a: A) {
        return f(a, b, t)
      }
    }
  }
}

function MF4ToMC4<A, T1, T2>(f: MF4<A, T1, T2>): MC4<A, T1, T2> {
  return function (t2: T2) {
    return function (t1: T1) {
      return function (b: A) {
        return function (a: A) {
          return f(a, b, t1, t2)
        }
      }
    }
  }
}

export { MF1ToMC1, MF2ToMC2, MF3ToMC3, MF4ToMC4 }
