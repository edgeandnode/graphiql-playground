import { useState } from "react";

import { Grid, NewGDSButton as Button } from "@edgeandnode/components";

import { ActionsMenu } from "./ActionsMenu";
import { classNames } from "./lib";
import {
  SavedQueriesSnackbar,
  SnackbarMessageType,
} from "./SavedQueriesSnackbar";
import { Selector } from "./Selector";
import type { SavedQuery } from "./types";
import { validateQuery, ValidationStatus } from "./validation";

type QueryAction = "Set as default" | "Delete" | "Share";

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

  onSelectedAction: (queryId: string, action: QueryAction) => Promise<void>;

  showActions: boolean;
  isOwner: boolean;
  isMobile: boolean;
}

export function SavedQueriesToolbar(props: SavedQueriesToolbarProps) {
  const [isSavedQuerySelectOpen, setSavedQuerySelectOpen] = useState(false);
  const [isNewQuery, setIsNewQuery] = useState(false);
  const [newQueryNameDraft, setNewQueryNameDraft] = useState("");
  const [isQueryDeletionPending, setQueryDeletionPending] = useState(false);
  const [isActionsMenuOpen, setActionsMenuOpen] = useState(false);

  const [snackbarMessage, setSnackbarMessage] = useState<SnackbarMessageType>();

  const handleDelete = async () => {
    await props.onSelectedAction(props.selectedQuery.id, "Delete");
  };

  return (
    <Grid className={classNames("flex", "main-flex")}>
      <Selector
        queries={props.queries}
        open={isSavedQuerySelectOpen}
        selectedQueryName={props.selectedQuery.name}
        isDefaultQuery={props.selectedQuery.isDefault}
        onOpenMenu={() => {
          setSavedQuerySelectOpen(true);
        }}
        onMenuItemClick={(e, value) => {
          setSavedQuerySelectOpen(false);
          props.onSelectQuery(value);
        }}
        onChangeQueryName={(event) => {
          setNewQueryNameDraft(event.target.value);
        }}
        isOwner={props.isOwner}
        isMobile={props.isMobile}
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
            <ActionsMenu
              actions={[
                { id: "1", name: "Share" },
                { id: "2", name: "Set as default" },
                { id: "3", name: "Delete" },
                { id: "4", name: "New query" },
              ]}
              // TODO: Those two props could be moved inside.
              actionsOpen={isActionsMenuOpen}
              onActionsMenuClick={() => setActionsMenuOpen(true)}
              onClickAction={async (e, value) => {
                setActionsMenuOpen(false);
                switch (value) {
                  case "Share": {
                    const url = window.location.href;
                    await navigator.clipboard.writeText(url);
                    setSnackbarMessage("success-share");
                  }
                  case "Set as default": {
                    await props
                      .onSelectedAction(props.selectedQuery.id, value)
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
              isDefaultQuery={
                isNewQuery ? false : props.selectedQuery.isDefault
              }
            />
          )}
        </Grid>
      </Grid>
    </Grid>
  );
}
