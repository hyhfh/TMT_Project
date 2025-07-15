export default function ItineraryForm() {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-md">
      <div className="flex flex-col gap-4">
        <select className="border px-3 py-2 rounded"> <option>Start date</option> </select>
        <select className="border px-3 py-2 rounded"> <option>End date</option> </select>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-medium mb-1">Your interests</p>
            <div className="flex flex-col gap-1">
              <label><input type="checkbox" /> Food</label>
              <label><input type="checkbox" /> Nature</label>
              <label><input type="checkbox" /> History & Culture</label>
            </div>
          </div>
          <div>
            <p className="font-medium mb-1">Your preferences</p>
            <div className="flex flex-col gap-1">
              <label><input type="checkbox" /> Nightlife</label>
              <label><input type="checkbox" /> Museums</label>
              <label><input type="checkbox" /> Shopping malls</label>
            </div>
          </div>
        </div>

        <button className="mt-4 bg-green-700 text-white py-2 rounded">Generate Itinerary</button>
      </div>
    </div>
  );
}