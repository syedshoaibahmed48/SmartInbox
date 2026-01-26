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
  to?: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  body: string
  bodyPreview?: string
  time: string
  date: string
  hasAttachment: boolean
  threadId: string
}

export interface CurrentUser {
  name: string
  email: string
}

export interface AIChatMessage {
  role: 'user' | 'assistant';
  content: string;
}