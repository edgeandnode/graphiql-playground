import { Icon, Text } from "@edgeandnode/components";

import { ValidationError } from "./validation";

export type SnackbarMessageType =
  | ValidationError
  | "success-create"
  | "success-update"
  | "success-setDefault"
  | "success-share"
  | "success-delete"
  | "error-create"
  | "error-update"
  | "error-default"
  | "error-deleteDefault";

const snackbarMessages: Record<SnackbarMessageType, string> = {
  "success-update": "Query updated",
  "success-create": "Query created",
  "success-setDefault": "Default query set",
  "success-share": "URL copied to clipboard",
  "success-delete": "Query successfully deleted",
  "error-nameEmpty": "Name can't be empty",
  "error-nameTaken": "Name is already taken",
  "error-queryEmpty": "Query can't be empty",
  "error-queryInvalid": "Query is invalid",
  "error-create": "Unable to create query (duplicate)",
  "error-update": "Unable to update query (duplicate)",
  "error-default": "Unable to set the default query",
  "error-deleteDefault": "Default query can't be deleted",
};

export interface SavedQueriesSnackbarProps {
  messageType: SnackbarMessageType | undefined;

  onUndoDelete: () => void;
  onClose: () => void;
}

export function SavedQueriesSnackbar({
  messageType,
  onUndoDelete,
  onClose,
}: SavedQueriesSnackbarProps) {
  const isDeleteMessage = messageType === "success-delete";
  const autoHideDurationMs = isDeleteMessage ? 5000 : 2000;

  const isSuccess = messageType?.startsWith("success");
  const isError = messageType?.startsWith("error");

  return (
    <Snackbar
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      open={messageType === undefined}
      autoHideDuration={autoHideDurationMs}
      message={
        <div>
          {isDeleteMessage && <Icon.Erase />}
          {messageType && <Text.P14>{snackbarMessages[messageType]}</Text.P14>}
          {isDeleteMessage && <div onClick={onUndoDelete}>Undo</div>}
        </div>
      }
      onClose={onClose}
      resumeHideDuration={0}
      status={isSuccess ? "success" : isError ? "error" : undefined}
    />
  );
}

// TODO
function Snackbar(props: any) {
  console.log("Snackbar", props);
  return null;
}
