'use client';

import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';

interface Attraction {
  name: string;
  image: string;
}

const STATE_ATTRACTIONS: Record<string, Attraction[]> = {
  "andhra pradesh": [
    { name: "Araku Valley", image: "https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?w=400" },
    { name: "Tirupati Temple", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400" },
    { name: "Borra Caves", image: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400" },
    { name: "Visakhapatnam Beaches", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400" }
  ],
  "arunachal pradesh": [
    { name: "Tawang Monastery", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400" },
    { name: "Ziro Valley", image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400" },
    { name: "Namdapha National Park", image: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400" },
    { name: "Sela Pass", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400" }
  ],
  "assam": [
    { name: "Kaziranga National Park", image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400" },
    { name: "Kamakhya Temple", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400" },
    { name: "Majuli Island", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400" },
    { name: "Haflong Hills", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400" }
  ],
  "bihar": [
    { name: "Bodh Gaya (Mahabodhi Temple)", image: "https://images.unsplash.com/photo-1622396481328-9b1b78cdd9fd?w=400" },
    { name: "Nalanda Ruins", image: "https://images.unsplash.com/photo-1509840841025-9088ba78a826?w=400" },
    { name: "Sanjay Gandhi Park", image: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400" },
    { name: "Rajgir Hills", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400" }
  ],
  "chhattisgarh": [
    { name: "Chitrakote Falls", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400" },
    { name: "Bastar Palace", image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400" },
    { name: "Kanger Valley National Park", image: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400" },
    { name: "Bhoramdeo Temple", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400" }
  ],
  "goa": [
    { name: "Calangute Beach", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400" },
    { name: "Basilica of Bom Jesus", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400" },
    { name: "Dudhsagar Falls", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400" },
    { name: "Fort Aguada", image: "https://images.unsplash.com/photo-1509840841025-9088ba78a826?w=400" }
  ],
  "gujarat": [
    { name: "Rann of Kutch", image: "https://images.unsplash.com/photo-1509840841025-9088ba78a826?w=400" },
    { name: "Gir National Park", image: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400" },
    { name: "Somnath Temple", image: "https://images.unsplash.com/photo-1599930190518-e3952a220556?w=400" },
    { name: "Statue of Unity", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400" }
  ],
  "haryana": [
    { name: "Sultanpur National Park", image: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400" },
    { name: "Kurukshetra Battlefield", image: "https://images.unsplash.com/photo-1543872084-c7bd3822856f?w=400" },
    { name: "Surajkund Lake", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400" },
    { name: "Pinjore Gardens", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400" }
  ],
  "himachal pradesh": [
    { name: "Solang Valley", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400" },
    { name: "Rohtang Pass", image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=400" },
    { name: "Shimla Mall Road", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400" },
    { name: "Spiti Valley", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400" }
  ],
  "jharkhand": [
    { name: "Hundru Falls", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400" },
    { name: "Deoghar Baidyanath Temple", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400" },
    { name: "Betla National Park", image: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400" },
    { name: "Jubilee Park", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400" }
  ],
  "karnataka": [
    { name: "Hampi Ruins", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400" },
    { name: "Mysore Palace", image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400" },
    { name: "Coorg Coffee Plantations", image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400" },
    { name: "Jog Falls", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400" }
  ],
  "kerala": [
    { name: "Alleppey Backwaters", image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=400" },
    { name: "Munnar Tea Gardens", image: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=400" },
    { name: "Wayanad Wildlife", image: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400" },
    { name: "Kovalam Beach", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400" }
  ],
  "madhya pradesh": [
    { name: "Khajuraho Temples", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400" },
    { name: "Sanchi Stupa", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400" },
    { name: "Kanha National Park", image: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400" },
    { name: "Gwalior Fort", image: "https://images.unsplash.com/photo-1509840841025-9088ba78a826?w=400" }
  ],
  "maharashtra": [
    { name: "Ajanta Caves", image: "https://images.unsplash.com/photo-1598128558393-70ff21433be0?w=400" },
    { name: "Gateway of India", image: "https://images.unsplash.com/photo-1562979314-bee7453e911c?w=400" },
    { name: "Lonavala Hills", image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400" },
    { name: "Mahabaleshwar", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400" }
  ],
  "manipur": [
    { name: "Loktak Lake", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400" },
    { name: "Kangla Fort", image: "https://images.unsplash.com/photo-1509840841025-9088ba78a826?w=400" },
    { name: "Imphal Valley", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400" },
    { name: "Shirui Peak", image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400" }
  ],
  "meghalaya": [
    { name: "Living Root Bridges", image: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400" },
    { name: "Nohkalikai Falls", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400" },
    { name: "Mawlynnong Village", image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400" },
    { name: "Shillong Peak", image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400" }
  ],
  "mizoram": [
    { name: "Vantawng Falls", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400" },
    { name: "Phawngpui Blue Mountain", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400" },
    { name: "Reiek Heritage Village", image: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=400" },
    { name: "Tam Dil Lake", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400" }
  ],
  "nagaland": [
    { name: "Dzukou Valley", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400" },
    { name: "Kohima War Cemetery", image: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=400" },
    { name: "Khonoma Village", image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400" },
    { name: "Kisama Heritage Village", image: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=400" }
  ],
  "odisha": [
    { name: "Konark Sun Temple", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400" },
    { name: "Jagannath Puri Temple", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400" },
    { name: "Chilika Lake", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400" },
    { name: "Udayagiri Caves", image: "https://images.unsplash.com/photo-1509840841025-9088ba78a826?w=400" }
  ],
  "punjab": [
    { name: "Golden Temple", image: "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=400" },
    { name: "Wagah Border", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400" },
    { name: "Jallianwala Bagh", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400" },
    { name: "Rock Garden", image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400" }
  ],
  "rajasthan": [
    { name: "Amber Palace", image: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=400" },
    { name: "Hawa Mahal", image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400" },
    { name: "Lake Pichola", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400" },
    { name: "Mehrangarh Fort", image: "https://images.unsplash.com/photo-1509840841025-9088ba78a826?w=400" }
  ],
  "sikkim": [
    { name: "Tsomgo Lake", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400" },
    { name: "Nathula Pass", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400" },
    { name: "Gurudongmar Lake", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400" },
    { name: "Rumtek Monastery", image: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=400" }
  ],
  "tamil nadu": [
    { name: "Meenakshi Amman Temple", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400" },
    { name: "Ooty Botanical Gardens", image: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400" },
    { name: "Marina Beach", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400" },
    { name: "Shore Temple", image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400" }
  ],
  "telangana": [
    { name: "Charminar", image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400" },
    { name: "Golconda Fort", image: "https://images.unsplash.com/photo-1509840841025-9088ba78a826?w=400" },
    { name: "Ramappa Temple", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400" },
    { name: "Hussain Sagar Lake", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400" }
  ],
  "tripura": [
    { name: "Neermahal Palace", image: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=400" },
    { name: "Unakoti Rock Carvings", image: "https://images.unsplash.com/photo-1598128558393-70ff21433be0?w=400" },
    { name: "Ujjayanta Palace", image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400" },
    { name: "Sepahijala Sanctuary", image: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400" }
  ],
  "uttar pradesh": [
    { name: "Taj Mahal", image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400" },
    { name: "Varanasi Ghats", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400" },
    { name: "Agra Fort", image: "https://images.unsplash.com/photo-1509840841025-9088ba78a826?w=400" },
    { name: "Fatehpur Sikri", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400" }
  ],
  "uttarakhand": [
    { name: "Rishikesh Lakshman Jhula", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400" },
    { name: "Valley of Flowers", image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400" },
    { name: "Nainital Lake", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400" },
    { name: "Kedarnath Temple", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400" }
  ],
  "west bengal": [
    { name: "Darjeeling Himalayan Railway", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400" },
    { name: "Sundarbans National Park", image: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400" },
    { name: "Victoria Memorial", image: "https://images.unsplash.com/photo-1558431382-27e303142255?w=400" },
    { name: "Howrah Bridge", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400" }
  ],
  
  // Union Territories
  "andaman and nicobar islands": [
    { name: "Radhanagar Beach", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400" },
    { name: "Cellular Jail", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400" },
    { name: "Ross Island", image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400" },
    { name: "Havelock Island", image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=400" }
  ],
  "chandigarh": [
    { name: "Rock Garden", image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400" },
    { name: "Sukhna Lake", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400" },
    { name: "Rose Garden", image: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400" },
    { name: "Open Hand Monument", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400" }
  ],
  "dadra and nagar haveli and daman and diu": [
    { name: "Diu Fort", image: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400" },
    { name: "Naida Caves", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400" },
    { name: "Devka Beach", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400" },
    { name: "Jampore Beach", image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=400" }
  ],
  "delhi": [
    { name: "Red Fort", image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400" },
    { name: "Qutub Minar", image: "https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?w=400" },
    { name: "India Gate", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400" },
    { name: "Lotus Temple", image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400" }
  ],
  "jammu and kashmir": [
    { name: "Dal Lake", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400" },
    { name: "Gulmarg Gondola", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400" },
    { name: "Shalimar Bagh", image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400" },
    { name: "Pahalgam Valley", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400" }
  ],
  "ladakh": [
    { name: "Pangong Lake", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400" },
    { name: "Nubra Valley", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400" },
    { name: "Khardung La Pass", image: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=400" },
    { name: "Magnetic Hill", image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400" }
  ],
  "lakshadweep": [
    { name: "Agatti Island", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400" },
    { name: "Bangaram Beach", image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=400" },
    { name: "Kavaratti Lagoon", image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400" },
    { name: "Minicoy Lighthouse", image: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400" }
  ],
  "puducherry": [
    { name: "Promenade Beach", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400" },
    { name: "Auroville Dome", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400" },
    { name: "French Quarter Streets", image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=400" },
    { name: "Paradise Beach", image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400" }
  ]
};

export default function StateAttractionsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { apiUrl } = useApp();

  const decodedId = typeof id === 'string' ? decodeURIComponent(id).toLowerCase() : '';
  const attractions = STATE_ATTRACTIONS[decodedId] || [];

  const handleCardClick = async (name: string) => {
    try {
      const res = await fetch(`${apiUrl}/api/packages/search?destination=${encodeURIComponent(decodedId)}`);
      const data = await res.json();
      if (res.ok && data.length > 0) {
        router.push(`/packages/${data[0].id}`);
      } else {
        alert('Package details are currently unavailable for this destination.');
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching package details.');
    }
  };

  if (attractions.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-32 text-center bg-slate-50 text-slate-900 min-h-screen flex flex-col justify-center">
        <div className="rounded-[18px] bg-rose-50 border border-rose-100 p-6 space-y-3 shadow-sm">
          <h4 className="font-bold text-slate-950 font-sans">Location Not Found</h4>
          <p className="text-xs text-rose-600 font-semibold">No attractions directory found for "{id}"</p>
          <Link href="/national-tours" className="text-xs text-amber-500 font-bold hover:underline block mt-3">
            Back to National Tours
          </Link>
        </div>
      </div>
    );
  }

  const displayTitle = decodedId
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-24 sm:px-6 lg:px-8 space-y-8 animate-fade-in bg-slate-50 text-slate-900 min-h-screen font-sans">
      
      {/* Title block */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="text-xs font-bold text-amber-500 uppercase tracking-widest block font-sans">🇮🇳 Famous Landmarks</span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight font-sans">{displayTitle} Attractions</h1>
        <p className="text-xs sm:text-sm text-slate-500 font-semibold max-w-lg mx-auto leading-relaxed">
          Discover major landmarks in {displayTitle}. Select any tourist attraction to view active escorted package itineraries.
        </p>
      </div>

      {/* Grid of attraction cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
        {attractions.map((att, idx) => (
          <div
            key={idx}
            onClick={() => handleCardClick(att.name)}
            className="group relative h-48 rounded-[18px] overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer bg-white p-1"
          >
            <div className="relative h-full w-full rounded-2xl overflow-hidden">
              <img
                src={att.image}
                alt={att.name}
                className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-center sm:text-left">
                <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition-colors font-sans">
                  {att.name}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
