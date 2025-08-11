import Link from "next/link";

// export default function POICard({ poi, showIntro = true }) {
export default function POICard({
  poi,
  showIntro = true,
  selectable = false,         // ✅ 新增：是否可勾選
  selected = false,           // ✅ 新增：是否已勾選
  onToggleSelect = () => {},  // ✅ 新增：勾選回呼
}) {
  const realId =
    poi?.id ?? poi?.poi_id ?? poi?._id ?? null;
  const href = realId ? `/poi/${realId}` : `/poi/${encodeURIComponent(poi.name)}`;
  // const realId = poi?.id ?? null;
  // const href = realId ? `/poi/${realId}` : "#";

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
    // 卡片外層：撐滿格子高度，內容直向排列
    <div className="group bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition h-full flex flex-col relative">
    {/* <div className="group bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition h-full flex flex-col"> */}
      {/* 圖片：固定 16:9 + hover 微放大 */}
      {/* ✅ 勾選：只在 selectable=true 且有 id 時顯示 */}
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

      {/* 內容區：flex-1 讓底部按鈕能貼底 */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-xl font-semibold text-green-800 leading-snug">
          {poi?.name}
        </h3>

        {/* 標籤 */}
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

        {/* 簡介（首頁可關閉） */}
        {showIntro && poi?.introduction && (
          <p className="text-gray-700 text-sm mt-3 line-clamp-3">
            {poi.introduction}
          </p>
        )}

        {/* 人氣 */}
        {popularityText && (
          <p className="text-sm text-gray-600 mt-3">🔥 Popularity: {popularityText}</p>
        )}

        {/* 底部按鈕：左右分佈、貼底 */}
        <div className="mt-auto pt-4 flex items-center justify-between">
          {/* <Link
            href={href}
            className="px-4 py-2 rounded-xl border border-gray-300 text-sm hover:bg-gray-50 transition"
          >
            Read more
          </Link> */}
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

// export default function POICard({ poi, showIntro = true }) {
//   // 1. 簡潔且穩健的圖片路徑處理
//   //    - 檢查 poi.image_url 是否存在且非空
//   //    - 如果是，使用 .trim() 清除潛在空格
//   //    - 如果否，使用預設圖片
//   const imgSrc = poi.image_url && poi.image_url.trim() ? poi.image_url.trim() : '/images/default.jpeg';

//   return (
//     <div className="rounded-lg shadow-md p-4 border bg-white flex flex-col justify-between h-full">
//       <img
//         src={imgSrc}
//         alt={poi.name}
//         // onError 可以在 URL 有效但圖片損毀或無法訪問時提供最終保護
//         onError={(e) => {
//           e.target.onerror = null; // 防止無限迴圈
//           e.target.src = poi.image_url;
//         }}
//         className="w-full h-48 object-cover rounded-t-lg"
//       />

//       <div className="flex flex-col flex-grow">
//         <h3 className="text-lg font-bold mt-2 text-green-900">{poi.name}</h3>
//         <p className="text-sm text-gray-600">{poi.address}</p>

//         {showIntro && <p className="text-sm mt-1">{poi.introduction}</p>}

//         {poi.popularity !== undefined && (
//           <p className="text-sm text-yellow-600 mt-1">
//             🔥 Popularity: {poi.popularity ?? 0}
//           </p>
//         )}
//       </div>
//       {poi.map_url && (
//         <a
//           href={poi.map_url}
//           target="_blank"
//           rel="noopener noreferrer"
//           // className="text-sm text-blue-600 underline mt-4"
//           className="text-sm text-blue-600 underline self-end mt-auto"
//         >
//           View on map
//         </a>
//       )}
//     </div>
//   );
// }  
