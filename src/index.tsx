import { useExplorerPlugin } from "@graphiql/plugin-explorer";
import { GraphiQLProvider } from "@graphiql/react";
import {
  type Storage as GraphiQLStorage,
  CreateFetcherOptions,
  createGraphiQLFetcher,
} from "@graphiql/toolkit";
import { ReactNode, useState } from "react";

import { SavedQuery } from "./SavedQueriesToolbar/types";
import { GraphiQLInterface, GraphiQLToolbar } from "./GraphiQLInterface";
import {
  SavedQueriesContext,
  SavedQueriesContextProvider,
  SavedQueriesToolbar,
} from "./SavedQueriesToolbar";

import "@graphiql/react/font/fira-code.css";
import "@graphiql/plugin-explorer/dist/style.css";
//
// TODO: Should those two be merged?
import "./graphiql-styles.css";
import "./style-overrides.css";
import "./graphiql-react-properties.css";
import "./syntax-highlighting.css";

// Temporary?
const TOOLBAR_HIDDEN = (
  <GraphiQLToolbar>
    <div />
    {/* Toolbar button tooltips are currently broken because of our global styles. */}
    {/* Toolbar actions keyboard shortcuts don't work. */}
  </GraphiQLToolbar>
);

/**
 * @see https://graphiql-test.netlify.app/typedoc/modules/graphiql.html#graphiqlprops
 */
export interface GraphProtocolGraphiQLProps<TQuery extends SavedQuery>
  extends SavedQueriesContext<TQuery> {
  fetcher: GraphProtocolGraphiQL.FetcherOptions;
  storage?: GraphiQLStorage;
  /** slot for GraphProtocolGraphiQL.SavedQueriesToolbar */
  header: ReactNode;
}

export function GraphProtocolGraphiQL<TQuery extends SavedQuery>({
  fetcher: fetcherOptions,
  storage,
  header,
  currentQueryId,
  queries,
}: GraphProtocolGraphiQLProps<TQuery>) {
  const [fetcher] = useState(() => createGraphiQLFetcher(fetcherOptions));
  const currentSavedQuery =
    queries.find((query) => query.id === currentQueryId) || queries[0];

  const [querySource, setQuerySource] = useState(currentSavedQuery.query);

  const explorerPlugin = useExplorerPlugin({
    query: querySource,
    onEdit: setQuerySource,
    storage,
  });

  return (
    <GraphiQLProvider
      fetcher={fetcher}
      query={querySource}
      storage={storage}
      plugins={[explorerPlugin]}
    >
      <SavedQueriesContextProvider<TQuery>
        value={{
          currentQueryId,
          queries,
        }}
      >
        <GraphiQLInterface
          editorTheme="graphula"
          onEditQuery={setQuerySource}
          isHeadersEditorEnabled={false}
          isVariablesEditorEnabled={false}
          header={header}
        >
          {TOOLBAR_HIDDEN}
        </GraphiQLInterface>
      </SavedQueriesContextProvider>
    </GraphiQLProvider>
  );
}

GraphProtocolGraphiQL.SavedQueriesToolbar = SavedQueriesToolbar;

export declare namespace GraphProtocolGraphiQL {
  export interface FetcherOptions extends CreateFetcherOptions {}
  export interface Storage extends GraphiQLStorage {}
}

export * from "./SavedQueriesToolbar/types";
