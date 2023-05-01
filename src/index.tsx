import { GraphiQLProvider } from '@graphiql/react'
import { CreateFetcherOptions, createGraphiQLFetcher, type Storage as GraphiQLStorage } from '@graphiql/toolkit'
import { GraphQLSchema } from 'graphql'
import { ReactNode, useEffect, useMemo, useState } from 'react'

import { useExplorerPlugin } from './plugins/explorer/useExplorerPlugin'
import { SavedQuery } from './SavedQueriesToolbar/types'
import { GraphiQLInterface, GraphiQLToolbar } from './GraphiQLInterface'
import {
  SavedQueriesContext,
  SavedQueriesContextProvider,
  SavedQueriesToolbar,
  ToastMessage as _ToastMessage,
} from './SavedQueriesToolbar'
import { extendFetcherWithValidations } from './validations'

import '@graphiql/react/font/fira-code.css'
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
  graphqlValidations?: boolean
}

export function GraphProtocolGraphiQL<TQuery extends SavedQuery>({
  fetcher: fetcherOptions,
  storage,
  header,
  currentQueryId,
  queries,
  defaultQuery = '',
  className,
  graphqlValidations = true,
}: GraphProtocolGraphiQLProps<TQuery>) {
  const [schema, setSchema] = useState<GraphQLSchema | undefined>(
    // `undefined` will trigger introspection for the schema when given to `GraphiQLProvider`
    undefined,
  )

  const fetcher = useMemo(() => {
    const rawFetcher = createGraphiQLFetcher(fetcherOptions)

    return graphqlValidations ? extendFetcherWithValidations(schema, rawFetcher) : rawFetcher
  }, [fetcherOptions, graphqlValidations, schema])

  const currentSavedQuery = queries.find((query) => currentQueryId && query.id.toString() === currentQueryId.toString())
  const [querySource, setQuerySource] = useState(currentSavedQuery?.query || defaultQuery)

  // Whenever currentQueryId changes, we update the text in CodeMirror.
  useEffect(() => {
    if (currentQueryId) setQuerySource(currentSavedQuery?.query || '')
    // We don't refresh the editor on changes to currentSavedQuery.query,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQueryId])

  const explorerPlugin = useExplorerPlugin({ showAttribution: false })

  return (
    <GraphiQLProvider
      fetcher={fetcher}
      query={querySource}
      storage={storage}
      plugins={[explorerPlugin]}
      schema={schema}
      onSchemaChange={setSchema}
    >
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
