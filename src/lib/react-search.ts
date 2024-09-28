import { Info } from './config'
import { Vec } from './vec'

export interface UseSearchProps {
  getInfo: (p: Vec, info: Info) => void
}

export function useSearch() {
  //const [search, searchSend, searchRef] = useMachine(searchMachine)
  //return { search, searchSend, searchRef }
}
