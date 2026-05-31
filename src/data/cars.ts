const commonsFileUrl = (fileName: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}`;

export const cars = [
  {
    id: "toyota-hiace-high-roof",
    name: "تويوتا هاي إس سقف عالي",
    seats: "14 راكب",
    ac: "مكيف بالكامل",
    price: "مثالي للرحلات الجماعية",
    image: commonsFileUrl("2025 Toyota HiAce front (with barn doors).jpg")
  },
  {
    id: "toyota-hiace-standard",
    name: "تويوتا هاي إس عادي",
    seats: "12 راكب",
    ac: "مكيف بالكامل",
    price: "مثالي للرحلات العائلية",
    image: commonsFileUrl("2019 Toyota HiAce (front).jpg")
  },
  {
    id: "toyota-coaster",
    name: "تويوتا كوستر",
    seats: "28 راكب",
    ac: "مكيف قوي",
    price: "مثالي للمجموعات الكبيرة",
    image: commonsFileUrl("Toyota Coaster XZB70R 6.9m.jpg")
  },
  {
    id: "hyundai-h1",
    name: "Hyundai H1",
    seats: "7 ركاب",
    ac: "مكيف ممتاز",
    price: "مناسب للرحلات الخاصة",
    image: commonsFileUrl("Hyundai H1 Van 2019.jpg")
  },
  {
    id: "toyota-camry",
    name: "تويوتا كامري",
    seats: "4 ركاب",
    ac: "راحة وسلاسة",
    price: "مناسب لرحلات كبار الشخصيات",
    image: commonsFileUrl("Moscow, Toyota Camry (XV70), Aug 2025 01.jpg")
  },
  {
    id: "mercedes-e-class",
    name: "مرسيدس E-Class",
    seats: "4 ركاب",
    ac: "فخامة كاملة",
    price: "VIP / Business travel",
    image: commonsFileUrl("Mercedes-Benz E 200 d AMG Line (W 214) – f 05072025.jpg")
  }
];
