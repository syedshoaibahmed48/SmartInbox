export interface ApiClientError extends Error {
  status: number;
  message: string;
}
