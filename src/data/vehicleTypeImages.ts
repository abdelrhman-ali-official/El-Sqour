const commonsFileUrl = (fileName: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}`;

const vehicleTypeImages: Record<number, string> = {
  1: commonsFileUrl("2025 Toyota HiAce front (with barn doors).jpg"),
  2: commonsFileUrl("2019 Toyota HiAce (front).jpg"),
  3: commonsFileUrl("Toyota Coaster XZB70R 6.9m.jpg"),
  4: commonsFileUrl("Hyundai H1 Van 2019.jpg"),
  5: commonsFileUrl("Moscow, Toyota Camry (XV70), Aug 2025 01.jpg"),
  6: commonsFileUrl("Mercedes-Benz E 200 d AMG Line (W 214) – f 05072025.jpg")
};

const fallbackImage = commonsFileUrl("2019 Toyota HiAce (front).jpg");

export function getVehicleImage(vehicleTypeId?: number) {
  if (!vehicleTypeId) return fallbackImage;
  return vehicleTypeImages[vehicleTypeId] ?? fallbackImage;
}
