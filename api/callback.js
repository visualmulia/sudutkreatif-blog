export default async function handler(req, res) {
  const code = req.query.code;
  
  if (!code) {
    res.status(400).send("No authorization code provided.");
    return;
  }
  
  try {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.OAUTH_CLIENT_ID,
        client_secret: process.env.OAUTH_CLIENT_SECRET,
        code: code,
      }),
    });
    
    const data = await response.json();
    
    if (data.error) {
      res.status(400).send(`OAuth Error: ${data.error_description || data.error}`);
      return;
    }
    
    const token = data.access_token;
    
    res.setHeader("Content-Type", "text/html");
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authenticating...</title>
        </head>
        <body>
          <p>Autentikasi berhasil. Menghubungkan ke CMS...</p>
          <script>
            (function() {
              const token = "${token}";
              const message = "authorization:github:success:" + JSON.stringify({
                token: token,
                provider: "github"
              });
              
              if (window.opener) {
                // Send the token back to the CMS window
                window.opener.postMessage(message, "*");
                // Close the popup window
                window.close();
              } else {
                document.body.innerHTML = "<p>Error: Tidak ada jendela utama (opener) yang terdeteksi. Silakan coba masuk kembali.</p>";
              }
            })();
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }
}
