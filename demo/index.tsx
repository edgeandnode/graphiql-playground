import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";

import { ThemeProvider } from "@edgeandnode/components";

import { GraphProtocolGraphiQL } from "../src";
import { SavedQuery } from "../src/SavedQueriesToolbar/types";

// #region utils

const counter = (() => {
  let value = 0;
  return () => value++;
})();

// #endregion utils

const url =
  "https://api.thegraph.com/subgraphs/name/graphprotocol/graph-network-mainnet-staging";

const DEFAULT_QUERY_STR = `\
{
  subgraphs(first: 5, orderBy: createdAt, orderDirection: desc) {
    displayName
  }
}`;

const defaultQuery = {
  id: counter(),
  name: "Subgraph Names",
  query: DEFAULT_QUERY_STR,
  isDefault: true,
};

function Demo() {
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>(() => [
    defaultQuery,
    {
      id: counter(),
      name: "Schema Types",
      query: "query GetSchemaTypes { __schema { queryType { name } } }",
    },
  ]);

  return (
    <GraphProtocolGraphiQL
      fetcher={{ url }}
      queries={savedQueries}
      currentQueryId={defaultQuery.id}
      header={
        <GraphProtocolGraphiQL.SavedQueriesToolbar
          isMobile={false}
          isOwner={true}
          onCreateQuery={async ({ name, query }) => {
            const newQuery: SavedQuery = {
              id: counter(),
              name,
              query,
            };
          }}
          onEditQuery={() => {}}
          onDeleteQuery={async () => {}}
          onSelectQuery={() => {}}
          onSetQueryAsDefault={async () => {}}
          onUpdateQuery={async ({ id, name, query }) => {}}
          showActions
        />
      }
    />
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <Demo />
    </ThemeProvider>
  </StrictMode>
);
