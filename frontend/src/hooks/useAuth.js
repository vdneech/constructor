export function useAuth() {
  const token = localStorage.getItem('accessToken');
  return Boolean(token);
}
