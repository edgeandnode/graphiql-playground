import { useState } from "react";

import { Grid, NewGDSButton as Button } from "@edgeandnode/components";

import { ActionsMenu } from "./ActionsMenu";
import { classNames } from "./lib";
import {
  SavedQueriesSnackbar,
  SnackbarMessageType,
} from "./SavedQueriesSnackbar";
import { SavedQuerySelect } from "./SavedQuerySelect";
import type { SavedQuery } from "./types";
import { validateQuery, ValidationStatus } from "./validation";

type QueryAction = "Set as default" | "Delete" | "Share" | "New query";

export interface SavedQueriesToolbarProps {
  queries: SavedQuery[];
  selectedQuery: SavedQuery;

  onCreateQuery: (info: { name: string; query: string }) => Promise<SavedQuery>;
  onUpdateQuery: (info: {
    id: string;
    name: string;
    query: string;
  }) => Promise<void>;
  // TODO: Refactor to
  // onSelectQuery: (query: SavedQuery) => void;
  onSelectQuery: (queryName: string) => void;
  onEditQuery: (querySource: string) => void;

  onSelectedAction: (
    queryId: string,
    action: "Set as default" | "Delete"
  ) => Promise<void>;

  // TODO: Consider `onSetQueryAsDefault: () => Promise<void>;` and
  //                `onDeleteQuery: () => Promise<void>;`
  // instead of onSelectAction

  showActions: boolean;
  isOwner: boolean;
  isMobile: boolean;
}

export function SavedQueriesToolbar(props: SavedQueriesToolbarProps) {
  const [isNewQuery, setIsNewQuery] = useState(false);
  const [newQueryNameDraft, setNewQueryNameDraft] = useState("");
  const [isQueryDeletionPending, setQueryDeletionPending] = useState(false);

  const [snackbarMessage, setSnackbarMessage] = useState<SnackbarMessageType>();

  const handleDelete = async () => {
    await props.onSelectedAction(props.selectedQuery.id, "Delete");
  };

  return (
    <Grid className={classNames("flex", "main-flex")}>
      <SavedQuerySelect
        queries={props.queries}
        selectedQueryName={props.selectedQuery.name}
        isDefaultQuery={props.selectedQuery.isDefault}
        onMenuItemClick={(query) => props.onSelectQuery(query.name)}
        onChangeQueryName={(value) => setNewQueryNameDraft(value)}
      />

      {props.isOwner && !props.isMobile && (
        <Grid
          className={classNames("query-actions", isNewQuery && "new-query")}
          align="center"
          sx={{
            flexWrap: "nowrap",
            justifyContent: "space-around",
          }}
        >
          {!isNewQuery && (
            <Button
              variant="secondary"
              className="action"
              onClick={(e) => {
                e.stopPropagation();

                // TODO: New query :-- this was previously in state.
                const query = "";

                const validationStatus: ValidationStatus = validateQuery({
                  name: props.selectedQuery.name,
                  updatedId: props.selectedQuery.id,
                  queries: props.queries,
                  query,
                });

                if (validationStatus !== "valid") {
                  setSnackbarMessage(validationStatus);
                  return;
                }

                void props
                  .onUpdateQuery({
                    id: props.selectedQuery.id,
                    name: props.selectedQuery.name,
                    query,
                  })
                  .then(() => {
                    setSnackbarMessage("success-update");
                  })
                  .catch(() => {
                    setSnackbarMessage("error-update");
                  });
              }}
            >
              Save
            </Button>
          )}
          <Button
            variant="secondary"
            size="small"
            className="action"
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onClick={async () => {
              // TODO: New query :-- this was previously in state.
              const query = "";

              const validationStatus: ValidationStatus = validateQuery({
                name: newQueryNameDraft,
                queries: props.queries,
                query,
              });

              if (validationStatus !== "valid") {
                setSnackbarMessage(validationStatus);
                return;
              }

              let result: SavedQuery;
              try {
                result = await props.onCreateQuery({
                  name: newQueryNameDraft,
                  query,
                });
              } catch (err) {
                setSnackbarMessage("error-create");
                return;
              }

              setSnackbarMessage("success-create");
            }}
          >
            Save as new
          </Button>
          <Button
            variant="secondary"
            size="small"
            className="action"
            onClick={() => {
              setNewQueryNameDraft("");
              setIsNewQuery(false);
            }}
          >
            {/* Reset changes */}
            Cancel
          </Button>
        </Grid>
      )}
      <SavedQueriesSnackbar
        messageType={snackbarMessage}
        onUndoDelete={async () => {
          props.onSelectQuery(props.selectedQuery.name);
          setQueryDeletionPending(false);
          props.onEditQuery(props.selectedQuery.query);
        }}
        onClose={() => {
          // The snackbar is used as a confirmation prompt here.
          if (isQueryDeletionPending) handleDelete();
          setSnackbarMessage(undefined);
        }}
      />
      <Grid className="flex wrapper">
        <Grid className="flex actions-flex">
          {props.isOwner && !props.isMobile && (
            <ActionsMenu<QueryAction>
              actions={["Share", "Set as default", "Delete", "New query"]}
              onSelect={async (action) => {
                switch (action) {
                  case "Share": {
                    const url = window.location.href;
                    await navigator.clipboard.writeText(url);
                    setSnackbarMessage("success-share");
                  }
                  case "Set as default": {
                    await props
                      .onSelectedAction(
                        props.selectedQuery.id,
                        "Set as default"
                      )
                      .then(() => {
                        setSnackbarMessage("success-setDefault");
                      });
                  }
                  case "Delete": {
                    if (props.selectedQuery.isDefault) {
                      setQueryDeletionPending(false);
                      setSnackbarMessage("error-deleteDefault");
                      return;
                    }
                    setSnackbarMessage("success-delete");
                    props.onSelectQuery(props.selectedQuery.name);
                    props.onEditQuery(props.selectedQuery.query);
                  }
                  case "New query": {
                    setIsNewQuery(true);
                    props.onEditQuery("");
                  }
                }
              }}
            />
          )}
        </Grid>
      </Grid>
    </Grid>
  );
}
