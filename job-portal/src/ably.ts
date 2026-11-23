export async function getAblyToken(apiKey: string, clientId: string): Promise<{ token: string; key: string }> {
  try {
    const [keyName] = apiKey.split(':');
    const authHeader = 'Basic ' + btoa(apiKey);
    
    const res = await fetch(`https://rest.ably.io/keys/${encodeURIComponent(keyName)}/requestToken`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clientId: clientId || 'anonymous',
        capability: JSON.stringify({ '*': ['publish', 'subscribe', 'presence'] }),
        ttl: 3600000 // 1 hour
      })
    });

    const data = await res.json() as any;
    if (data.token) {
      return { token: data.token, key: apiKey };
    }
  } catch (err) {
    console.warn('Ably token request error:', err);
  }
  return { token: apiKey, key: apiKey };
}
