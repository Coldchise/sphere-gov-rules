# Test fixtures

Store **synthetic**, minimal deterministic data only. Never copy real customer records,
real JWTs, production cookies, private keys, or database dumps here.

Use builders/factories for variations. If tests require credentials, inject a dedicated
least-privilege test account via CI secrets or test setup; keep them out of Git.

Tests must seed and clean **their own** data in a disposable environment. Avoid sharing
one mutable test user across parallel runs. Do not call production services.
