export class ApiKeyDto {
  id: string;
  created_at: Date;
  expires: Date;
  is_revoked: boolean;
  api_key: string;
  project_id: string;
}
