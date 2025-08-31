import { useRouter } from "next/router";
import { useEffect, useState, useMemo } from "react";
import Head from "next/head";

export default function POIDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [poi, setPoi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!router.isReady || !id) return;
    (async () => {
      try {
        setLoading(true);
        const isNumericId = /^\d+$/.test(String(id));
        const url = isNumericId
          ? `http://localhost:8000/api/pois/${id}`
          : `http://localhost:8000/api/pois/by_name?name=${encodeURIComponent(id)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("POI not found");
        const data = await res.json();
        setPoi(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [router.isReady, id]);

  const tags = useMemo(() => {
    if (!poi) return [];
    const possible = ["attraction", "food", "nature", "culture", "shopping"];
    return possible.filter(k => !!poi[k]).map(k => k[0].toUpperCase() + k.slice(1));
  }, [poi]);

  const popularityText = useMemo(() => {
    if (poi?.popularity === undefined || poi?.popularity === null) return null;
    try {
      return Number(poi.popularity).toLocaleString();
    } catch {
      return poi.popularity;
    }
  }, [poi]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="w-full h-72 bg-gray-200 rounded-2xl animate-pulse" />
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mt-6" />
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse mt-2" />
            <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse mt-2" />
          </div>
          <div className="bg-white rounded-2xl shadow p-5">
            <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-3" />
            <div className="h-4 w-56 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse mt-4" />
          </div>
        </div>
      </div>
    );
  }

  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (!poi) return <div className="p-6">POI not found</div>;

  return (
    <>
      <Head>
        <title>{poi.name} | TailorMyTaipei</title>
        <meta name="description" content={poi.introduction?.slice(0, 150) || poi.name} />
      </Head>

      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.back()}
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
          >
            ← Back
          </button>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-green-800 tracking-tight">
          {poi.name}
        </h1>

        <div className="grid md:grid-cols-3 gap-8 mt-6">
          <div className="md:col-span-2">
            <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-lg">
              {poi.image_url ? (
                <img
                  src={poi.image_url}
                  alt={poi.name}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
              )}
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {poi.introduction && (
              <p className="mt-6 leading-7 text-gray-800 text-lg">
                {poi.introduction}
              </p>
            )}
          </div>

          <aside className="space-y-4">
            <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Info</h2>

              {poi.address && (
                <div className="mb-3">
                  <div className="text-xs uppercase tracking-wider text-gray-500 underline">Address</div>
                  <div className="bold text-gray-800">{poi.address}</div>
                </div>
              )}

              {popularityText && (
                <div className="mb-3">
                  <div className="text-xs uppercase tracking-wider text-gray-500 underline">Popularity</div>
                  <div className="text-gray-800"> {popularityText}</div>
                </div>
              )}

              {poi.lat != null && poi.lng != null && (
                <div className="mb-3 text-sm text-gray-600">
                  <div className="text-xs uppercase tracking-wider text-gray-500 underline">Coordinates</div>
                  <div>{poi.lat}, {poi.lng}</div>
                </div>
              )}

              {poi.map_url && (
                <a
                  href={poi.map_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block w-full text-center rounded-xl bg-green-600 text-white py-2.5 font-medium hover:bg-green-700 transition shadow"
                >
                  Open in Google Maps
                </a>
              )}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
