export interface SavedQuery {
  id: string;
  name: string;
  query: string;
  isDefault?: boolean;
  subgraphId?: number;
  versionId?: string;
}
