const FALLBACK_YMAPS_API_KEY = "f49ce433-7693-4e94-8965-466fa46a8132";

export function resolveYandexMapsApiKey() {
  const environmentKey = (import.meta.env.VITE_YMAPS_API_KEY ?? "").trim();
  return environmentKey || FALLBACK_YMAPS_API_KEY;
}
