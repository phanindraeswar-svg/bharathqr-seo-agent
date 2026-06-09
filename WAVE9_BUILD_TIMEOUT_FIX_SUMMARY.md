# Wave 9 — Build Timeout Fix + Final Offline Hardening

This wave focused on reducing Vercel/static-generation risk and improving release-readiness reliability before deployment.

## Changes made

1. Dynamic route static-generation load reduced
   - Updated these dynamic route families to use `paths: []` with `fallback: 'blocking'`:
     - `/solutions/[slug]`
     - `/use-cases/[slug]`
     - `/materials/[slug]`
     - `/comparisons/[slug]`
     - `/templates/[slug]`
     - `/trust/[slug]`
     - `/ai-tools/[slug]`
   - This keeps routes available through ISR/on-demand generation while reducing build-time static page work.

2. Content quality cleanup
   - Rewrote two weak/rejected blog posts.
   - Removed unsafe/incorrect claims such as dynamic/dashboard/payment-management language.
   - Content Quality Score V2 now reports 0 rejected posts.

3. Release readiness score fixed
   - `scripts/release_readiness_score.py` now accepts the current report filenames:
     - `final_route_manifest.json`
     - `content-quality-score-v2.json`
     - `opportunity-engine-report.md`
   - Release readiness now reaches 100/100 after running `npm run prelaunch`.

4. Prelaunch script improved
   - `npm run prelaunch` now runs:
     - predeploy check
     - opportunity engine
     - sitemap/route consistency
     - release readiness score

## Validation passed

- `npm run prelaunch` passes.
- Content validation passes.
- Route audit passes.
- Internal link audit passes.
- Content Quality Score V2 runs with 0 rejected posts.
- Route manifest generated with 144 routes.
- Final launch audit passes.
- Sitemap/route consistency passes.
- Opportunity engine runs.
- Release readiness score: 100/100.

## Important deployment note

The sandbox still cannot fully verify `next build` because dependencies are not installed here. Run locally or in Vercel:

```bash
npm install
npm run prelaunch
npm run build
```

This wave specifically reduces the previous suspected static-generation timeout risk by moving expanded dynamic content sections to on-demand ISR.
