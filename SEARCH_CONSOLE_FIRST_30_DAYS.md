# Search Console First 30 Days Plan

## Day 0
- Deploy BharathQR.
- Open `/sitemap.xml`.
- Submit sitemap in Google Search Console.
- Request indexing for homepage, tools, solutions, cases, and sitemap.

## Day 7
Look for:
- Pages with impressions.
- Queries with average position 8–30.
- Pages with impressions and CTR below 1%.

## Day 14
Prioritize:
1. Pages with impressions but low CTR.
2. Pages ranking 11–20.
3. Commercial-intent tool/solution pages.

## Day 30
Update:
- `data/post_launch_metrics.json`
- `data/keyword_performance_memory.json`
- `CONTENT_REFRESH_QUEUE.md`

Then run:
```bash
npm run post-launch-report
```
