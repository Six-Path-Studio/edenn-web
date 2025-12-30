import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Get the hash fragment from the URL (contains the token)
  // Note: Hash fragments are handled client-side, so we return HTML that processes them
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Google Sign In - Redirecting...</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: #0a0a0a;
            color: white;
          }
          .container {
            text-align: center;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255,255,255,0.1);
            border-top-color: #7628db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="spinner"></div>
          <p>Signing you in...</p>
        </div>
        <script>
          // Parse the hash fragment
          const hash = window.location.hash.substring(1);
          const params = new URLSearchParams(hash);
          
          const idToken = params.get('id_token');
          const accessToken = params.get('access_token');
          
          if (idToken) {
            // Decode the JWT to get user info
            const payload = JSON.parse(atob(idToken.split('.')[1]));
            
            // Send message to parent window
            if (window.opener) {
              window.opener.postMessage({
                type: 'GOOGLE_AUTH_SUCCESS',
                payload: {
                  email: payload.email,
                  name: payload.name,
                  picture: payload.picture,
                  sub: payload.sub
                }
              }, window.location.origin);
              
              // Close this popup
              window.close();
            }
          } else {
            // Handle error
            document.body.innerHTML = '<p style="color: red;">Authentication failed. Please close this window and try again.</p>';
          }
        </script>
      </body>
    </html>
  `;
  
  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}
