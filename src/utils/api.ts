const API_BASE_URL = import.meta.env.VITE_API_URL ?? "https://sqour.runasp.net";

type TripRoutesResponse = {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  data: TripRoute[];
};

export type TripBooking = {
  id: number;
  tripRouteId: number;
  fromGovernorateName: string;
  toGovernorateName: string;
  vehicleTypeName: string;
  price: number;
  pickupPoint: string;
  dropoffPoint: string;
  travelDate: string;
  passengerCount: number;
  contactName: string;
  contactPhone: string;
  notes: string;
  status: number;
  createdAt: string;
  userEmail: string;
};

export type TripBookingsResponse = {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  data: TripBooking[];
};

export type TripDashboardTopRoute = {
  tripRouteId: number;
  fromGovernorateName: string;
  toGovernorateName: string;
  vehicleTypeName: string;
  bookingCount: number;
  revenue: number;
};

export type TripDashboardTopVehicleType = {
  vehicleTypeId: number;
  vehicleTypeName: string;
  bookingCount: number;
  revenue: number;
};

export type TripDashboardSummary = {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  confirmedRevenue: number;
  totalRoutes: number;
  activeRoutes: number;
  generatedAt: string;
  topRoutes: TripDashboardTopRoute[];
  topVehicleTypes: TripDashboardTopVehicleType[];
};

export type Governorate = {
  id: number;
  name: string;
};

export type VehicleType = {
  id: number;
  name: string;
  capacity: number;
};

export type TripRoute = {
  id: number;
  fromGovernorateId: number;
  fromGovernorateName: string;
  toGovernorateId: number;
  toGovernorateName: string;
  vehicleTypeId: number;
  vehicleTypeName: string;
  price: number;
  isActive: boolean;
};

export type AvailableRoutesParams = {
  fromGovernorateId: number;
  toGovernorateId: number;
  travelDate: string;
  passengerCount: number;
};

let governoratesCache: Governorate[] | null = null;
let governoratesPromise: Promise<Governorate[]> | null = null;
let vehicleTypesCache: VehicleType[] | null = null;
let vehicleTypesPromise: Promise<VehicleType[]> | null = null;

async function fetchJson<T>(path: string) {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error("تعذر تحميل البيانات من الخادم.");
  }
  return (await response.json()) as T;
}

async function fetchJsonWithAuth<T>(path: string, token: string, init?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

async function readApiError(response: Response) {
  try {
    const body = await response.json();
    return body?.message || body?.title || "تعذر إتمام العملية.";
  } catch {
    return "تعذر إتمام العملية.";
  }
}

export function clearReferenceDataCache() {
  governoratesCache = null;
  governoratesPromise = null;
  vehicleTypesCache = null;
  vehicleTypesPromise = null;
}

export async function fetchGovernorates() {
  if (governoratesCache) return governoratesCache;
  if (!governoratesPromise) {
    governoratesPromise = fetchJson<Governorate[]>("/api/Governorates").then(
      (data) => {
        governoratesCache = data;
        return data;
      }
    );
  }
  return governoratesPromise;
}

export async function fetchVehicleTypes() {
  if (vehicleTypesCache) return vehicleTypesCache;
  if (!vehicleTypesPromise) {
    vehicleTypesPromise = fetchJson<VehicleType[]>("/api/VehicleTypes").then((data) => {
      vehicleTypesCache = data;
      return data;
    });
  }
  return vehicleTypesPromise;
}

export async function createGovernorate(token: string, payload: { name: string }) {
  await fetchJsonWithAuth<void>("/api/Governorates", token, {
    method: "POST",
    body: JSON.stringify(payload)
  });
  clearReferenceDataCache();
}

export async function updateGovernorate(token: string, id: number, payload: { name: string }) {
  await fetchJsonWithAuth<void>(`/api/Governorates/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
  clearReferenceDataCache();
}

export async function deleteGovernorate(token: string, id: number) {
  await fetchJsonWithAuth<void>(`/api/Governorates/${id}`, token, {
    method: "DELETE"
  });
  clearReferenceDataCache();
}

export async function createVehicleType(token: string, payload: { name: string; capacity: number }) {
  await fetchJsonWithAuth<void>("/api/VehicleTypes", token, {
    method: "POST",
    body: JSON.stringify(payload)
  });
  clearReferenceDataCache();
}

export async function updateVehicleType(
  token: string,
  id: number,
  payload: { name: string; capacity: number }
) {
  await fetchJsonWithAuth<void>(`/api/VehicleTypes/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
  clearReferenceDataCache();
}

export async function deleteVehicleType(token: string, id: number) {
  await fetchJsonWithAuth<void>(`/api/VehicleTypes/${id}`, token, {
    method: "DELETE"
  });
  clearReferenceDataCache();
}

export async function createTripRoute(
  token: string,
  payload: {
    fromGovernorateId: number;
    toGovernorateId: number;
    vehicleTypeId: number;
    price: number;
    isActive: boolean;
  }
) {
  await fetchJsonWithAuth<void>("/api/TripRoutes", token, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateTripRoute(
  token: string,
  id: number,
  payload: {
    fromGovernorateId: number;
    toGovernorateId: number;
    vehicleTypeId: number;
    price: number;
    isActive: boolean;
  }
) {
  await fetchJsonWithAuth<void>(`/api/TripRoutes/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function deleteTripRoute(token: string, id: number) {
  await fetchJsonWithAuth<void>(`/api/TripRoutes/${id}`, token, {
    method: "DELETE"
  });
}

export async function fetchTripRoutes(token: string, pageIndex = 1, pageSize = 10) {
  const url = new URL(`${API_BASE_URL}/api/TripRoutes`);
  url.searchParams.set("pageIndex", String(pageIndex));
  url.searchParams.set("pageSize", String(pageSize));

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return (await response.json()) as TripRoutesResponse;
}

export async function fetchTripBookingsAdmin(token: string, pageIndex = 1, pageSize = 10) {
  const url = new URL(`${API_BASE_URL}/api/TripBookings/admin`);
  url.searchParams.set("pageIndex", String(pageIndex));
  url.searchParams.set("pageSize", String(pageSize));

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return (await response.json()) as TripBookingsResponse;
}

export async function updateTripBookingStatus(token: string, id: number, status: number) {
  await fetchJsonWithAuth<void>(`/api/TripBookings/admin/${id}/status`, token, {
    method: "PUT",
    body: JSON.stringify({ status })
  });
}

export async function fetchTripDashboard(token: string) {
  return fetchJsonWithAuth<TripDashboardSummary>("/api/TripDashboard", token);
}

export async function fetchAvailableRoutes(params: AvailableRoutesParams) {
  const url = new URL(`${API_BASE_URL}/api/TripRoutes/available`);
  url.searchParams.set("FromGovernorateId", String(params.fromGovernorateId));
  url.searchParams.set("ToGovernorateId", String(params.toGovernorateId));
  url.searchParams.set(
    "TravelDate",
    params.travelDate.includes("T") ? params.travelDate : `${params.travelDate}T00:00:00`
  );
  url.searchParams.set("PassengerCount", String(params.passengerCount));

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("تعذر تحميل الرحلات المتاحة.");
  }
  return (await response.json()) as TripRoutesResponse;
}

export async function fetchMyTripBookings(token: string, pageIndex = 1, pageSize = 20) {
  const url = new URL(`${API_BASE_URL}/api/TripBookings/me`);
  url.searchParams.set("pageIndex", String(pageIndex));
  url.searchParams.set("pageSize", String(pageSize));

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return (await response.json()) as TripBookingsResponse;
}
