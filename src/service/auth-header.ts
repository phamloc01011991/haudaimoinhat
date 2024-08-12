export default function authHeader() {
  const user = JSON.parse(localStorage.getItem('accessToken') || '{}')

  if (user && user)
    return { 'Authorization': `Bearer ${user}`, 'X-Custom-Header': 'foobar', 'Access-Control-Allow-Origin': '*' }
  else
    return {}
}
