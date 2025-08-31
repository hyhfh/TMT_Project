import Link from "next/link";

export default function POICard({
  poi,
  showIntro = true,
  selectable = false,        
  selected = false,           
  onToggleSelect = () => {},  
}) {
  const realId =
    poi?.id ?? poi?.poi_id ?? poi?._id ?? null;
  const href = realId ? `/poi/${realId}` : `/poi/${encodeURIComponent(poi.name)}`;

  const imgSrc =
    poi?.image_url && String(poi.image_url).trim()
      ? String(poi.image_url).trim()
      : "/images/default.jpeg";

  const tags = ["attraction", "food", "nature", "culture", "shopping"]
    .filter((k) => !!poi?.[k])
    .map((k) => k[0].toUpperCase() + k.slice(1));

  const popularityText =
    poi?.popularity == null ? null : Number(poi.popularity).toLocaleString();
    console.log("[POICard] name=", poi?.name, "id=", realId, "selectable=", selectable);

  return (
    <div className="group bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition h-full flex flex-col relative">
      {selectable && realId && (
        <label
          className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur px-2 py-1 rounded-xl shadow cursor-pointer select-none text-xs"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect(realId)}
            className="mr-1 align-middle"
          />
          Select
        </label>
      )}
      <div className="relative w-full aspect-[16/9] overflow-hidden shrink-0">
        <img
          src={imgSrc}
          alt={poi?.name || "POI"}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/images/default.jpeg";
          }}
        />
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-xl font-semibold text-green-800 leading-snug">
          {poi?.name}
        </h3>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
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

        {showIntro && poi?.introduction && (
          <p className="text-gray-700 text-sm mt-3 line-clamp-3">
            {poi.introduction}
          </p>
        )}
        {popularityText && (
          <p className="text-sm text-gray-600 mt-3">Popularity: {popularityText}</p>
        )}
        <div className="mt-auto pt-4 flex items-center justify-between">
          <Link href={href} legacyBehavior passHref>
            <a className="px-4 py-2 rounded-xl border border-gray-300 text-sm hover:bg-gray-50 transition">
              Read more
            </a>
          </Link> 
          {poi?.map_url && (
            <a
              href={poi.map_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm hover:bg-green-700 transition shadow"
            >
              Open in Google Maps
            </a>
          )}
        </div>
      </div>
    </div>
  );
}