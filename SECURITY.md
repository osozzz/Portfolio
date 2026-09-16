# Security Policy

Security requirements are defined primarily by the approved security and technical architecture under `/docs`.

## Reporting a vulnerability

Do not publish exploitable details in a public Issue.

Use GitHub's private vulnerability reporting/security advisory capability when available, or contact the repository owner privately through the contact channel listed on the owner's GitHub profile.

Include, when possible:

- affected surface;
- reproduction steps;
- expected vs. observed behavior;
- impact;
- suggested mitigation;
- whether the issue appears actively exploitable.

## Sensitive information

Never include passwords, MFA material, auth cookies, access/refresh tokens, provider secrets, private keys, production credentials, personal message bodies, or unpublished user-generated content in Issues, Pull Requests, logs, screenshots, or test fixtures.

## Supported versions

Until the first production release, only the latest `main` and active release candidate are supported. After V1.0, the support policy will track the current production release unless a later security policy explicitly changes it.
