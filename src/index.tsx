import { useExplorerPlugin } from "@graphiql/plugin-explorer";
import { GraphiQLProvider } from "@graphiql/react";
import {
  type Storage as GraphiQLStorage,
  CreateFetcherOptions,
  createGraphiQLFetcher,
} from "@graphiql/toolkit";
import { useState } from "react";

import { GraphiQLInterface, GraphiQLToolbar } from "./GraphiQLInterface";

import "@graphiql/react/font/fira-code.css";
import "@graphiql/plugin-explorer/dist/style.css";
//
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
export interface GraphProtocolGraphiQLProps {
  fetcher: GraphProtocolGraphiQL.FetcherOptions;
  defaultQuery?: string;
  storage: GraphiQLStorage;
}

export function GraphProtocolGraphiQL({
  fetcher: fetcherOptions,
  defaultQuery,
  storage,
}: GraphProtocolGraphiQLProps) {
  const [fetcher] = useState(() => createGraphiQLFetcher(fetcherOptions));
  const [query, setQuery] = useState(defaultQuery);
  const explorerPlugin = useExplorerPlugin({
    query,
    onEdit: setQuery,
    storage,
  });

  return (
    <GraphiQLProvider
      fetcher={fetcher}
      query={query}
      storage={storage}
      plugins={[explorerPlugin]}
    >
      <GraphiQLInterface
        editorTheme="graphula"
        onEditQuery={setQuery}
        isHeadersEditorEnabled={false}
      >
        {TOOLBAR_HIDDEN}
      </GraphiQLInterface>
    </GraphiQLProvider>
  );
}

export declare namespace GraphProtocolGraphiQL {
  export interface FetcherOptions extends CreateFetcherOptions {}
  export interface Storage extends GraphiQLStorage {}
}

//

declare namespace OldTypes {
  type SavedQuery = {
    id: string;
    name: string;
    query: string;
    default?: boolean;
    subgraphId?: number;
    versionId?: string;
  };

  export interface GraphiQLProps {
    fetcher?: (graphQLParams: any) => Promise<any>;
    schema?: any;
    query?: string;
    variables?: string;
    operationName?: string;
    response?: string;
    storage?: {
      getItem: (key: string) => any;
      setItem: (key: string, value: any) => void;
      removeItem: (key: string) => void;
    };
    defaultQuery?: string;
    onEditQuery?: () => void;
    onEditVariables?: () => void;
    onEditOperationName?: () => void;
    onToggleDocs?: () => void;
    getDefaultFieldNames?: () => void;
    editorTheme?: string;
    onToggleHistory?: () => void;
    ResultsTooltip?: any;
    defaultTypeOrField?: string;
    savedQueries?: Array<SavedQuery>;
    handleUpdateQuery?: (query: SavedQuery) => Promise<SavedQuery>;
    handleCreateQuery?: (query: SavedQuery) => Promise<SavedQuery>;
    handleSelectedAction?: (id: number, value: string) => void;
    isActionsMenuOpen?: boolean;
    handleSelectQuery?: (name: string) => void;
    selectedQueryName?: any;
    isOwner?: boolean;
    docExplorerClosed?: boolean;
    from?: string;
    hideSnackbar?: boolean;
  }
}
