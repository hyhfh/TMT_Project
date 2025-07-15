export default function POICard({ image, title, description }) {
  return (
    <div className="w-64">
      <img src={image} alt={title} className="rounded-lg h-40 w-full object-cover" />
      <h3 className="font-semibold mt-2 text-green-900">{title}</h3>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
    </div>
  );
}
