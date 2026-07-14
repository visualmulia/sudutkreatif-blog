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
              
              // Format 1: String payload (Netlify standard)
              const strMessage = "authorization:github:success:" + JSON.stringify({
                token: token,
                provider: "github"
              });
              
              // Format 2: Object payload (Decap standard)
              const objMessage = {
                provider: "github",
                status: "success",
                value: {
                  token: token
                }
              };
              
              if (window.opener) {
                // Send both formats to cover all Decap/Netlify CMS versions immediately
                window.opener.postMessage(strMessage, "*");
                window.opener.postMessage(objMessage, "*");
                
                // Auto-close the popup after a brief timeout to guarantee message delivery
                setTimeout(function() {
                  window.close();
                }, 200);
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
