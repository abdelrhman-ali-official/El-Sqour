const vehicleTypeImages: Record<number, string> = {
  1: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
  2: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=900&q=80",
  3: "https://images.unsplash.com/photo-1502872364588-894d37d99971?auto=format&fit=crop&w=900&q=80",
  4: "https://images.unsplash.com/photo-1509749837427-ac94a2553d0e?auto=format&fit=crop&w=900&q=80",
  5: "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=900&q=80"
};

const fallbackImage =
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80";

export function getVehicleImage(vehicleTypeId?: number) {
  if (!vehicleTypeId) return fallbackImage;
  return vehicleTypeImages[vehicleTypeId] ?? fallbackImage;
}
