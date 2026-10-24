# CaptivePortal

A static guest Wi-Fi Terms of Service page for FortiGate. No application server,
database, accounts, passwords, or shared guest credentials are used. Upload the
files to ordinary static webspace; the browser submits acceptance directly to
the FortiGate, which remains responsible for granting network access.

## FortiGate compatibility

**External authentication and disclaimer-only access are different FortiGate
flows.** An external authentication portal normally posts `username`, `password`,
and `magic` to the supplied `post` URL. Sending `answer=1` is not a substitute for
authentication at that endpoint. Do not configure authentication-only mode and
expect this portal to bypass it.

For truly credential-free access, configure **disclaimer-only** access on your
FortiGate. Where your FortiOS configuration supplies an external disclaimer
redirect, use it. Otherwise use the included replacement-message handoff below
to host the terms externally while FortiGate maintains the disclaimer session.
FortiOS versions and wired/wireless configurations differ: verify this round trip
on your appliance before deployment. Native external-authentication mode alone
does not provide a verified credential-free integration.

## Deployment

1. Enable disclaimer-only captive access on the intended guest interface/SSID
   and its access policy, without a user authentication requirement. Keep guests
   isolated from internal networks.
2. Inspect the **original FortiGate disclaimer form**. Record its absolute POST
   action (including scheme, hostname, port and path), and confirm it uses
   `magic`, `4Tredir`, and `answer` (`1` for acceptance). This project targets that
   form contract; if your firmware uses another contract, do not deploy unchanged.
3. Set `gatewayPostUrl` in `config.js` to that exact absolute action, for example
   `https://gateway.example.com:1003/`. This is a public endpoint, not a secret.
   Prefer HTTPS with a trusted certificate. An HTTPS portal posting to an HTTP
   gateway can trigger browser warnings or blocking; use HTTPS on both.
4. Customize the sample terms in `index.html` for your operator and policies.
   Upload `index.html`, `styles.css`, `config.js`, and `portal.js` together to
   your HTTPS webspace. No build, package installation, PHP, or Node.js is needed.
5. Allow unauthenticated guests to resolve and reach that hosting hostname and
   its assets in the FortiGate pre-authentication allowlist (walled garden).
   Avoid third-party assets or broadly allowing a shared hosting/CDN domain.
6. If a handoff is needed, back up the FortiGate authentication **disclaimer
   replacement message**, then install `fortigate-disclaimer.html` there, not on
   the webspace. Change its portal form action to your hosted `index.html` URL.
   Keep the gateway form action identical to your original disclaimer form
   (`/` in the supplied template). FortiGate expands `%%MAGICVAL%%` and
   `%%PROTURI%%`; a static host cannot expand those placeholders.
7. Join the guest network with a fresh session and open an HTTP site to trigger
   captive detection. Follow “Read terms”, accept the checkbox, and connect.
   Confirm that FortiGate grants Internet access only after acceptance. Check
   declining and session expiry as well. Appliance testing is required: this
   repository cannot emulate FortiGate's session/policy enforcement.

## Browser contract

The portal expects a GET redirect with URL-encoded query parameters:

| Parameter | Meaning |
| --- | --- |
| `post` | Absolute FortiGate disclaimer POST URL; must match `gatewayPostUrl`. |
| `magic` | Opaque, nonempty FortiGate session token. |
| `4Tredir` | Optional original destination, passed back to FortiGate unchanged. |

Acceptance sends a normal browser form POST (`application/x-www-form-urlencoded`)
to the configured gateway with `magic`, `4Tredir`, and `answer=1`. It does not use
AJAX, so no CORS service is required. FortiGate handles the response and final
redirect; the page never claims access was granted itself. Declining sends
nothing and leaves the guest unauthenticated. Missing/ambiguous parameters or a
non-allowlisted endpoint disable the form. The checkbox is a user interface
control, not a security boundary: FortiGate must enforce the session and policy.

There are no analytics, cookies, browser storage, or remote dependencies.
Session tokens travel in the handoff URL; configure the webspace not to log
query strings, avoid caching portal requests, and do not share sign-in URLs.
The pages send no referrer. Do not add third-party scripts to these pages.

## Local preview and verification

There is no existing test/build infrastructure. For a layout preview, serve this
directory with any static server, for example `python3 -m http.server 8080`,
then open `http://localhost:8080/`. Without valid configuration and session
parameters, the terms remain visible but connecting is disabled.

Before deployment, verify a valid handoff, checkbox-required submission,
declining without a POST, a missing/expired token, a duplicate `magic` parameter,
and a mismatched `post` URL. Verify keyboard and mobile use, too. Only the
FortiGate can determine whether an otherwise well-formed token has expired.