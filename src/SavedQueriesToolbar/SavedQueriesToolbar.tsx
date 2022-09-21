/** @jsxImportSource theme-ui */

import { useEditorContext } from "@graphiql/react";
import { useContext, useState } from "react";

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
    "onCreateQuery" | "onUpdateQuery"
  > {
  onSelectQuery: (queryId: TQuery["id"]) => void;
  onEditQuery: (querySource: string) => void;

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
  const { currentQueryId, queries } = useSavedQueriesContext<TQuery>();
  const { queryEditor } = useEditorContext()!;

  const currentQuery =
    queries.find((query) => query.id === currentQueryId) ||
    queries[0] ||
    EMPTY_QUERY;

  const [isNewQuery, setIsNewQuery] = useState(false);
  const [newQueryNameDraft, setNewQueryNameDraft] = useState("");
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
        if (currentQuery.isDefault) {
          setQueryDeletionPending(false);
          setSnackbarMessage("error-deleteDefault");
          return;
        }
        setSnackbarMessage("success-delete");
        return;

      case "New query":
        setIsNewQuery(true);
        props.onEditQuery("");
    }
  };

  return (
    <Flex
      direction="row"
      gap={Spacing["2px"]}
      sx={{
        "*": {
          boxSizing: "border-box",
        },
        pl: Spacing["8px"],
      }}
    >
      <SavedQuerySelect
        queries={queries}
        selectedQueryName={currentQuery.name}
        isDefaultQuery={currentQuery.isDefault}
        onMenuItemClick={(queryId) => props.onSelectQuery(queryId)}
        onChangeQueryName={(value) => setNewQueryNameDraft(value)}
      />
      <div sx={{ flex: 1, flexBasis: 0 }} />
      {props.isOwner && !props.isMobile && (
        <SavedQueriesActionButtons<TQuery>
          isNewQuery={isNewQuery}
          currentQuery={currentQuery}
          queries={queries}
          setSnackbarMessage={setSnackbarMessage}
          currentQueryId={currentQueryId}
          newQueryNameDraft={newQueryNameDraft}
          setNewQueryNameDraft={setNewQueryNameDraft}
          setIsNewQuery={setIsNewQuery}
          onCreateQuery={props.onCreateQuery}
          onUpdateQuery={props.onUpdateQuery}
        />
      )}
      {props.isOwner && !props.isMobile && (
        <ActionsMenu<QueryAction>
          actions={["Share", "Set as default", "Delete", "New query"]}
          onSelect={(action) => void handleActionSelected(action)}
        />
      )}
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
