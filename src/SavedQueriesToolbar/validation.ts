import { SavedQuery } from "./types";

export type NameValidationError = "error-nameTaken" | "error-nameEmpty";
export type QueryValidationError = "error-queryEmpty" | "error-queryInvalid";
export type ValidationError = NameValidationError | QueryValidationError;
export type Valid = "valid";

export type ValidationStatus = ValidationError | Valid;

interface ValidateQuerySourceArgs {
  query: string;
}
function validateQuerySource({
  query,
}: ValidateQuerySourceArgs): QueryValidationError | Valid {
  const queryString = query.replace(/\s/g, "");

  if (queryString.length === 0) return "error-queryEmpty";

  // TODO: This is so brittle.
  const errors = document.querySelectorAll(".CodeMirror-lint-mark-error");
  if (errors.length > 0) return "error-queryInvalid";

  return "valid";
}

interface ValidateQueryNameArgs {
  name: string;
  updatedId?: SavedQuery["id"];
  queries: SavedQuery[];
}

function validateQueryName({
  name,
  updatedId,
  queries,
}: ValidateQueryNameArgs): NameValidationError | Valid {
  if (name === "") return "error-nameEmpty";
  if (updatedId) queries = queries.filter((x) => x.id !== updatedId);
  if (queries.find((x) => x.name === name)) return "error-nameTaken";
  return "valid";
}

export interface ValidateQueryArgs
  extends ValidateQueryNameArgs,
    ValidateQuerySourceArgs {}
export function validateQuery({
  query,
  name,
  updatedId,
  queries,
}: ValidateQueryArgs) {
  const nameValidation = validateQueryName({ name, updatedId, queries });
  if (nameValidation !== "valid") return nameValidation;
  return validateQuerySource({ query });
}
