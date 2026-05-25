// Matches the URL slug directly with your JSON slug field
  const currentRouteData = seoData.optimized_data.suggested_routes.find(
    (item) => item.slug.trim() === industry
  );
