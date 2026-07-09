'use client';

import { useRouter } from 'next/navigation';

interface CountryCard {
  name: string;
  image: string;
}

const GLOBAL_COUNTRIES: CountryCard[] = [
  { name: "Dubai (UAE)", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400" },
  { name: "Maldives", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400" },
  { name: "Singapore", image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400" },
  { name: "Thailand", image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400" },
  { name: "Malaysia", image: "https://images.unsplash.com/photo-1605538032432-a9f0c8d9baac?w=400" },
  { name: "Indonesia", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400" },
  { name: "Japan", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400" },
  { name: "South Korea", image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=400" },
  { name: "China", image: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400" },
  { name: "Sri Lanka", image: "https://images.unsplash.com/photo-1546708973-b339540b5162?w=400" },
  { name: "Nepal", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400" },
  { name: "Bhutan", image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=400" },
  { name: "Turkey", image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400" },
  { name: "Switzerland", image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400" },
  { name: "France", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400" },
  { name: "Italy", image: "https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?w=400" },
  { name: "Spain", image: "https://images.unsplash.com/photo-1509840841025-9088ba78a826?w=400" },
  { name: "Greece", image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400" },
  { name: "United Kingdom", image: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=400" },
  { name: "Germany", image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400" },
  { name: "Norway", image: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=400" },
  { name: "Finland", image: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?w=400" },
  { name: "Iceland", image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400" },
  { name: "Australia", image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400" },
  { name: "New Zealand", image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400" },
  { name: "Canada", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400" },
  { name: "United States", image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400" },
  { name: "Mexico", image: "https://images.unsplash.com/photo-1518638150340-f706e86654de?w=400" },
  { name: "Egypt", image: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=400" },
  { name: "South Africa", image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400" }
];

export default function InternationalToursPage() {
  const router = useRouter();

  const handleCardClick = (name: string) => {
    router.push(`/international-tours/${encodeURIComponent(name)}`);
  };

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-24 sm:px-6 lg:px-8 space-y-8 animate-fade-in bg-slate-50 text-slate-900 min-h-screen font-sans">
      
      {/* Title */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="text-xs font-bold text-amber-500 uppercase tracking-widest block font-sans">🌍 International Directory</span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight font-sans">Global Countries</h1>
        <p className="text-xs sm:text-sm text-slate-500 font-semibold max-w-lg mx-auto">
          Explore our handpicked international holiday tour packages. Select a country below to view customized itineraries.
        </p>
      </div>

      {/* Grid of country cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 pt-4">
        {GLOBAL_COUNTRIES.map((country, idx) => (
          <div
            key={idx}
            onClick={() => handleCardClick(country.name)}
            className="group relative h-48 rounded-[18px] overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer bg-white p-1"
          >
            <div className="relative h-full w-full rounded-2xl overflow-hidden">
              <img
                src={country.image}
                alt={country.name}
                className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-center sm:text-left">
                <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition-colors font-sans">
                  {country.name}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
