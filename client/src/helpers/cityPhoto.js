// Wikipedia's action API
// origin=* -- same reasoning as using Open-Meteo for weather instead of a
// keyed provider. Returns a thumbnail image URL for a page, or null.
const fetchPageThumbnail = async (title) => {
  const url =
    `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*` +
    `&prop=pageimages&piprop=thumbnail&pithumbsize=640&redirects=1&titles=${encodeURIComponent(title)}`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  const page = Object.values(data?.query?.pages ?? {})[0];
  if (!page || "missing" in page) return null;

  return page.thumbnail?.source ?? null;
};

// fall back to "City, Country", which is Wikipedia's standard
export const getCityPhoto = async (city, country) => {
  const direct = await fetchPageThumbnail(city);
  if (direct) return direct;
  return fetchPageThumbnail(`${city}, ${country}`);
};
