import POICard from "./POICard";

export default function RecommendationsSection() {
  return (
    <section className="px-6 py-12">
      <h2 className="text-2xl font-semibold text-green-900 mb-6">Top Recommendations</h2>
      <div className="flex gap-6 flex-wrap justify-center">
        <POICard image="/elephant.jpg" title="Elephant Mountain" description="Panoramic views of Taipei and the iconic 101." />
        <POICard image="/cks.jpg" title="Chiang Kai-shek Memorial Hall" description="Celebrates Taiwan's history and heritage." />
        <POICard image="/beitou.jpg" title="Beitou Hot Springs Museum" description="Housed in a former bathhouse." />
      </div>
    </section>
  );
}
