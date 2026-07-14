export default function handler(req, res) {
  const host = req.headers.host;
  const protocol = host.startsWith('localhost') ? 'http' : 'https';
  const redirectUri = `${protocol}://${host}/api/callback`;
  
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.OAUTH_CLIENT_ID}&scope=repo&redirect_uri=${encodeURIComponent(redirectUri)}`;
  
  res.writeHead(302, { Location: githubAuthUrl });
  res.end();
}
