/** @jsxImportSource theme-ui */

import { Flex, NewGDSButton as Button, Spacing } from "@edgeandnode/components";

import { SnackbarMessageType } from "./SavedQueriesSnackbar";
import { SavedQuery } from "./types";
import { validateQuery, ValidationStatus } from "./validation";

export interface SavedQueriesActionButtonsProps<TQuery extends SavedQuery> {
  isNewQuery: boolean;
  currentQuery: TQuery;
  queries: TQuery[];
  setSnackbarMessage: (validationStatus: SnackbarMessageType) => void;
  currentQueryId: string | number;
  newQueryNameDraft: string;
  setNewQueryNameDraft: (value: string) => void;
  setIsNewQuery: (value: boolean) => void;

  onCreateQuery: (info: {
    name: TQuery["name"];
    query: string;
  }) => Promise<void>;
  onUpdateQuery: (info: {
    id: TQuery["id"];
    name: TQuery["name"];
    query: string;
  }) => Promise<void>;
}

export function SavedQueriesActionButtons<TQuery extends SavedQuery>({
  isNewQuery,
  currentQuery,
  queries,
  setSnackbarMessage,
  currentQueryId,
  newQueryNameDraft,
  setNewQueryNameDraft,
  setIsNewQuery,
  onCreateQuery,
  onUpdateQuery,
}: SavedQueriesActionButtonsProps<TQuery>) {
  return (
    <Flex
      align="center"
      gap={Spacing["2px"]}
      sx={{
        flexWrap: "nowrap",
        justifyContent: "space-around",
        flexShrink: 0,
      }}
    >
      {!isNewQuery && (
        <Button
          size="medium"
          variant="tertiary"
          onClick={(e) => {
            e.stopPropagation();

            // TODO: New query :-- this was previously in state.
            const query = "";

            const validationStatus: ValidationStatus = validateQuery({
              name: currentQuery.name,
              updatedId: currentQuery.id,
              queries: queries,
              query,
            });

            if (validationStatus !== "valid") {
              setSnackbarMessage(validationStatus);
              return;
            }

            void onUpdateQuery({
              id: currentQueryId,
              name: currentQuery.name,
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
        size="medium"
        variant="tertiary"
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={async () => {
          // TODO: New query :-- this was previously in state.
          const query = "";

          const validationStatus: ValidationStatus = validateQuery({
            name: newQueryNameDraft,
            queries,
            query,
          });

          if (validationStatus !== "valid") {
            setSnackbarMessage(validationStatus);
            return;
          }

          try {
            await onCreateQuery({
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
        size="medium"
        variant="tertiary"
        onClick={() => {
          setNewQueryNameDraft("");
          setIsNewQuery(false);
        }}
      >
        {/* Reset changes */}
        Cancel
      </Button>
    </Flex>
  );
}
