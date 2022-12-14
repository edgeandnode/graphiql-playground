import { useExplorerPlugin } from '@graphiql/plugin-explorer'
import { GraphiQLProvider } from '@graphiql/react'
import { type Storage as GraphiQLStorage, CreateFetcherOptions, createGraphiQLFetcher } from '@graphiql/toolkit'
import { ReactNode, useEffect, useState } from 'react'

import { SavedQuery } from './SavedQueriesToolbar/types'
import { GraphiQLInterface, GraphiQLToolbar } from './GraphiQLInterface'
import {
  SavedQueriesContext,
  SavedQueriesContextProvider,
  SavedQueriesToolbar,
  ToastMessage as _ToastMessage,
} from './SavedQueriesToolbar'

import '@graphiql/react/font/fira-code.css'
import '@graphiql/plugin-explorer/dist/style.css'
//
// TODO: Should those two be merged?
import './graphiql-styles.css'
import './style-overrides.css'
import './graphiql-react-properties.css'
import './syntax-highlighting.css'

// Temporary?
const TOOLBAR_HIDDEN = (
  <GraphiQLToolbar>
    <div />
    {/* Toolbar button tooltips are currently broken because of our global styles. */}
    {/* Toolbar actions keyboard shortcuts don't work. */}
  </GraphiQLToolbar>
)

/**
 * @see https://graphiql-test.netlify.app/typedoc/modules/graphiql.html#graphiqlprops
 */
export interface GraphProtocolGraphiQLProps<TQuery extends SavedQuery>
  extends Pick<SavedQueriesContext<TQuery>, 'queries' | 'currentQueryId'> {
  fetcher: GraphProtocolGraphiQL.FetcherOptions
  storage?: GraphiQLStorage
  /** used for initial state if ther eare no savedQueries  */
  defaultQuery?: string
  /** slot for GraphProtocolGraphiQL.SavedQueriesToolbar */
  header?: ReactNode
  className?: string
}

export function GraphProtocolGraphiQL<TQuery extends SavedQuery>({
  fetcher: fetcherOptions,
  storage,
  header,
  currentQueryId,
  queries,
  defaultQuery = '',
  className,
}: GraphProtocolGraphiQLProps<TQuery>) {
  const [fetcher] = useState(() => createGraphiQLFetcher(fetcherOptions))
  const currentSavedQuery = queries.find((query) => currentQueryId && query.id.toString() === currentQueryId.toString())

  const [querySource, setQuerySource] = useState(currentSavedQuery?.query || defaultQuery)

  // Whenever currentQueryId changes, we update the text in CodeMirror.
  useEffect(() => {
    if (currentQueryId) setQuerySource(currentSavedQuery?.query || '')
    // We don't refresh the editor on changes to currentSavedQuery.query,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQueryId])

  const explorerPlugin = useExplorerPlugin({
    query: querySource,
    onEdit: setQuerySource,
    storage,
  })

  return (
    <GraphiQLProvider fetcher={fetcher} query={querySource} storage={storage} plugins={[explorerPlugin]}>
      <SavedQueriesContextProvider<TQuery>
        value={{
          currentQueryId,
          queries,
          setQuerySource,
        }}
      >
        <GraphiQLInterface
          editorTheme="graphula"
          isHeadersEditorEnabled={false}
          isVariablesEditorEnabled={false}
          header={header}
          className={className}
        >
          {TOOLBAR_HIDDEN}
        </GraphiQLInterface>
      </SavedQueriesContextProvider>
    </GraphiQLProvider>
  )
}

GraphProtocolGraphiQL.SavedQueriesToolbar = SavedQueriesToolbar

export declare namespace GraphProtocolGraphiQL {
  export interface FetcherOptions extends CreateFetcherOptions {}
  export interface Storage extends GraphiQLStorage {}
  export interface ToastMessage extends _ToastMessage {}
}

export { savedQueriesReducer } from './SavedQueriesToolbar'
export * from './SavedQueriesToolbar/types'
