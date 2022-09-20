/**
 * TODO: Remove this and use Theme UI instead
 */
export function classNames(...csx: Array<string | boolean | undefined | null>) {
  return csx.filter(Boolean).join(" ");
}
