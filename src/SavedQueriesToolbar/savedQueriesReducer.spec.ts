import { savedQueriesReducer as reducer } from './savedQueriesReducer'

const { initialState } = reducer

describe(reducer, () => {
  beforeAll(() => setLocationHref('https://playground.test'))

  const queries = [
    { id: 101, name: 'Query 1', query: '{ one }' },
    { id: 102, name: 'Query 2', query: '{ two }' },
    { id: 103, name: 'Query 3', query: '{ three }' },
  ]

  it('has initialized set to true after "init"', () => {
    expect(initialState.initialized).toBe(false)
    const result = reducer(initialState, { type: 'init', payload: queries })
    expect(result.initialized).toBe(true)
  })

  it('has default query selected after "init"', () => {
    for (let i = 0; i < queries.length; i++) {
      const payload = queries.map((q, j) => ({ ...q, isDefault: i === j }))
      const state = reducer(initialState, { type: 'init', payload })
      expect(state.currentId).toBe(queries[i].id)
    }
  })

  it('has currentId === null, if there are no queries', () => {
    const state = reducer(initialState, { type: 'init', payload: [] })
    expect(state.currentId).toBeNull()
  })

  // There should always be a default query, but I don't want to crash the UI
  // if we can gracefully fallback here.
  it('has the first query selected, if there is no default query', () => {
    const state = reducer(initialState, { type: 'init', payload: queries })
    expect(state.currentId).toBe(queries[0].id)
  })

  it('changes current query after "select"', () => {
    let state = reducer(initialState, { type: 'init', payload: queries })
    for (let i = 0; i < queries.length; i++) {
      const id = queries[i].id
      state = reducer(state, { type: 'select', payload: id })
      expect(state.currentId).toBe(id)
    }
  })

  it('adds and selects new query after "create"', () => {
    let state = reducer(initialState, { type: 'init', payload: queries })
    const query4 = { id: 204, name: 'Query 4', query: '{ four }' }
    const query5 = { id: 205, name: 'Query 5', query: '{ five }' }

    state = reducer(state, { type: 'create', payload: query4 })
    expect(state.queries).toEqual([...queries, query4])
    expect(state.currentId).toBe(query4.id)

    state = reducer(state, { type: 'create', payload: query5 })
    expect(state.queries).toEqual([...queries, query4, query5])
    expect(state.currentId).toBe(query5.id)
  })

  it('merges query after "update"', () => {
    let state = reducer(initialState, { type: 'init', payload: queries })

    state = reducer(state, { type: 'update', payload: { id: 101, name: 'Updated Query 1' } })
    expect(state.queries).toEqual([{ id: 101, name: 'Updated Query 1', query: '{ one }' }, queries[1], queries[2]])

    state = reducer(state, { type: 'update', payload: { id: 103, query: '{ updated three }' } })
    expect(state.queries).toEqual([
      { id: 101, name: 'Updated Query 1', query: '{ one }' },
      queries[1],
      { id: 103, name: 'Query 3', query: '{ updated three }' },
    ])
  })

  // What query gets selected is an implementation detail, we just care that
  // something else than the removed query is selected.
  it('selects another query after "delete"', () => {
    let state = reducer(initialState, { type: 'init', payload: queries })

    state = reducer(state, { type: 'delete', payload: 101 })
    expect(state.currentId).toBe(102)
    expect(state.queries).toEqual([queries[1], queries[2]])

    state = reducer(state, { type: 'delete', payload: 102 })
    expect(state.currentId).toBe(103)
    expect(state.queries).toEqual([queries[2]])
  })

  it('reads and removes the query id from search params', () => {
    setLocationHref('https://playground.test/?playgroundQuery=123')

    const replaceState = jest.fn()
    globalThis.window.history = { replaceState } as any

    let state = reducer(initialState, { type: 'init', payload: [...queries, { id: 123, query: '', name: '' }] })
    expect(state.currentId).toBe(123)

    expect(replaceState).toHaveBeenCalledWith({}, '', 'https://playground.test/')
  })
})

function setLocationHref(href: string) {
  ;(globalThis as any).window = {
    location: { href },
  } as Window
}
