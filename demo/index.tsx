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

const SCHEMA_TYPES_QUERY_STR = `\
query GetSchemaTypes {
  __schema {
    queryType { name }
  }
}`;

const initialQueries = [
  {
    name: "Subgraph Names",
    query: DEFAULT_QUERY_STR,
    isDefault: true,
  },
  {
    name: "Schema Types",
    query: SCHEMA_TYPES_QUERY_STR,
  },
].map((x, i) => ({
  id: `${i}`,
  ...x,
}));

function Demo() {
  const [currentQueryId, setCurrentQueryId] = useState<SavedQuery["id"] | null>(
    initialQueries[0].id
  );
  const [savedQueries, setSavedQueries] =
    useState<SavedQuery[]>(initialQueries);

  console.log(">> currentQueryId", currentQueryId);

  return (
    <GraphProtocolGraphiQL
      fetcher={{ url }}
      queries={savedQueries}
      currentQueryId={currentQueryId}
      header={
        <GraphProtocolGraphiQL.SavedQueriesToolbar
          isMobile={false}
          isOwner={true}
          onSelectQuery={(queryId) => {
            console.log("onSelectQuery", queryId);
            setCurrentQueryId(queryId);
          }}
          onSaveAsNewQuery={async ({ name, query }) => {
            const newQuery: SavedQuery = {
              id: counter(),
              name,
              query,
            };

            setSavedQueries((queries) => [...queries, newQuery]);
          }}
          onDeleteQuery={async () => {}}
          onSetQueryAsDefault={async () => {
            setSavedQueries((queries) =>
              queries.map((q) => ({ ...q, isDefault: q.id === currentQueryId }))
            );
          }}
          onUpdateQuery={async ({ name, query }) => {
            setSavedQueries((qs) =>
              qs.map((q) =>
                q.id === currentQueryId ? { ...q, name, query } : q
              )
            );
          }}
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
