import { useEffect, useState } from "react";
import POICard from "./POICard";

export default function RecommendationsSection() {
  const [pois, setPois] = useState([]);

  useEffect(() => {
  fetch("http://localhost:8000/api/top_pois")
    .then((res) => res.json())
    .then((data) => {
      console.log("🔥 Data from /api/top_pois:", data);  // 加這一行
      setPois(data);
    })
    .catch((err) => console.error("Error fetching POIs:", err));
}, []);

  // useEffect(() => {
  //   fetch("http://localhost:8000/api/top_pois")
  //     .then(res => res.json())
  //     .then(data => {
  //       setPois(data);
  //     })
  //     .catch(error => {
  //       console.error("Fetching top POIs failed:", error);
  //     });
  // }, []);

  // // ▼▼▼▼▼ 請把這行 console.log 加在這裡 ▼▼▼▼▼
  // console.log("準備渲染前的 pois state:", pois);
  // // ▲▲▲▲▲ 請把這行 console.log 加在這裡 ▲▲▲▲▲
  

// export default function RecommendationsSection() {
//   const [pois, setPois] = useState([]);
//   useEffect(() => {
//     fetch("http://localhost:8000/api/top_pois") // 請確保這個 URL 是正確的
//       .then((res) => res.json())
//       .then((data) => {
//         console.log("從 API 收到的 Top POIs 資料:", data); // <--- 請加入這一行
//         setPOIs(data);
//       })
//       .catch((err) => console.error("抓取 Top POIs 失敗:", err));
//   }, []);

  return (
    <section>
      <h2 className="text-2xl font-semibold mt-10 mb-4 text-green-800">
        Top Recommendations
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {pois.map((poi) => (
          <div key={poi.id} className="border rounded-lg shadow-md p-4">
            <img
              src={poi.image_url}
              alt={poi.name}
              className="w-full h-48 object-cover rounded-t-lg"
              onError={(e) => { e.target.src = '/images/default.jpeg'; }}
            />
            <h3 className="font-bold mt-2">{poi.name}</h3>
          </div>
        ))}
      </div>
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {pois.map((poi) => ( // 現在 index 已經不需要了，可以移除
          <POICard key={poi.id} poi={poi} /> // ✨ 使用 poi.id 作為 key
        ))}
      </div> */}
    </section>
  );
}


  // useEffect(() => {
  //   // fetch("http://127.0.0.1:8000/api/pois")
  //   fetch("http://localhost:8000/api/pois")  // 或者你後端實際監聽的 host
  //     .then((res) => res.json())
  //     // .then((data) => setPois(data))
  //     .then((data) => {
  //       console.log("Top POIs from backend:", data); // 👈 加這行
  //       setPois(data);
  //     })

  //     .catch((err) => console.error("Error fetching POIs:", err));
  // }, []);
  


// import POICard from "./POICard";

// export default function RecommendationsSection() {
//   return (
//     <section className="px-6 py-12">
//       <h2 className="text-2xl font-semibold text-green-900 mb-6">Top Recommendations</h2>
//       <div className="flex gap-6 flex-wrap justify-center">
//         <POICard 
//           image="/images/Taipei_101_1.jpg" 
//           title="Taipei 101" 
//           description="One of the tallest skyscrapers in the world, a landmark of Taipei." 
//         />
//         <POICard 
//           image="/images/Shilin_NM_1.jpeg" 
//           title="Shilin Night Market" 
//           description="A vibrant and bustling hub of street food, games, and shopping, also the largest night market in Taipei." 
//         />
//         <POICard 
//           image="/images/National_Palace_1.jpg" 
//           title="National Palace Museum" 
//           description="World-renowned museum of Chinese art and artefacts." 
//         />
//         <POICard 
//           image="/images/Elephant_Mount_1.jpg" 
//           title="Elephant Mountain" 
//           description="Panoramic views of Taipei and the iconic 101." 
//         />
//         <POICard 
//           image="/images/Raohe_NM_1.jpg" 
//           title="Raohe St. Night Market" 
//           description="A bustling night market in Eastern Taipei and one of the most popular in the city." 
//         />
//         <POICard 
//           image="/images/CKS_Memorial_Hall_1.jpg" 
//           title="Chiang Kai-shek Memorial Hall" 
//           description="National monument and tourist attraction, surrounded by a park, flanked on the north and south by the National Theatre and National Concert Hall." 
//         />
//         <POICard 
//           image="/images/Ximending_1.jpg" 
//           title="Ximending" 
//           description="Historical neighbourhood and shopping district in western Taipei." 
//         />
//         <POICard 
//           image="/images/Maokong_1.jpg" 
//           title="Maokong Gondola" 
//           description="A scenic cable car ride offers panoramic views of the city and surrounding mountains." 
//         />

//       </div>
//     </section>
//   );
// }
