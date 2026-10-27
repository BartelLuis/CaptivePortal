(() => {
  "use strict";

  const form = document.getElementById("accept-form");
  const status = document.getElementById("status");
  const agree = document.getElementById("agree");
  const connect = document.getElementById("connect");
  const params = new URLSearchParams(window.location.search);
  let submitting = false;

  try {
    const gateway = new URL(window.PORTAL_CONFIG.gatewayPostUrl);
    if (!["https:", "http:"].includes(gateway.protocol) ||
        gateway.username || gateway.password || gateway.hash || gateway.search) {
      throw new Error("Invalid gateway configuration");
    }

    for (const name of ["post", "magic", "4Tredir"]) {
      if (params.getAll(name).length > 1) {
        throw new Error("Ambiguous connection request");
      }
    }

    const post = new URL(params.get("post"));
    const magic = params.get("magic");
    if (post.href !== gateway.href || !magic || magic.length > 1024 ||
        /[\u0000-\u0020\u007f]/.test(magic)) {
      throw new Error("Invalid connection request");
    }

    form.action = gateway.href;
    document.getElementById("magic").value = magic;
    document.getElementById("redirect").value = params.get("4Tredir") || "";
    form.hidden = false;
    status.textContent = "Akzeptieren Sie die Bedingungen, um den Internetzugang anzufordern.";
  } catch {
    status.textContent = "Die Verbindungsanfrage fehlt oder ist ungültig. Öffnen Sie die Anmeldeseite des Netzwerks erneut. Wenn das Problem weiterhin besteht, wenden Sie sich an die Netzwerkadministration.";
    return;
  }

  agree.addEventListener("change", () => {
    connect.disabled = !agree.checked;
  });

  form.addEventListener("submit", (event) => {
    if (submitting || !agree.checked || !form.reportValidity()) {
      event.preventDefault();
      return;
    }
    submitting = true;
    connect.disabled = true;
    document.getElementById("decline").disabled = true;
    status.textContent = "Der Zugang wird beim Netzwerk angefragt …";
  });

  document.getElementById("decline").addEventListener("click", () => {
    form.hidden = true;
    agree.checked = false;
    connect.disabled = true;
    status.textContent = "Sie haben die Bedingungen abgelehnt. Es wurde kein Zugang angefragt. Sie können diese Seite jetzt schließen.";
  });
})();
