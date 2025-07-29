export interface Document {
  id?: number;
  company: number;
  open_id?: number;
  token?: string;
  name: string;
  status?: string;
  created_at?: string;
  last_updated_at?: string;
  created_by?: string;
  external_id?: string;
  pdf_url: string;
  signers?: Signer[];
  // Update fields according to ZapSign API
  signer_name?: string;
  signer_email?: string;
  date_limit_to_sign?: string;
  folder_path?: string;
  folder_token?: string;
  extra_docs?: ExtraDoc[];
}

export interface ExtraDoc {
  token: string;
  name: string;
}

export interface Signer {
  id?: number;
  document?: number;
  token?: string;
  status?: string;
  name: string;
  email: string;
  external_id?: string;
}

export interface Company {
  id: number;
  name: string;
  api_token: string;
  created_at?: string;
  last_updated_at?: string;
}
