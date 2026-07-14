export default async function handler(req, res) {
  const code = req.query.code;
  const client_id = process.env.OAUTH_CLIENT_ID;
  const client_secret = process.env.OAUTH_CLIENT_SECRET;
  
  if (!client_id || !client_secret) {
    res.status(500).send("Server Configuration Error: OAUTH_CLIENT_ID or OAUTH_CLIENT_SECRET environment variable is missing.");
    return;
  }
  const host = req.headers.host;
  const redirect_uri = `https://${host}/api/callback`;
  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id,
        client_secret,
        code,
        redirect_uri
      })
    });
    const data = await tokenResponse.json();
    
    if (data.error) {
      res.status(400).send(`OAuth Handshake Error: ${data.error_description || data.error}`);
      return;
    }
    const token = data.access_token;
    const provider = 'github';
    // Membuat dokumen HTML yang mengirimkan postMessage ke parent window (Decap CMS)
    const content = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Authorizing...</title>
      </head>
      <body>
        <p>Authentication complete! Transmitting credentials, please wait...</p>
        <script>
          const receiveMessage = (e) => {
            window.opener.postMessage(
              'authorization:${provider}:success:${JSON.stringify({ token, provider })}',
              '*'
            );
            window.removeEventListener('message', receiveMessage, false);
          };
          window.addEventListener('message', receiveMessage, false);
          window.opener.postMessage("authorizing:${provider}", "*");
        </script>
      </body>
      </html>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(content);
  } catch (error) {
    res.status(500).send(`Authentication Server Error: ${error.message}`);
  }
}
