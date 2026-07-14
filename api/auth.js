export default function handler(req, res) {
  const client_id = process.env.OAUTH_CLIENT_ID;
  if (!client_id) {
    res.status(500).send("Server Configuration Error: OAUTH_CLIENT_ID is not set in Vercel.");
    return;
  }
  
  const host = req.headers.host;
  // Menggunakan protokol secure https
  const redirect_uri = `https://${host}/api/callback`;
  const url = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=repo&redirect_uri=${encodeURIComponent(redirect_uri)}`;
  
  res.writeHead(302, { Location: url });
  res.end();
}
