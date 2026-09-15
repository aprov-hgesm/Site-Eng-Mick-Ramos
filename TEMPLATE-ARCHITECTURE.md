# Reusable Professional Site Architecture

This repository now separates reusable application infrastructure from client-specific identity and visual presentation.

## Layers

### `/core`
Reusable infrastructure that should normally remain unchanged between client deployments.

Current contents:
- Firebase client bootstrap
- App Check initialization
- Firestore/Auth exports
- shared Firestore error handling

Existing imports through `@/lib/firebase` remain supported by a compatibility facade.

### `/config`
Per-client deployment configuration.

`config/client.config.ts` centralizes:
- company / professional identity
- public contact fallbacks
- administrator UID used by the client-side admin gate
- public EmailJS identifiers
- SEO / Open Graph metadata
- site URL
- theme selection
- local persistence namespace

Every value keeps the current Mick Ramos configuration as a fallback so the existing production deployment behaves as before when no new environment variables are configured.

### `/themes`
Visual identity layer.

`themes/mick/` contains the current Mick theme and establishes semantic CSS variables/surface classes without changing the visual result of the production site.

A future client can receive another theme (for example `themes/joao/`) while keeping the same application core, Firebase integration, admin system and content model.

## Deployment model

Each client should receive an independent deployment with:

- its own GitHub repository or template instance;
- its own Firebase project;
- its own Firestore database;
- its own Firebase Authentication users;
- its own App Check / reCAPTCHA configuration;
- its own Vercel project and environment variables;
- its own domain and mail integration.

The reusable code can remain the same.

## Security boundary

`NEXT_PUBLIC_ADMIN_UID` is intentionally public because the browser must know which authenticated UID is expected. It is not the authorization boundary by itself.

Firestore Rules and Firebase Authentication must independently authorize the same administrator. Never rely only on the React admin gate.

## Safe migration rule

When creating a new client from this base:

1. Create independent Firebase infrastructure first.
2. Configure the new client environment variables.
3. Replace/deploy Firestore Rules with the new administrator UID and expected destination email.
4. Configure App Check and authorized domains.
5. Deploy to a separate Vercel project.
6. Run Security CI and CodeQL before merging to the production branch.
7. Audit for references to the previous client before launch.

## Mick compatibility

The current Mick values remain the fallback defaults. This refactor does not migrate or modify the Mick Firestore data, Firebase users, App Check configuration, Vercel project, domain, or security rules.
