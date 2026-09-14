# Security Policy

## Supported version

Security fixes are applied to the current production branch (`main`). Keep production dependencies synchronized with the committed lockfile and do not deploy builds that fail the security CI checks.

## Reporting a vulnerability

Do not publish exploitable vulnerability details in a public issue. Prefer GitHub Private Vulnerability Reporting / Security Advisories for this repository when available.

When reporting, include:

- affected page or component;
- reproduction steps that do not destroy or alter production data;
- expected and observed behavior;
- impact assessment;
- logs or screenshots with credentials, tokens and personal data removed.

## Secrets

Never commit passwords, Firebase service-account keys, private API tokens, Vercel tokens or other server-side credentials. Browser Firebase configuration and App Check site keys are public identifiers and must still be protected by Firebase Security Rules, App Check enforcement and authentication.

## Production security controls

Production should keep the following controls enabled:

- Firebase Authentication for administrative access;
- Firestore Security Rules from `firestore.rules`;
- Firebase App Check enforcement for Firestore and Authentication after the site key is configured;
- GitHub dependency and static-analysis checks;
- Vercel/hosting firewall and bot protections appropriate to the active plan;
- multi-factor authentication for privileged accounts whenever supported by the configured Firebase Authentication tenant.
