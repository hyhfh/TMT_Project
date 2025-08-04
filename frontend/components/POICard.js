export default function POICard({ poi, showIntro = true }) {
  // 1. 簡潔且穩健的圖片路徑處理
  //    - 檢查 poi.image_url 是否存在且非空
  //    - 如果是，使用 .trim() 清除潛在空格
  //    - 如果否，使用預設圖片
  const imgSrc = poi.image_url && poi.image_url.trim() ? poi.image_url.trim() : '/images/default.jpeg';

  return (
    <div className="rounded-lg shadow-md p-4 border bg-white flex flex-col justify-between h-full">
      <img
        src={imgSrc}
        alt={poi.name}
        // onError 可以在 URL 有效但圖片損毀或無法訪問時提供最終保護
        onError={(e) => {
          e.target.onerror = null; // 防止無限迴圈
          e.target.src = poi.image_url;
        }}
        className="w-full h-48 object-cover rounded-t-lg"
      />

      <div className="flex flex-col flex-grow">
        <h3 className="text-lg font-bold mt-2 text-green-900">{poi.name}</h3>
        <p className="text-sm text-gray-600">{poi.address}</p>

        {showIntro && <p className="text-sm mt-1">{poi.introduction}</p>}

        {poi.popularity !== undefined && (
          <p className="text-sm text-yellow-600 mt-1">
            🔥 Popularity: {poi.popularity ?? 0}
          </p>
        )}
      </div>
      {poi.map_url && (
        <a
          href={poi.map_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-green-700 underline mt-4"
        >
          View on map
        </a>
      )}
    </div>
  );
}  
