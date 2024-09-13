export function filter<K, V>(
  a: Readonly<Map<K, V>>,
  f: (v: V) => boolean
): Readonly<Map<K, V>> {
  const ea = Array.from(a.entries())
  const eb = ea.filter(([, v]) => f(v))
  return new Map<K, V>(eb)
}
