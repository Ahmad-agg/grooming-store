export function setListCache(res, seconds = 60) {
  res.set(
    'Cache-Control',
    `public, max-age=${seconds}, stale-while-revalidate=${seconds}`
  );
}