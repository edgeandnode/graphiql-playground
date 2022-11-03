import { pluckQueryIdFromUrl } from './queryInSearchParams'
import { SavedQuery } from './types'

interface SavedQueriesState<TQuery extends SavedQuery> {
  queries: TQuery[]
  currentId: TQuery['id'] | null
  loading: boolean
}
type SavedQueriesAction<TQuery extends SavedQuery> =
  | { type: 'init'; payload: TQuery[] }
  | { type: 'select'; payload: TQuery['id'] | null }
  | { type: 'delete'; payload: TQuery['id'] }
  | { type: 'update'; payload: Partial<TQuery> & { id: TQuery['id'] } }
  | { type: 'create'; payload: TQuery }

export const savedQueriesReducer = <TQuery extends SavedQuery>(
  s: SavedQueriesState<TQuery>,
  a: SavedQueriesAction<TQuery>,
): SavedQueriesState<TQuery> => {
  switch (a.type) {
    case 'create':
      return {
        ...s,
        queries: [...s.queries, a.payload],
        currentId: a.payload.id,
      }
    case 'update':
      return {
        ...s,
        queries: s.queries.map((q) => (q.id === a.payload.id ? { ...q, ...a.payload } : q)),
      }
    case 'delete': {
      const queries = s.queries.filter((q) => q.id !== a.payload)
      return { ...s, queries, currentId: queries[0]?.id ?? null }
    }
    case 'select':
      return { ...s, currentId: a.payload }
    case 'init': {
      const queries = a.payload
      const defaultQuery = queries.find((q) => q.isDefault)
      let current = defaultQuery || queries[0]

      // hack: this shouldn't be in a reducer
      const queryIdFromSearchParams = pluckQueryIdFromUrl()
      if (queryIdFromSearchParams) {
        current = current || queries.find((q) => q.id.toString() === queryIdFromSearchParams)
      }

      return { ...s, queries: a.payload, currentId: current?.id ?? null }
    }
    default:
      const _exhaustive: never = a
      return s
  }
}

const savedQueriesInitialState: SavedQueriesState<SavedQuery> = { queries: [], currentId: null, loading: true }

savedQueriesReducer.initialState = savedQueriesInitialState

export declare namespace savedQueriesReducer {
  export type State<TQuery extends SavedQuery> = SavedQueriesState<TQuery>
  export type Action<TQuery extends SavedQuery> = SavedQueriesAction<TQuery>
}
