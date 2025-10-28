export interface ApiClientError extends Error {
  status: number;
  message: string;
}

export interface Email {
  id: string
  sender: {
    name: string
    email: string
  }
  subject: string
  body: string
  bodyPreview?: string
  time: string
  date: string
  hasAttachment: boolean
}

export interface CurrentUser {
  name: string
  email: string
}