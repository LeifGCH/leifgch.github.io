
document.open();
document.write(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title> </title>
  <style>
    * { box-sizing: border-box; }

    html, body {
      margin: 0;
      min-height: 100%;
      font-family: Arial, sans-serif;
      background: white;
      color: black;
    }

    #login {
      position: fixed;
      inset: 0;
      display: grid;
      align-content: center;
      justify-content: center;
      gap: 12px;
      padding: 24px;
      background: white;
    }

    input, button {
      width: 100%;
      padding: 12px;
      font: inherit;
    }

    input {
      border: 1px solid #aaa;
      border-radius: 5px;
    }

    button {
      border: 1px solid #111;
      border-radius: 5px;
      background: #111;
      color: white;
      cursor: pointer;
    }

    button:disabled {
      opacity: 0.6;
      cursor: wait;
    }

    #message {
      max-width: 300px;
      min-height: 1.2em;
      font-size: 14px;
      overflow-wrap: anywhere;
    }
  </style>
</head>
<body>
  <form id="login">
    <input
      id="password"
      type="password"
      placeholder="Password"
      autocomplete="current-password"
      maxlength="1024"
      required
    >
    <button id="submit" type="submit">Enter</button>
    <p id="message" role="status" aria-live="polite"></p>
  </form>

  <script>
    const WORKER_URL =
      "https://pp.proxyproxy.workers.dev";

    const form = document.getElementById("login");
    const field = document.getElementById("password");
    const button = document.getElementById("submit");
    const message = document.getElementById("message");

    form.addEventListener("submit", async function(event) {
      event.preventDefault();

      if (button.disabled) return;

      button.disabled = true;
      field.disabled = true;
      message.textContent = "Checking password...";

      try {
        const response = await fetch(WORKER_URL + "/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            password: field.value
          })
        });

        const result = await response.text();

        if (!response.ok) {
          message.textContent = result;
          field.value = "";

          // Keep the form disabled while locked out.
          if (response.status === 429) {
            button.disabled = true;
            field.disabled = true;
            return;
          }

          return;
        }

        // Replace the login page with the HTML returned by the Worker.
        document.open();
        document.write(result);
        document.close();

      } catch {
        message.textContent =
          "Unable to connect. Check your connection and try again.";
      } finally {
        // If navigation did not replace the page, allow another attempt.
        if (document.getElementById("login")) {
          const isLocked = message.textContent.startsWith(
            "Too many incorrect attempts."
          ) || message.textContent.startsWith("Locked out.");

          if (!isLocked) {
            button.disabled = false;
            field.disabled = false;
          }
        }
      }
    });
  </script>
</body>
</html>
`);
document.close();
