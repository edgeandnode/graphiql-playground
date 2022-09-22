import { createContext, Dispatch, ReactNode, SetStateAction, useContext } from 'react'

import { SavedQuery } from './types'

export interface SavedQueriesContext<TQuery extends SavedQuery> {
  queries: readonly TQuery[]
  currentQueryId: TQuery['id'] | null
  querySource: string
  setQuerySource: Dispatch<SetStateAction<string>>
}

const SavedQueriesContext = createContext<SavedQueriesContext<SavedQuery>>({
  currentQueryId: '',
  queries: [],
  querySource: '',
  setQuerySource: () => {},
})

export function useSavedQueriesContext<TQuery extends SavedQuery>() {
  return useContext(SavedQueriesContext) as SavedQueriesContext<TQuery>
}

export function SavedQueriesContextProvider<TQuery extends SavedQuery>(props: {
  value: SavedQueriesContext<TQuery>
  children: ReactNode
}) {
  return <SavedQueriesContext.Provider {...props} />
}
