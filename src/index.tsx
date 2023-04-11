import { useExplorerPlugin } from '@graphiql/plugin-explorer'
import { GraphiQLProvider } from '@graphiql/react'
import {
  type Storage as GraphiQLStorage,
  CreateFetcherOptions,
  createGraphiQLFetcher,
  Fetcher,
} from '@graphiql/toolkit'
import { GraphQLError, GraphQLSchema, parse, validate } from 'graphql'
import { ReactNode, useEffect, useMemo, useState } from 'react'

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
  graphqlValidations?: boolean
}

function extendFetcherWithValidations(schema: GraphQLSchema | undefined, fetcher: Fetcher): Fetcher {
  return (...[params, opts]: Parameters<Fetcher>): ReturnType<Fetcher> => {
    if (params.operationName === 'IntrospectionQuery' || schema === undefined) {
      return fetcher(params, opts)
    }

    try {
      const documentNode = parse(params.query)
      const validationErrors = validate(schema, documentNode)

      if (validationErrors.length > 0) {
        return {
          data: null,
          extensions: {
            warning:
              'The Graph will soon start returning validation errors for GraphQL queries. Please fix the errors in your queries. For more information: https://thegraph.com/docs/en/release-notes/graphql-validations-migration-guide',
          },
          errors: validationErrors,
        }
      }

      return fetcher(params, opts)
    } catch (e) {
      return {
        data: null,
        errors: [e as GraphQLError],
      }
    }
  }
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

  const explorerPlugin = useExplorerPlugin({
    query: querySource,
    onEdit: setQuerySource,
    showAttribution: false,
  })

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
