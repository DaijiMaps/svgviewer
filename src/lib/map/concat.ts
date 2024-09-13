export function concat<K, V>(
  a: Readonly<Map<K, V>>,
  b: Readonly<Map<K, V>>
): Readonly<Map<K, V>> {
  const ea = Array.from(a.entries())
  const eb = Array.from(b.entries())
  return new Map<K, V>([...ea, ...eb])
}
