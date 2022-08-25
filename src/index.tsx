import {
  type Storage as GraphiQLStorage,
  CreateFetcherOptions,
  createGraphiQLFetcher,
} from "@graphiql/toolkit";
import { GraphiQL } from "graphiql";
import { useState } from "react";

import "graphiql/graphiql.css";
import "./graphiql-react-properties.css";
import "./style-overrides.css";
import "./syntax-highlighting.css";

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

  return (
    <GraphiQL
      fetcher={fetcher}
      editorTheme="graphula"
      defaultQuery={defaultQuery}
      storage={storage}
    ></GraphiQL>
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
