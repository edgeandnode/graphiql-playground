export interface SavedQuery {
  id: string | number;
  name: string;
  query: string;
  isDefault?: boolean;
  subgraphId?: number;
  versionId?: string;
}
