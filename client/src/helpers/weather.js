// Open-Meteo uses two calls: geocode the city name to
// coordinates, then ask for current conditions at those coordinates.
// Best-effort only -- the About card should never break the page if this
// fails, so every call site treats a thrown error / null return as "unknown".
export const getCurrentWeather = async (city, country) => {
  const geoRes = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=5`,
  );
  const geoData = await geoRes.json();
  const results = geoData?.results ?? [];
  if (results.length === 0) return null;


  const place =
    results.find((r) => r.country?.toLowerCase() === String(country).toLowerCase()) || results[0];

  const forecastRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m&temperature_unit=fahrenheit`,
  );
  const forecastData = await forecastRes.json();
  const tempF = forecastData?.current?.temperature_2m;
  if (tempF === undefined) return null;

  const tempC = ((tempF - 32) * 5) / 9;
  return {
    tempF: Math.round(tempF),
    tempC: Math.round(tempC),
    resolvedName: place.name,
    country: place.country,
  };
};
