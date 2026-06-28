'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Attraction {
  name: string;
  image: string;
}

const COUNTRY_ATTRACTIONS: Record<string, Attraction[]> = {
  "dubai": [
    { name: "Burj Khalifa", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400" },
    { name: "Palm Jumeirah", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400" },
    { name: "Dubai Mall", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400" },
    { name: "Desert Safari", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400" }
  ],
  "maldives": [
    { name: "Overwater Villas", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400" },
    { name: "Coral Reef Gardens", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400" },
    { name: "Male Atoll", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400" },
    { name: "Banana Reef", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400" }
  ],
  "singapore": [
    { name: "Marina Bay Sands", image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400" },
    { name: "Gardens by the Bay", image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400" },
    { name: "Sentosa Island", image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400" },
    { name: "Universal Studios", image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400" }
  ],
  "thailand": [
    { name: "Phi Phi Islands", image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400" },
    { name: "Grand Palace Bangkok", image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400" },
    { name: "Chiang Mai Temples", image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400" },
    { name: "Pattaya Floating Market", image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400" }
  ],
  "malaysia": [
    { name: "Petronas Twin Towers", image: "https://images.unsplash.com/photo-1605538032432-a9f0c8d9baac?w=400" },
    { name: "Batu Caves", image: "https://images.unsplash.com/photo-1605538032432-a9f0c8d9baac?w=400" },
    { name: "Langkawi Cable Car", image: "https://images.unsplash.com/photo-1605538032432-a9f0c8d9baac?w=400" },
    { name: "Genting Highlands", image: "https://images.unsplash.com/photo-1605538032432-a9f0c8d9baac?w=400" }
  ],
  "indonesia": [
    { name: "Mount Batur", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400" },
    { name: "Uluwatu Temple", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400" },
    { name: "Ubud Monkey Forest", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400" },
    { name: "Tanah Lot", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400" }
  ],
  "japan": [
    { name: "Mount Fuji", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400" },
    { name: "Kyoto Fushimi Inari Shrine", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400" },
    { name: "Tokyo Skytree", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400" },
    { name: "Hiroshima Peace Memorial", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400" }
  ],
  "south korea": [
    { name: "Gyeongbokgung Palace", image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=400" },
    { name: "N Seoul Tower", image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=400" },
    { name: "Jeju Island Waterfalls", image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=400" },
    { name: "Bukchon Hanok Village", image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=400" }
  ],
  "china": [
    { name: "Great Wall of China", image: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400" },
    { name: "Forbidden City", image: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400" },
    { name: "Terracotta Army", image: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400" },
    { name: "Li River Guilin", image: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400" }
  ],
  "sri lanka": [
    { name: "Sigiriya Rock Fortress", image: "https://images.unsplash.com/photo-1546708973-b339540b5162?w=400" },
    { name: "Temple of the Tooth", image: "https://images.unsplash.com/photo-1546708973-b339540b5162?w=400" },
    { name: "Yala National Park", image: "https://images.unsplash.com/photo-1546708973-b339540b5162?w=400" },
    { name: "Ella Nine Arch Bridge", image: "https://images.unsplash.com/photo-1546708973-b339540b5162?w=400" }
  ],
  "nepal": [
    { name: "Everest Base Camp", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400" },
    { name: "Phewa Lake Pokhara", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400" },
    { name: "Kathmandu Durbar Square", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400" },
    { name: "Boudhanath Stupa", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400" }
  ],
  "bhutan": [
    { name: "Tiger's Nest Monastery", image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=400" },
    { name: "Punakha Dzong", image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=400" },
    { name: "Buddha Dordenma Statue", image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=400" },
    { name: "Paro Valley", image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=400" }
  ],
  "turkey": [
    { name: "Hagia Sophia", image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400" },
    { name: "Cappadocia Balloon Ride", image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400" },
    { name: "Pamukkale Thermal Pools", image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400" },
    { name: "Ephesus Ruins", image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400" }
  ],
  "switzerland": [
    { name: "Mount Titlis", image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400" },
    { name: "Lake Geneva", image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400" },
    { name: "Matterhorn Peak", image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400" },
    { name: "Interlaken Valleys", image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400" }
  ],
  "france": [
    { name: "Eiffel Tower", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400" },
    { name: "Louvre Museum", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400" },
    { name: "Palace of Versailles", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400" },
    { name: "French Riviera", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400" }
  ],
  "italy": [
    { name: "Colosseum Rome", image: "https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?w=400" },
    { name: "Venice Canals", image: "https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?w=400" },
    { name: "Leaning Tower of Pisa", image: "https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?w=400" },
    { name: "Amalfi Coast", image: "https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?w=400" }
  ],
  "spain": [
    { name: "Sagrada Familia", image: "https://images.unsplash.com/photo-1509840841025-9088ba78a826?w=400" },
    { name: "Royal Palace Madrid", image: "https://images.unsplash.com/photo-1509840841025-9088ba78a826?w=400" },
    { name: "Park Guell", image: "https://images.unsplash.com/photo-1509840841025-9088ba78a826?w=400" },
    { name: "Alhambra Palace", image: "https://images.unsplash.com/photo-1509840841025-9088ba78a826?w=400" }
  ],
  "greece": [
    { name: "Santorini Blue Domes", image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400" },
    { name: "Acropolis Athens", image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400" },
    { name: "Mykonos Windmills", image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400" },
    { name: "Meteora Monasteries", image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400" }
  ],
  "united kingdom": [
    { name: "Big Ben London", image: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=400" },
    { name: "Stonehenge", image: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=400" },
    { name: "Edinburgh Castle", image: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=400" },
    { name: "Tower Bridge", image: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=400" }
  ],
  "germany": [
    { name: "Neuschwanstein Castle", image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400" },
    { name: "Brandenburg Gate", image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400" },
    { name: "Black Forest Trails", image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400" },
    { name: "Cologne Cathedral", image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400" }
  ],
  "norway": [
    { name: "Geirangerfjord", image: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=400" },
    { name: "Lofoten Islands", image: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=400" },
    { name: "Northern Lights Tromso", image: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=400" },
    { name: "Pulpit Rock", image: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=400" }
  ],
  "finland": [
    { name: "Santa Claus Village", image: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?w=400" },
    { name: "Helsinki Cathedral", image: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?w=400" },
    { name: "Northern Lights Lapland", image: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?w=400" },
    { name: "Lake Saimaa", image: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?w=400" }
  ],
  "iceland": [
    { name: "Blue Lagoon", image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400" },
    { name: "Gullfoss Waterfall", image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400" },
    { name: "Jokulsarlon Glacier", image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400" },
    { name: "Black Sand Beach", image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400" }
  ],
  "australia": [
    { name: "Sydney Opera House", image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400" },
    { name: "Great Barrier Reef", image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400" },
    { name: "Uluru Rock", image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400" },
    { name: "Twelve Apostles", image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400" }
  ],
  "new zealand": [
    { name: "Milford Sound", image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400" },
    { name: "Hobbiton Movie Set", image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400" },
    { name: "Franz Josef Glacier", image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400" },
    { name: "Lake Tekapo", image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400" }
  ],
  "canada": [
    { name: "Niagara Falls", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400" },
    { name: "Banff National Park", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400" },
    { name: "CN Tower Toronto", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400" },
    { name: "Whistler Mountain", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400" }
  ],
  "united states": [
    { name: "Grand Canyon", image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400" },
    { name: "Statue of Liberty", image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400" },
    { name: "Yellowstone Park", image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400" },
    { name: "Golden Gate Bridge", image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400" }
  ],
  "mexico": [
    { name: "Chichen Itza Pyramids", image: "https://images.unsplash.com/photo-1518638150340-f706e86654de?w=400" },
    { name: "Cancun Beaches", image: "https://images.unsplash.com/photo-1518638150340-f706e86654de?w=400" },
    { name: "Tulum Ruins", image: "https://images.unsplash.com/photo-1518638150340-f706e86654de?w=400" },
    { name: "Mexico City Cathedral", image: "https://images.unsplash.com/photo-1518638150340-f706e86654de?w=400" }
  ],
  "egypt": [
    { name: "Pyramids of Giza", image: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=400" },
    { name: "The Sphinx", image: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=400" },
    { name: "Nile River Cruise", image: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=400" },
    { name: "Valley of the Kings", image: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=400" }
  ],
  "south africa": [
    { name: "Table Mountain", image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400" },
    { name: "Kruger National Park", image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400" },
    { name: "Cape of Good Hope", image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400" },
    { name: "Robben Island", image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400" }
  ]
};

export default function CountryAttractionsPage() {
  const { id } = useParams();
  const router = useRouter();

  // Strip parenthetical text (e.g. "Dubai (UAE)" -> "Dubai")
  const decodedId = typeof id === 'string' 
    ? decodeURIComponent(id).split(' ')[0].toLowerCase() 
    : '';

  const attractions = COUNTRY_ATTRACTIONS[decodedId] || [];

  const handleCardClick = (name: string) => {
    router.push(`/packages?destination=${encodeURIComponent(name)}`);
  };

  if (attractions.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-32 text-center bg-slate-950 text-slate-100 min-h-screen">
        <div className="rounded-2xl bg-rose-950/20 border border-rose-500/30 p-6 space-y-3">
          <h4 className="font-bold text-white">Location Not Found</h4>
          <p className="text-xs text-slate-400">No attractions directory found for "{id}"</p>
          <Link href="/international-tours" className="text-xs text-secondary font-bold hover:underline block mt-3">
            Back to International Tours
          </Link>
        </div>
      </div>
    );
  }

  // Capitalize properly
  const displayTitle = typeof id === 'string' 
    ? decodeURIComponent(id)
    : '';

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-28 sm:px-6 lg:px-8 space-y-8 animate-fade-in bg-slate-950 text-slate-100 min-h-screen">
      
      {/* Title block */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-secondary uppercase tracking-widest block">🌍 Famous Landmarks</span>
        <h1 className="text-3xl sm:text-5xl font-black text-white">{displayTitle} Attractions</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto font-medium">
          Discover all major tourist attractions in {displayTitle}. Select any landmark to view tour packages.
        </p>
      </div>

      {/* Grid of attraction cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
        {attractions.map((att, idx) => (
          <div
            key={idx}
            onClick={() => handleCardClick(att.name)}
            className="group relative h-48 rounded-2xl overflow-hidden border border-secondary/20 shadow-lg hover:border-secondary hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          >
            <img
              src={att.image}
              alt={att.name}
              className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-center sm:text-left">
              <h3 className="text-sm sm:text-base font-extrabold text-white group-hover:text-secondary transition-colors">
                {att.name}
              </h3>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
