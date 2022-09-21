/** @jsxImportSource theme-ui */

import { Flex, NewGDSButton as Button, Spacing } from "@edgeandnode/components";

import { SnackbarMessageType } from "./SavedQueriesSnackbar";
import { SavedQuery } from "./types";
import { validateQuery, ValidationStatus } from "./validation";

export interface SavedQueriesActionButtonsProps<TQuery extends SavedQuery> {
  currentQuery: TQuery | null;
  queryNameDraft: string;
  querySourceDraft: string;
  queries: readonly TQuery[];
  setSnackbarMessage: (validationStatus: SnackbarMessageType) => void;

  onResetChanges: () => void;

  /**
   * Save the current query to saved queries as new.
   */
  onSaveAsNewQuery: (info: {
    name: TQuery["name"];
    query: string;
  }) => Promise<void>;

  /**
   * Update the current query in saved queries.
   */
  onUpdateQuery: (info: {
    name: TQuery["name"];
    query: string;
  }) => Promise<void>;
}

export function SavedQueriesActionButtons<TQuery extends SavedQuery>({
  currentQuery,
  queries,
  setSnackbarMessage,
  queryNameDraft,
  querySourceDraft,
  onResetChanges,
  onSaveAsNewQuery,
  onUpdateQuery,
}: SavedQueriesActionButtonsProps<TQuery>) {
  const canResetChanges =
    currentQuery !== null &&
    (currentQuery.query !== querySourceDraft ||
      currentQuery.name !== queryNameDraft);

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
      {currentQuery && (
        <Button
          size="medium"
          variant="tertiary"
          onClick={(e) => {
            const name = queryNameDraft || currentQuery.name;

            const validationStatus: ValidationStatus = validateQuery({
              name,
              updatedId: currentQuery.id,
              queries: queries,
              query: querySourceDraft,
            });

            if (validationStatus !== "valid") {
              setSnackbarMessage(validationStatus);
              return;
            }

            void onUpdateQuery({
              name,
              query: querySourceDraft,
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
          const name = queryNameDraft || currentQuery?.name || "";

          const validationStatus: ValidationStatus = validateQuery({
            name,
            queries,
            query: querySourceDraft,
          });

          if (validationStatus !== "valid") {
            setSnackbarMessage(validationStatus);
            return;
          }

          try {
            await onSaveAsNewQuery({
              name,
              query: querySourceDraft,
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
        onClick={onResetChanges}
        disabled={!canResetChanges}
      >
        {/* Reset changes */}
        Cancel
      </Button>
    </Flex>
  );
}
