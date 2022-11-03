const QUERY_SEARCH_PARAMS_KEY = 'playgroundQuery'

export function createQuerySharingURL(queryId: string | number): string {
  const url = new URL(window.location.href)
  url.searchParams.set(QUERY_SEARCH_PARAMS_KEY, queryId.toString())
  return url.toString()
}

export function pluckQueryIdFromUrl(): string | null {
  const url = new URL(window.location.href)
  const queryId = url.searchParams.get(QUERY_SEARCH_PARAMS_KEY)

  if (queryId) {
    // This is in `setTimeout` because React runs `useEffect` twice in dev mode.
    setTimeout(() => {
      if (window.location.href === url.toString()) {
        url.searchParams.delete(QUERY_SEARCH_PARAMS_KEY)
        window.history.replaceState({}, '', url.toString())
      }
    }, 50)

    return queryId
  }

  return null
}
