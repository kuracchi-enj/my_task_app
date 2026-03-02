// CSRFトークンをmetaタグから取得
const getCsrfToken = (): string =>
  document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? ''

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
}

export const api = {
  get: (path: string): Promise<Response> =>
    fetch(path, { headers: { Accept: 'application/json' } }),

  post: (path: string, body: unknown): Promise<Response> =>
    fetch(path, {
      method: 'POST',
      headers: { ...JSON_HEADERS, 'X-CSRF-Token': getCsrfToken() },
      body: JSON.stringify(body),
    }),

  patch: (path: string, body: unknown): Promise<Response> =>
    fetch(path, {
      method: 'PATCH',
      headers: { ...JSON_HEADERS, 'X-CSRF-Token': getCsrfToken() },
      body: JSON.stringify(body),
    }),

  delete: (path: string): Promise<Response> =>
    fetch(path, {
      method: 'DELETE',
      headers: { 'X-CSRF-Token': getCsrfToken() },
    }),
}
