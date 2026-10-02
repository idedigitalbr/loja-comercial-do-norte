# Sistema JE: isolated VPS deployment design

**Status:** awaiting user review

**Date:** 2026-10-02

## Goal

Publish the current Sistema JE application at `https://sistemaje.appide.site` on the supplied VPS, with its own application and MySQL containers. Preserve the existing local database contents, keep the database private, and avoid changing or stopping other services on the host.

## Verified context

- The repository is a Node.js 22 / pnpm 10 monorepo. The NestJS API serves the storefront and admin shells as well as `/api/v1` endpoints.
- The repository has no Dockerfile or Compose deployment yet. Its deployment runbook requires production secrets and persistent writable storage for `apps/api/storage/uploads`.
- The local MySQL schema is up to date across 13 Prisma migrations. Aggregate counts are 347 products, 2 users, and 2 orders. The local uploads directory is absent.
- The VPS has Docker Compose, an existing Caddy reverse proxy, and the shared `portainer_network`. Caddy configuration currently has no route for this domain. The domain currently returns Cloudflare HTTP 525; the public DNS response is proxied and does not reveal the origin address.
- At inspection time, the VPS had about 487 MiB available memory, no swap, and about 46 GiB disk space available. The running containers belong to other services and are outside this deployment's scope.

## Proposed architecture

Create `/opt/sistema-je` as a separate Compose project with two services:

- **Application:** one Node.js 22 container runs the API, storefront, and admin. It listens on port 3000 and exposes a health check at `/api/v1/health`.
- **Database:** MySQL 8.4 uses a named persistent volume and joins only the application's private network. It publishes no host port and is not connected to the shared proxy network.

The application joins the private project network and `portainer_network`. Caddy receives one site block for `sistemaje.appide.site` and proxies requests to the application. Before reloading Caddy, preserve its current configuration and validate the updated file. Caddy's existing automatic certificate management will provide origin TLS after the hostname is correctly routed.

Mount a separate named volume at the API's `apps/api/storage/uploads` path so media uploaded after launch survives container replacement. The current local uploads directory is absent, so no local upload files are part of the initial transfer.

## Data and secrets

Transfer a consistent snapshot of the current local MySQL database over the encrypted SSH connection, restore it into the new database, and verify the product, user, and order counts before starting public traffic. The existing local database remains untouched. Run `prisma migrate deploy` after restoration and confirm the migration state is current.

Create fresh production-only MySQL credentials, `COOKIE_SECRET`, `CRON_SECRET`, and a 32-byte Base64 `SETTINGS_ENCRYPTION_KEY`. Store them in `/opt/sistema-je/.env` with owner-only permissions. Set both `APP_ORIGIN` and `ADMIN_ORIGIN` to the public HTTPS origin. Do not copy the local `.env`, credentials, or a database dump into Git or the final image. Existing user password hashes remain in the imported database, so current account credentials continue to work.

## Build and rollout

Build the API and web assets with the repository's Node 22 / pnpm 10 toolchain, then assemble a Linux-compatible runtime image with production dependencies and Prisma client support. Avoid running the full Turbo build on the memory-constrained VPS. Keep the image and runtime files separate from the database and uploads volumes.

Roll out in stages: validate Compose configuration; start and verify MySQL; restore and verify the database; run migrations; start and health-check the application; then add and validate the Caddy route and reload Caddy. Do not change other Compose projects, networks, containers, or host services. Apply conservative memory limits and inspect host and container memory after each stage. If the host cannot run the new services without risking existing workloads, stop this rollout before public routing and report the capacity constraint.

## Acceptance criteria

- The new Compose project has healthy application and MySQL services, and MySQL has no public host port.
- The restored database matches the local aggregate counts and Prisma reports no pending migrations.
- `https://sistemaje.appide.site/` and `/admin/` serve the expected shells with a valid certificate.
- `https://sistemaje.appide.site/api/v1/health` reports the API and database as healthy.
- New uploads and database contents remain after recreating their containers.
- Existing host services remain running and unchanged.

## Rollback

If validation fails, remove only the new Caddy site block, validate and reload the prior Caddy configuration, and stop only the `sistema-je` Compose project. Keep the database and uploads volumes for diagnosis. Do not delete the source database or alter unrelated containers.

## Assumptions and limits

- The user request authorizes copying the full current local database, including its existing user and order records, to the new VPS database.
- Cloudflare is in front of the hostname. Public DNS alone cannot confirm its hidden origin record; after deployment, the HTTPS smoke test must confirm that the record routes to this VPS. If it does not, the DNS origin must be corrected in the DNS provider.
- No payment provider, SMTP, or other third-party credentials will be copied from local configuration. Those integrations can be configured through the deployed admin settings.
