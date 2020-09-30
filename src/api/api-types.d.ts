namespace ApiTypes {
  export interface LoginResponseOk {
    access_token: string;
    token_type: string;
    expires_in: number;
    created_at: number;
  }

  export interface LoginResponseErr {
    error: string;
    error_description: string;
  }
}
