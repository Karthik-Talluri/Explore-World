'use client';

import { useRouter } from 'next/navigation';

interface LocationCard {
  name: string;
  image: string;
}

const INDIAN_LOCATIONS: LocationCard[] = [
  // 28 States
  { name: "Andhra Pradesh", image: "https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?w=400" },
  { name: "Arunachal Pradesh", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400" },
  { name: "Assam", image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400" },
  { name: "Bihar", image: "https://images.unsplash.com/photo-1622396481328-9b1b78cdd9fd?w=400" },
  { name: "Chhattisgarh", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400" },
  { name: "Goa", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400" },
  { name: "Gujarat", image: "https://images.unsplash.com/photo-1509840841025-9088ba78a826?w=400" },
  { name: "Haryana", image: "https://images.unsplash.com/photo-1543872084-c7bd3822856f?w=400" },
  { name: "Himachal Pradesh", image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=400" },
  { name: "Jharkhand", image: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400" },
  { name: "Karnataka", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400" },
  { name: "Kerala", image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=400" },
  { name: "Madhya Pradesh", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400" },
  { name: "Maharashtra", image: "https://images.unsplash.com/photo-1598128558393-70ff21433be0?w=400" },
  { name: "Manipur", image: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=400" },
  { name: "Meghalaya", image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400" },
  { name: "Mizoram", image: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=400" },
  { name: "Nagaland", image: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=400" },
  { name: "Odisha", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400" },
  { name: "Punjab", image: "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=400" },
  { name: "Rajasthan", image: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=400" },
  { name: "Sikkim", image: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=400" },
  { name: "Tamil Nadu", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400" },
  { name: "Telangana", image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400" },
  { name: "Tripura", image: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=400" },
  { name: "Uttar Pradesh", image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400" },
  { name: "Uttarakhand", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400" },
  { name: "West Bengal", image: "https://images.unsplash.com/photo-1558431382-27e303142255?w=400" },
  
  // 8 Union Territories
  { name: "Andaman and Nicobar Islands", image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400" },
  { name: "Chandigarh", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400" },
  { name: "Dadra and Nagar Haveli and Daman and Diu", image: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400" },
  { name: "Delhi", image: "https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?w=400" },
  { name: "Jammu and Kashmir", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400" },
  { name: "Ladakh", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400" },
  { name: "Lakshadweep", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400" },
  { name: "Puducherry", image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=400" }
];

export default function NationalToursPage() {
  const router = useRouter();

  const handleCardClick = (name: string) => {
    router.push(`/packages?destination=${encodeURIComponent(name)}`);
  };

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-28 sm:px-6 lg:px-8 space-y-8 animate-fade-in bg-slate-950 text-slate-100 min-h-screen">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-secondary uppercase tracking-widest block">🇮🇳 National Directory</span>
        <h1 className="text-3xl sm:text-5xl font-black text-white">Indian States & Union Territories</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          Explore all 28 states and 8 Union Territories of India. Select one below to view packages.
        </p>
      </div>

      {/* Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 pt-4">
        {INDIAN_LOCATIONS.map((loc, idx) => (
          <div
            key={idx}
            onClick={() => handleCardClick(loc.name)}
            className="group relative h-48 rounded-2xl overflow-hidden border border-secondary/20 shadow-lg hover:border-secondary hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          >
            <img
              src={loc.image}
              alt={loc.name}
              className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-center sm:text-left">
              <h3 className="text-sm sm:text-base font-extrabold text-white group-hover:text-secondary transition-colors">
                {loc.name}
              </h3>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
