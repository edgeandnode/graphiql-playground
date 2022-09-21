import { createContext, ReactNode, useContext } from "react";

import { SavedQuery } from "./types";

export interface SavedQueriesContext<TQuery extends SavedQuery> {
  queries: TQuery[];
  currentQueryId: TQuery["id"];
}

const SavedQueriesContext = createContext<SavedQueriesContext<SavedQuery>>({
  currentQueryId: "",
  queries: [],
});

export function useSavedQueriesContext<TQuery extends SavedQuery>() {
  return useContext(SavedQueriesContext) as SavedQueriesContext<TQuery>;
}

export function SavedQueriesContextProvider<TQuery extends SavedQuery>(props: {
  value: SavedQueriesContext<TQuery>;
  children: ReactNode;
}) {
  return <SavedQueriesContext.Provider {...props} />;
}
