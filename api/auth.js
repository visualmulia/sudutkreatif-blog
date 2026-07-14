export default function handler(req, res) {
  const host = req.headers.host;
  
  // Use localhost redirect URI for local dev, otherwise force the canonical custom domain
  const redirectUri = host.startsWith('localhost') 
    ? `http://${host}/api/callback` 
    : 'https://sudutkreatif.web.id/api/callback';
  
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.OAUTH_CLIENT_ID}&scope=repo&redirect_uri=${encodeURIComponent(redirectUri)}`;
  
  res.writeHead(302, { Location: githubAuthUrl });
  res.end();
}
