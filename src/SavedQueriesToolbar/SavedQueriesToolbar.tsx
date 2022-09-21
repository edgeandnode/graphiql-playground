/** @jsxImportSource theme-ui */

import { useEditorContext } from "@graphiql/react";
import { useContext, useEffect, useState } from "react";

import {
  Flex,
  Grid,
  NewGDSButton as Button,
  Spacer,
  Spacing,
} from "@edgeandnode/components";

import { ActionsMenu } from "./ActionsMenu";
import { classNames } from "./lib";
import {
  SavedQueriesActionButtons,
  SavedQueriesActionButtonsProps,
} from "./SavedQueriesActionButtons";
import {
  SavedQueriesContext,
  useSavedQueriesContext,
} from "./SavedQueriesContext";
import {
  SavedQueriesSnackbar,
  SnackbarMessageType,
} from "./SavedQueriesSnackbar";
import { SavedQuerySelect } from "./SavedQuerySelect";
import type { SavedQuery } from "./types";

const EMPTY_QUERY: SavedQuery = {
  id: "",
  name: "",
  query: "",
};

type QueryAction = "Set as default" | "Delete" | "Share" | "New query";

export interface SavedQueriesToolbarProps<TQuery extends SavedQuery>
  extends Pick<
    SavedQueriesActionButtonsProps<TQuery>,
    "onSaveAsNewQuery" | "onUpdateQuery"
  > {
  onSelectQuery: (queryId: TQuery["id"] | null) => void;

  onSetQueryAsDefault: () => Promise<void>;
  onDeleteQuery: () => Promise<void>;

  showActions: boolean;
  isOwner: boolean;
  /**
   * TODO: This should be a media query.
   */
  isMobile: boolean;
}

export function SavedQueriesToolbar<TQuery extends SavedQuery>(
  props: SavedQueriesToolbarProps<TQuery>
) {
  const {
    currentQueryId,
    queries,
    querySource: querySourceDraft,
    setQuerySource,
  } = useSavedQueriesContext<TQuery>();

  const findSavedQuery = (queryId: TQuery["id"] | null) => {
    // When we're editing a new query, the id is null.
    if (queryId === null) return null;
    return (
      queries.find((query) => query.id === queryId) || queries[0] || EMPTY_QUERY
    );
  };
  const currentQuery = findSavedQuery(currentQueryId);

  // potential rename state for existing queries, name for new queries.
  const [queryNameDraft, setQueryNameDraft] = useState(
    currentQuery ? currentQuery.name : ""
  );

  const [isQueryDeletionPending, setQueryDeletionPending] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<SnackbarMessageType>();

  const handleActionSelected = async (action: QueryAction) => {
    switch (action) {
      case "Share": {
        const url = window.location.href;
        await navigator.clipboard.writeText(url);
        setSnackbarMessage("success-share");
        return;
      }

      case "Set as default":
        await props.onSetQueryAsDefault().then(() => {
          setSnackbarMessage("success-setDefault");
        });
        return;

      case "Delete":
        // One can't delete a query that wasn't saved yet.
        if (!currentQuery) return;
        if (currentQuery.isDefault) {
          setQueryDeletionPending(false);
          setSnackbarMessage("error-deleteDefault");
          return;
        }
        setSnackbarMessage("success-delete");
        return;

      case "New query":
        setQueryNameDraft("New Query");
        props.onSelectQuery(null);
    }
  };

  return (
    <Flex
      direction="row"
      gap={[Spacing["4px"], Spacing["8px"]]}
      sx={{
        "*": {
          boxSizing: "border-box",
        },
        pl: Spacing["8px"],
        width: "100%",
      }}
    >
      <SavedQuerySelect
        queries={queries}
        currentQueryId={currentQueryId}
        currentQueryName={queryNameDraft}
        onMenuItemClick={(queryId) => {
          props.onSelectQuery(queryId);
          const query = findSavedQuery(queryId);

          // We won't render a select option for `null`, so this condition
          // should always be true.
          if (query) setQueryNameDraft(query.name);
        }}
        onChangeQueryName={(value) => setQueryNameDraft(value)}
      />
      {props.isOwner && !props.isMobile && (
        <SavedQueriesActionButtons<TQuery>
          currentQuery={currentQuery}
          queries={queries}
          setSnackbarMessage={setSnackbarMessage}
          queryNameDraft={queryNameDraft}
          onSaveAsNewQuery={props.onSaveAsNewQuery}
          onUpdateQuery={props.onUpdateQuery}
          querySourceDraft={querySourceDraft}
          onResetChanges={() => {
            if (!currentQuery) return;
            setQuerySource(currentQuery.query);
            setQueryNameDraft(currentQuery.name);
          }}
        />
      )}
      <div sx={{ flex: 1, flexBasis: 0 }} />
      {props.isOwner && !props.isMobile && (
        <ActionsMenu<QueryAction>
          actions={["Share", "Set as default", "Delete", "New query"]}
          onSelect={(action) => void handleActionSelected(action)}
        />
      )}
      <div sx={{ width: "4px" }} />
      <SavedQueriesSnackbar
        messageType={snackbarMessage}
        onUndoDelete={() => setQueryDeletionPending(false)}
        onClose={() => {
          // The snackbar is used as a confirmation prompt here.
          if (isQueryDeletionPending) void props.onDeleteQuery();
          setSnackbarMessage(undefined);
        }}
      />
    </Flex>
  );
}
