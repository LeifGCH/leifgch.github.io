
document.open();
document.write(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Forceload</title>
  <style>
    * { box-sizing: border-box; }

    body {
      margin: 0;
      font-family: system-ui, sans-serif;
      color: #222;
      background: #fff;
    }

    #bar {
      padding: 10px;
      border-bottom: 1px solid #ccc;
      display: flex;
      gap: 8px;
    }

    #url {
      flex: 1;
      min-width: 0;
      padding: 10px;
      border: 1px solid #bbb;
      border-radius: 6px;
      font-size: 14px;
    }

    button {
      padding: 9px 14px;
      border: 1px solid #bbb;
      border-radius: 6px;
      background: #f7f7f7;
      cursor: pointer;
    }

    #status {
      padding: 8px 10px;
      color: #555;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <form id="bar">
    <input
      id="url"
      type="text"
      placeholder="Enter a website, e.g. wikipedia.org"
      autocomplete="url"
      spellcheck="false"
      aria-label="Website address"
      required
    >
    <button type="submit">Open 40 Tabs</button>
  </form>

  <div id="status" role="status">
    Enter a website to get started.
  </div>

  <script>
    const form = document.getElementById("bar");
    const input = document.getElementById("url");
    const status = document.getElementById("status");

    function normalizeURL(value) {
      value = value.trim();

      if (!value) {
        throw new Error("Enter a website address.");
      }

      const url = new URL(
        /^[a-zA-Z][a-zA-Z\\d+.-]*:/.test(value)
          ? value
          : "https://" + value
      );

      if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error("Only HTTP and HTTPS websites are supported.");
      }

      return url.href;
    }

    form.addEventListener("submit", function(event) {
      event.preventDefault();

      let target;

      try {
        target = normalizeURL(input.value);
      } catch (error) {
        status.textContent = error.message;
        return;
      }

      let opened = 0;

      for (let i = 0; i < 40; i++) {
        const tab = window.open(target, "_blank");

        if (tab) {
          opened++;
        }
      }

      if (opened === 40) {
        status.textContent = "Opened 40 tabs for " + target;
      } else {
        status.textContent =
          "Opened " + opened +
          " of 40 tabs. Your browser may have blocked some pop-ups.";
      }
    });
  </script>
</body>
</html>
`);
document.close();
