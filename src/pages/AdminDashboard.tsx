import { motion } from "framer-motion";
import {
  ArrowLeft,
  BarChart3,
  CalendarCheck2,
  CircleDollarSign,
  FileText,
  Loader2,
  MapPin,
  Menu,
  PencilLine,
  Plus,
  RefreshCw,
  Route as RouteIcon,
  Save,
  ShieldCheck,
  Trash2,
  Truck,
  Users,
  X
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  clearReferenceDataCache,
  createGovernorate,
  createTripRoute,
  createVehicleType,
  deleteGovernorate,
  deleteTripRoute,
  deleteVehicleType,
  fetchGovernorates,
  fetchCorporateTransportationRequests,
  fetchTripBookingsAdmin,
  fetchTripDashboard,
  fetchTripRoutes,
  fetchVehicleTypes,
  type Governorate,
  type CorporateTransportationRequest,
  type TripBooking,
  type TripDashboardSummary,
  type TripDashboardTopRoute,
  type TripDashboardTopVehicleType,
  type TripRoute,
  type VehicleType,
  updateGovernorate,
  updateCorporateTransportationStatus,
  updateTripBookingStatus,
  updateTripRoute,
  updateVehicleType
} from "../utils/api";
import { stagger } from "../utils/motion";

type GovernorateFormState = {
  id: number | null;
  name: string;
};

type VehicleTypeFormState = {
  id: number | null;
  name: string;
  capacity: string;
};

type TripRouteFormState = {
  id: string;
  fromGovernorateId: string;
  toGovernorateId: string;
  vehicleTypeId: string;
  price: string;
  isActive: boolean;
};

const bookingStatusOptions = [
  { value: 1, label: "Pending" },
  { value: 2, label: "Confirmed" },
  { value: 3, label: "Cancelled" }
];

const corporateStatusOptions = [
  { value: 1, label: "Pending" },
  { value: 2, label: "UnderReview" },
  { value: 3, label: "Quoted" },
  { value: 4, label: "Accepted" },
  { value: 5, label: "Rejected" },
  { value: 6, label: "Cancelled" }
];

const corporateStatusMeta: Record<number, { label: string; className: string }> = {
  1: { label: "Pending", className: "bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20" },
  2: { label: "Under review", className: "bg-blue-500/10 text-blue-700 ring-1 ring-blue-500/20" },
  3: { label: "Quoted", className: "bg-violet-500/10 text-violet-700 ring-1 ring-violet-500/20" },
  4: { label: "Accepted", className: "bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20" },
  5: { label: "Rejected", className: "bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/20" },
  6: { label: "Cancelled", className: "bg-slate-500/10 text-slate-700 ring-1 ring-slate-500/20" }
};

const corporateAllowedTransitions: Record<number, number[]> = { 1: [2, 6], 2: [3, 5, 6], 3: [4, 5] };

function getCorporateStatusOptions(currentStatus: number) {
  const availableStatuses = new Set([currentStatus, ...(corporateAllowedTransitions[currentStatus] ?? [])]);
  return corporateStatusOptions.filter((option) => availableStatuses.has(option.value));
}

const statusMeta: Record<number, { label: string; className: string }> = {
  1: { label: "Pending", className: "bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20" },
  2: { label: "Confirmed", className: "bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20" },
  3: { label: "Cancelled", className: "bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/20" }
};

const sectionChrome = "rounded-[2rem] border border-slate-200/80 bg-white/88 shadow-soft backdrop-blur";

function currency(value: number) {
  return new Intl.NumberFormat("ar-EG").format(value || 0);
}

function formatDateTime(value: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function SectionCard({
  title,
  description,
  icon,
  children,
  action,
  id
}: {
  title: string;
  description?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className={sectionChrome}>
      <div className="mb-6 flex flex-col gap-4 border-b border-slate-200/70 px-6 pt-6 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3 text-right">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-red/10 text-brand-red ring-1 ring-brand-red/10">
            {icon}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-brand-dark">{title}</h3>
            {description ? <p className="mt-1 text-sm leading-7 text-slate-500">{description}</p> : null}
          </div>
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      <div className="px-6 pb-6">{children}</div>
    </section>
  );
}

function MetricCard({
  icon,
  label,
  value,
  hint
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-5 shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-brand-dark">{value}</p>
          <p className="mt-2 text-xs leading-6 text-slate-500">{hint}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-red/10 text-brand-red ring-1 ring-brand-red/10">
          {icon}
        </div>
      </div>
    </div>
  );
}

function AdminListItem({
  title,
  subtitle,
  actions
}: {
  title: string;
  subtitle: string;
  actions: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold text-brand-dark">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      {actions}
    </div>
  );
}

function CompactAccordion({
  title,
  count,
  children,
  defaultOpen = true,
  searchValue,
  onSearchChange,
  searchPlaceholder = "ابحث داخل القائمة",
  maxHeightClass = "max-h-[24rem]"
}: {
  title: string;
  count: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  maxHeightClass?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        className="flex w-full items-center justify-between gap-4 text-right"
      >
        <div>
          <p className="font-semibold text-brand-dark">{title}</p>
          <p className="mt-1 text-xs text-slate-500">{count} عنصر</p>
        </div>
        <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
          {open ? "إخفاء" : "عرض"}
        </span>
      </button>
      {open ? (
        <div className="mt-4 space-y-3">
          {onSearchChange ? (
            <input
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-red/40 focus:ring-2 focus:ring-brand-red/15"
            />
          ) : null}
          <div className={`space-y-3 overflow-y-auto pr-1 ${maxHeightClass}`}>{children}</div>
        </div>
      ) : null}
    </div>
  );
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [dashboard, setDashboard] = useState<TripDashboardSummary | null>(null);
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [corporateRequests, setCorporateRequests] = useState<CorporateTransportationRequest[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [tripRoutes, setTripRoutes] = useState<TripRoute[]>([]);
  const [bookings, setBookings] = useState<TripBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [routesLoading, setRoutesLoading] = useState(false);
  const [corporateLoading, setCorporateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [bookingPageIndex, setBookingPageIndex] = useState(1);
  const [bookingPageSize, setBookingPageSize] = useState(10);
  const [bookingTotalCount, setBookingTotalCount] = useState(0);
  const [routePageIndex, setRoutePageIndex] = useState(1);
  const [routePageSize, setRoutePageSize] = useState(6);
  const [routeTotalCount, setRouteTotalCount] = useState(0);
  const [corporateRequestPage, setCorporateRequestPage] = useState(1);
  const [corporateRequestTotal, setCorporateRequestTotal] = useState(0);
  const [statusDrafts, setStatusDrafts] = useState<Record<number, number>>({});
  const [corporateStatusDrafts, setCorporateStatusDrafts] = useState<Record<number, number>>({});
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [governorateForm, setGovernorateForm] = useState<GovernorateFormState>({
    id: null,
    name: ""
  });
  const [vehicleForm, setVehicleForm] = useState<VehicleTypeFormState>({
    id: null,
    name: "",
    capacity: ""
  });
  const [tripRouteForm, setTripRouteForm] = useState<TripRouteFormState>({
    id: "",
    fromGovernorateId: "",
    toGovernorateId: "",
    vehicleTypeId: "",
    price: "",
    isActive: true
  });
  const [governorateSearch, setGovernorateSearch] = useState("");
  const [vehicleTypeSearch, setVehicleTypeSearch] = useState("");
  const [tripRouteSearch, setTripRouteSearch] = useState("");
  const [adminNavOpen, setAdminNavOpen] = useState(false);

  const token = user?.token ?? "";

  const loadCorporateRequests = useCallback(async (pageIndex = 1) => {
    if (!token) return;
    setCorporateLoading(true);
    try {
      const result = await fetchCorporateTransportationRequests(token, pageIndex, 10);
      setCorporateRequests(result.data);
      setCorporateRequestPage(result.pageIndex || pageIndex);
      setCorporateRequestTotal(result.totalCount);
      setCorporateStatusDrafts(
        Object.fromEntries(result.data.map((request) => [request.id ?? 0, request.status]))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحميل طلبات نقل الموظفين.");
    } finally {
      setCorporateLoading(false);
    }
  }, [token]);

  const loadData = useCallback(
    async (pageIndex = 1, silent = false) => {
      if (!token) return;

      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError(null);

      try {
        const [dashboardData, governorateData, vehicleTypeData, bookingData] = await Promise.all([
          fetchTripDashboard(token),
          fetchGovernorates(),
          fetchVehicleTypes(),
          fetchTripBookingsAdmin(token, pageIndex, bookingPageSize)
        ]);

        setDashboard(dashboardData);
        setGovernorates(governorateData);
        setVehicleTypes(vehicleTypeData);
        setBookings(bookingData.data);
        setBookingPageIndex(bookingData.pageIndex || pageIndex);
        setBookingPageSize(bookingData.pageSize || bookingPageSize);
        setBookingTotalCount(bookingData.totalCount);
        setStatusDrafts(
          Object.fromEntries(bookingData.data.map((booking) => [booking.id, booking.status]))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "تعذر تحميل لوحة الإدارة.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [bookingPageSize, token]
  );

  useEffect(() => {
    void loadData(1, false);
  }, [loadData, token]);

  const loadRoutes = useCallback(
    async (pageIndex = 1, silent = false) => {
      if (!token) return;

      if (!silent) {
        setRoutesLoading(true);
      }

      try {
        const routeData = await fetchTripRoutes(token, pageIndex, routePageSize);
        setTripRoutes(routeData.data);
        setRoutePageIndex(routeData.pageIndex || pageIndex);
        setRoutePageSize(routeData.pageSize || routePageSize);
        setRouteTotalCount(routeData.totalCount);
      } catch (err) {
        setError(err instanceof Error ? err.message : "تعذر تحميل الرحلات.");
      } finally {
        setRoutesLoading(false);
      }
    },
    [routePageSize, token]
  );

  useEffect(() => {
    void loadRoutes(routePageIndex, false);
  }, [loadRoutes, routePageIndex, token]);

  useEffect(() => {
    void loadCorporateRequests();
  }, [loadCorporateRequests]);

  const summaryCards = useMemo(
    () => [
      {
        label: "إجمالي الحجوزات",
        value: currency(dashboard?.totalBookings ?? 0),
        hint: "كل الحجوزات المسجلة حتى الآن",
        icon: <CalendarCheck2 className="h-5 w-5" />
      },
      {
        label: "الإيراد الإجمالي",
        value: `${currency(dashboard?.totalRevenue ?? 0)} ج.م`,
        hint: "قبل خصم أي مصاريف تشغيلية",
        icon: <CircleDollarSign className="h-5 w-5" />
      },
      {
        label: "المسارات النشطة",
        value: currency(dashboard?.activeRoutes ?? 0),
        hint: "الرحلات الجاهزة للحجز",
        icon: <RouteIcon className="h-5 w-5" />
      },
      {
        label: "معدل التأكيد",
        value:
          dashboard && dashboard.totalBookings
            ? `${Math.round((dashboard.confirmedBookings / dashboard.totalBookings) * 100)}%`
            : "0%",
        hint: "نسبة الحجوزات المؤكدة",
        icon: <ShieldCheck className="h-5 w-5" />
      }
    ],
    [dashboard]
  );

  const governorateRefs = useMemo(() => new Map(governorates.map((item) => [item.id, item.name])), [governorates]);
  const vehicleTypeRefs = useMemo(() => new Map(vehicleTypes.map((item) => [item.id, item.name])), [vehicleTypes]);
  const filteredGovernorates = useMemo(() => {
    const query = governorateSearch.trim().toLowerCase();
    if (!query) return governorates;
    return governorates.filter((item) => item.name.toLowerCase().includes(query));
  }, [governorates, governorateSearch]);

  const filteredVehicleTypes = useMemo(() => {
    const query = vehicleTypeSearch.trim().toLowerCase();
    if (!query) return vehicleTypes;
    return vehicleTypes.filter(
      (item) => item.name.toLowerCase().includes(query) || String(item.capacity).includes(query)
    );
  }, [vehicleTypes, vehicleTypeSearch]);
  const filteredTripRoutes = useMemo(() => {
    const query = tripRouteSearch.trim().toLowerCase();
    if (!query) return tripRoutes;
    return tripRoutes.filter(
      (item) =>
        item.fromGovernorateName.toLowerCase().includes(query) ||
        item.toGovernorateName.toLowerCase().includes(query) ||
        item.vehicleTypeName.toLowerCase().includes(query) ||
        String(item.price).includes(query) ||
        String(item.id).includes(query)
    );
  }, [tripRoutes, tripRouteSearch]);
  const totalRoutePages = Math.max(1, Math.ceil(routeTotalCount / routePageSize));

  const resetGovernorateForm = () => setGovernorateForm({ id: null, name: "" });
  const resetVehicleForm = () => setVehicleForm({ id: null, name: "", capacity: "" });
  const resetTripRouteForm = () =>
    setTripRouteForm({
      id: "",
      fromGovernorateId: "",
      toGovernorateId: "",
      vehicleTypeId: "",
      price: "",
      isActive: true
    });

  const handleGovernorateSave = async () => {
    if (!governorateForm.name.trim()) {
      setError("يرجى إدخال اسم المحافظة.");
      return;
    }

    if (!token) return;

    const key = governorateForm.id ? `gov-${governorateForm.id}` : "gov-new";
    setBusyKey(key);
    setError(null);
    setSuccess(null);

    try {
      if (governorateForm.id) {
        await updateGovernorate(token, governorateForm.id, { name: governorateForm.name.trim() });
        setSuccess("تم تحديث المحافظة بنجاح.");
      } else {
        await createGovernorate(token, { name: governorateForm.name.trim() });
        setSuccess("تمت إضافة المحافظة بنجاح.");
      }

      clearReferenceDataCache();
      resetGovernorateForm();
      await loadData(bookingPageIndex, true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر حفظ المحافظة.");
    } finally {
      setBusyKey(null);
    }
  };

  const handleGovernorateDelete = async (id: number) => {
    if (!token) return;
    if (!window.confirm("هل تريد حذف هذه المحافظة؟")) return;

    setBusyKey(`gov-${id}`);
    setError(null);
    setSuccess(null);

    try {
      await deleteGovernorate(token, id);
      clearReferenceDataCache();
      if (governorateForm.id === id) {
        resetGovernorateForm();
      }
      setSuccess("تم حذف المحافظة بنجاح.");
      await loadData(bookingPageIndex, true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر حذف المحافظة.");
    } finally {
      setBusyKey(null);
    }
  };

  const handleVehicleSave = async () => {
    const parsedCapacity = Number(vehicleForm.capacity);

    if (!vehicleForm.name.trim()) {
      setError("يرجى إدخال اسم السيارة.");
      return;
    }

    if (!Number.isFinite(parsedCapacity) || parsedCapacity <= 0) {
      setError("يرجى إدخال سعة صحيحة للسيارة.");
      return;
    }

    if (!token) return;

    const key = vehicleForm.id ? `vehicle-${vehicleForm.id}` : "vehicle-new";
    setBusyKey(key);
    setError(null);
    setSuccess(null);

    try {
      if (vehicleForm.id) {
        await updateVehicleType(token, vehicleForm.id, {
          name: vehicleForm.name.trim(),
          capacity: parsedCapacity
        });
        setSuccess("تم تحديث نوع السيارة بنجاح.");
      } else {
        await createVehicleType(token, {
          name: vehicleForm.name.trim(),
          capacity: parsedCapacity
        });
        setSuccess("تمت إضافة نوع السيارة بنجاح.");
      }

      clearReferenceDataCache();
      resetVehicleForm();
      await loadData(bookingPageIndex, true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر حفظ نوع السيارة.");
    } finally {
      setBusyKey(null);
    }
  };

  const handleVehicleDelete = async (id: number) => {
    if (!token) return;
    if (!window.confirm("هل تريد حذف هذا النوع؟")) return;

    setBusyKey(`vehicle-${id}`);
    setError(null);
    setSuccess(null);

    try {
      await deleteVehicleType(token, id);
      clearReferenceDataCache();
      if (vehicleForm.id === id) {
        resetVehicleForm();
      }
      setSuccess("تم حذف نوع السيارة بنجاح.");
      await loadData(bookingPageIndex, true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر حذف نوع السيارة.");
    } finally {
      setBusyKey(null);
    }
  };

  const handleTripRouteSave = async (mode: "create" | "update") => {
    const routeId = Number(tripRouteForm.id);
    const fromGovernorateId = Number(tripRouteForm.fromGovernorateId);
    const toGovernorateId = Number(tripRouteForm.toGovernorateId);
    const vehicleTypeId = Number(tripRouteForm.vehicleTypeId);
    const price = Number(tripRouteForm.price);

    if (!Number.isFinite(fromGovernorateId) || !Number.isFinite(toGovernorateId) || !Number.isFinite(vehicleTypeId)) {
      setError("يرجى تحديد المحافظات ونوع السيارة للرحلة.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setError("يرجى إدخال سعر صحيح.");
      return;
    }

    if (!token) return;

    setBusyKey(mode === "create" ? "route-new" : `route-${routeId}`);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        fromGovernorateId,
        toGovernorateId,
        vehicleTypeId,
        price,
        isActive: tripRouteForm.isActive
      };

      if (mode === "update") {
        if (!Number.isFinite(routeId) || routeId <= 0) {
          setError("يرجى إدخال رقم الرحلة لتحديثها أو حذفها.");
          return;
        }

        await updateTripRoute(token, routeId, payload);
        setSuccess("تم تحديث الرحلة بنجاح.");
      } else {
        await createTripRoute(token, payload);
        setSuccess("تمت إضافة الرحلة بنجاح.");
      }

      resetTripRouteForm();
      await loadRoutes(routePageIndex, true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر حفظ الرحلة.");
    } finally {
      setBusyKey(null);
    }
  };

  const handleTripRouteDelete = async (routeId?: number) => {
    const resolvedRouteId = routeId ?? Number(tripRouteForm.id);

    if (!Number.isFinite(resolvedRouteId) || resolvedRouteId <= 0) {
      setError("يرجى إدخال رقم الرحلة أولًا.");
      return;
    }

    if (!token) return;
    if (!window.confirm("هل تريد حذف هذه الرحلة؟")) return;

    setBusyKey(`route-${resolvedRouteId}`);
    setError(null);
    setSuccess(null);

    try {
      await deleteTripRoute(token, resolvedRouteId);
      setSuccess("تم حذف الرحلة بنجاح.");
      resetTripRouteForm();
      await loadRoutes(routePageIndex, true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر حذف الرحلة.");
    } finally {
      setBusyKey(null);
    }
  };

  const handleBookingStatusSave = async (bookingId: number) => {
    if (!token) return;
    const status = statusDrafts[bookingId];
    if (!status) return;

    setBusyKey(`booking-${bookingId}`);
    setError(null);
    setSuccess(null);

    try {
      await updateTripBookingStatus(token, bookingId, status);
      setSuccess("تم تحديث حالة الحجز بنجاح.");
      await loadData(bookingPageIndex, true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحديث الحجز.");
    } finally {
      setBusyKey(null);
    }
  };

  const handleCorporateStatusSave = async (requestId: number, currentStatus: number) => {
    if (!token) return;
    const nextStatus = corporateStatusDrafts[requestId];
    if (!nextStatus || nextStatus === currentStatus) return;
    if (!corporateAllowedTransitions[currentStatus]?.includes(nextStatus)) {
      setError("انتقال حالة طلب نقل الموظفين غير مسموح.");
      return;
    }

    setBusyKey(`corporate-${requestId}`);
    setError(null);
    setSuccess(null);
    try {
      await updateCorporateTransportationStatus(token, requestId, nextStatus);
      setSuccess("تم تحديث حالة طلب نقل الموظفين بنجاح.");
      await loadCorporateRequests(corporateRequestPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحديث حالة طلب نقل الموظفين.");
    } finally {
      setBusyKey(null);
    }
  };

  const handleRouteEdit = (route: TripRoute) => {
    setTripRouteForm({
      id: String(route.id),
      fromGovernorateId: String(route.fromGovernorateId),
      toGovernorateId: String(route.toGovernorateId),
      vehicleTypeId: String(route.vehicleTypeId),
      price: String(route.price),
      isActive: route.isActive
    });
  };

  const topRoutes: TripDashboardTopRoute[] = dashboard?.topRoutes ?? [];
  const topVehicleTypes: TripDashboardTopVehicleType[] = dashboard?.topVehicleTypes ?? [];
  const totalBookingPages = Math.max(1, Math.ceil(bookingTotalCount / bookingPageSize));
  const totalCorporatePages = Math.max(1, Math.ceil(corporateRequestTotal / 10));
  const adminNavItems = [
    { href: "#admin-overview", label: "نظرة عامة", icon: <BarChart3 className="h-4 w-4" /> },
    { href: "#admin-reference", label: "البيانات الأساسية", icon: <RouteIcon className="h-4 w-4" /> },
    { href: "#admin-bookings", label: "الحجوزات", icon: <CalendarCheck2 className="h-4 w-4" /> },
    { href: "#admin-corporate", label: "طلبات الشركات", icon: <FileText className="h-4 w-4" /> }
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,43,43,0.04),_transparent_34%),linear-gradient(180deg,_#f8fafc_0%,_#eef2f7_100%)] pb-16">
      <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[linear-gradient(135deg,rgba(15,23,42,1),rgba(15,23,42,0.94),rgba(255,43,43,0.40))]" />

      <div className="relative mx-auto flex max-w-[90rem] flex-col gap-5 px-3 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm lg:hidden">
          <p className="text-sm font-semibold text-brand-dark">تنقل لوحة الإدارة</p>
          <button type="button" onClick={() => setAdminNavOpen((open) => !open)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-red text-white" aria-label="فتح قائمة لوحة الإدارة">
            {adminNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start">
          <aside className={`${adminNavOpen ? "block" : "hidden"} sticky top-4 z-20 lg:block`}>
            <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-3 shadow-soft backdrop-blur">
              <p className="px-3 pb-3 pt-2 text-xs font-semibold uppercase tracking-wider text-slate-400">أقسام الإدارة</p>
              <nav className="space-y-1">
                {adminNavItems.map((item) => (
                  <a key={item.href} href={item.href} onClick={() => setAdminNavOpen(false)} className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-brand-red/10 hover:text-brand-red">
                    {item.icon}
                    {item.label}
                  </a>
                ))}
              </nav>
              <div className="mt-4 border-t border-slate-200/80 pt-3">
                <Link to="/" className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-brand-dark"><ArrowLeft className="h-4 w-4" /> الرجوع للموقع</Link>
              </div>
            </div>
          </aside>

          <div className="min-w-0 space-y-6">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="overflow-hidden rounded-[2.25rem] border border-white/10 bg-slate-950/35 p-6 text-white shadow-lift backdrop-blur"
        >
          <div className="grid gap-6 lg:grid-cols-[1.25fr,0.75fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/85">
                <ShieldCheck className="h-4 w-4 text-brand-red" />
                Admin dashboard
              </div>
              <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
                لوحة تحكم تشغيلية لإدارة المحافظات، السيارات، الرحلات، والحجوزات.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-white/75">
                هنا تدير البيانات الأساسية للمنصة من مكان واحد: مراقبة الأداء، تشغيل CRUD كامل للمحتوى
                المرجعي، وتحديث الحجوزات مباشرة من دون القفز بين الشاشات.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/35 p-5 text-sm text-white/80">
              <p className="text-white/60">الحساب الحالي</p>
              <p className="mt-1 text-lg font-semibold text-white">{user?.displayName || "Admin"}</p>
              <p className="mt-1 text-white/65">{user?.email || "admin@sqour"}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:shadow-soft"
                >
                  <ArrowLeft className="h-4 w-4" />
                  الرجوع للموقع
                </Link>
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 font-semibold text-white transition hover:bg-white/10"
                >
                  تسجيل الخروج
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 shadow-soft">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-soft">
            {success}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <MetricCard
              key={card.label}
              icon={card.icon}
              label={card.label}
              value={card.value}
              hint={card.hint}
            />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
          <SectionCard
            id="admin-overview"
            title="مؤشرات التشغيل"
            description="نظرة سريعة على التوزيع الحالي للحجوزات والعائدات وأهم المسارات النشطة."
            icon={<BarChart3 className="h-5 w-5" />}
            action={
              <button
                onClick={() => loadData(bookingPageIndex, true)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-red/30 hover:text-brand-red"
              >
                {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                تحديث
              </button>
            }
          >
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200/70">
                <h4 className="text-sm font-semibold text-brand-dark">Top routes</h4>
                <div className="mt-4 space-y-3">
                  {topRoutes.length ? (
                    topRoutes.map((route) => (
                      <div
                        key={route.tripRouteId}
                        className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm"
                      >
                        <div>
                          <p className="font-medium text-slate-900">
                            {route.fromGovernorateName} → {route.toGovernorateName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {route.vehicleTypeName} · ID #{route.tripRouteId}
                          </p>
                        </div>
                        <div className="text-left text-xs text-slate-500">
                          <p>{route.bookingCount} bookings</p>
                          <p className="font-semibold text-brand-red">{currency(route.revenue)} ج.م</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-500">
                      لا توجد بيانات كافية بعد.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200/70">
                <h4 className="text-sm font-semibold text-brand-dark">Top vehicle types</h4>
                <div className="mt-4 space-y-3">
                  {topVehicleTypes.length ? (
                    topVehicleTypes.map((vehicle) => (
                      <div
                        key={vehicle.vehicleTypeId}
                        className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm"
                      >
                        <div>
                          <p className="font-medium text-slate-900">{vehicle.vehicleTypeName}</p>
                          <p className="text-xs text-slate-500">ID #{vehicle.vehicleTypeId}</p>
                        </div>
                        <div className="text-left text-xs text-slate-500">
                          <p>{vehicle.bookingCount} bookings</p>
                          <p className="font-semibold text-brand-red">{currency(vehicle.revenue)} ج.م</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-500">
                      لا توجد بيانات كافية بعد.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="ملخص سريع"
            description="اللحظة الأخيرة للتشغيل قبل تنفيذ أي تغيير."
            icon={<Users className="h-5 w-5" />}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/70">
                <p className="text-xs text-slate-500">الحجوزات المؤكدة</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {currency(dashboard?.confirmedBookings ?? 0)}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/70">
                <p className="text-xs text-slate-500">الحجوزات المعلقة</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {currency(dashboard?.pendingBookings ?? 0)}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/70">
                <p className="text-xs text-slate-500">إيراد المؤكد</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {currency(dashboard?.confirmedRevenue ?? 0)} ج.م
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/70">
                <p className="text-xs text-slate-500">آخر تحديث</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {formatDateTime(dashboard?.generatedAt ?? "")}
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            id="admin-reference"
            title="إدارة المحافظات"
            description="إضافة، تعديل، وحذف المحافظات المستخدمة في المسارات."
            icon={<MapPin className="h-5 w-5" />}
            action={
              <button
                onClick={handleGovernorateSave}
                disabled={busyKey === "gov-new" || busyKey === `gov-${governorateForm.id ?? 0}`}
                className="inline-flex items-center gap-2 rounded-full bg-brand-red px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {busyKey === "gov-new" || busyKey === `gov-${governorateForm.id ?? 0}` ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                حفظ
              </button>
            }
          >
            <div className="grid gap-4 lg:grid-cols-[0.85fr,1.15fr]">
              <div className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200/70">
                <p className="text-sm font-semibold text-brand-dark">نموذج المحافظة</p>
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-xs text-slate-500">الاسم</label>
                    <input
                      value={governorateForm.name}
                      onChange={(event) =>
                        setGovernorateForm((previous) => ({ ...previous, name: event.target.value }))
                      }
                      className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-red/40 focus:ring-2 focus:ring-brand-red/15"
                      placeholder="مثال: القاهرة"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleGovernorateSave}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-brand-red px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
                    >
                      {governorateForm.id ? <PencilLine className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      {governorateForm.id ? "تحديث" : "إضافة"}
                    </button>
                    <button
                      onClick={resetGovernorateForm}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                    >
                      إلغاء
                    </button>
                  </div>
                  {governorateForm.id ? (
                    <p className="text-xs text-slate-500">سيتم حفظ التعديل للمحافظة رقم #{governorateForm.id}</p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-3">
                {governorates.length ? (
                  <CompactAccordion
                    title="قائمة المحافظات"
                    count={filteredGovernorates.length}
                    searchValue={governorateSearch}
                    onSearchChange={setGovernorateSearch}
                    searchPlaceholder="ابحث باسم المحافظة"
                    maxHeightClass="max-h-[22rem]"
                  >
                    {filteredGovernorates.map((governorate) => (
                      <AdminListItem
                        key={governorate.id}
                        title={governorate.name}
                        subtitle={`ID #${governorate.id}`}
                        actions={
                          <div className="flex gap-2">
                            <button
                              onClick={() => setGovernorateForm({ id: governorate.id, name: governorate.name })}
                              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-red/30 hover:text-brand-red"
                            >
                              تعديل
                            </button>
                            <button
                              onClick={() => handleGovernorateDelete(governorate.id)}
                              className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
                            >
                              {busyKey === `gov-${governorate.id}` ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                              حذف
                            </button>
                          </div>
                        }
                      />
                    ))}
                    {!filteredGovernorates.length ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                        لا توجد نتائج مطابقة.
                      </div>
                    ) : null}
                  </CompactAccordion>
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                    لا توجد محافظات مضافة حتى الآن.
                  </div>
                )}
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="إدارة أنواع السيارات"
            description="نفس النمط التشغيلي لإضافة وتعديل عدد المقاعد والاسم المعروض."
            icon={<Truck className="h-5 w-5" />}
          >
            <div className="grid gap-4 lg:grid-cols-[0.85fr,1.15fr]">
              <div className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200/70">
                <p className="text-sm font-semibold text-brand-dark">نموذج السيارة</p>
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-xs text-slate-500">الاسم</label>
                    <input
                      value={vehicleForm.name}
                      onChange={(event) =>
                        setVehicleForm((previous) => ({ ...previous, name: event.target.value }))
                      }
                      className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-red/40 focus:ring-2 focus:ring-brand-red/15"
                      placeholder="مثال: Hyundai H1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">السعة</label>
                    <input
                      type="number"
                      min={1}
                      value={vehicleForm.capacity}
                      onChange={(event) =>
                        setVehicleForm((previous) => ({ ...previous, capacity: event.target.value }))
                      }
                      className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-red/40 focus:ring-2 focus:ring-brand-red/15"
                      placeholder="7"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleVehicleSave}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-brand-red px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
                    >
                      {vehicleForm.id ? <PencilLine className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      {vehicleForm.id ? "تحديث" : "إضافة"}
                    </button>
                    <button
                      onClick={resetVehicleForm}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                    >
                      إلغاء
                    </button>
                  </div>
                  {vehicleForm.id ? (
                    <p className="text-xs text-slate-500">سيتم حفظ التعديل لنوع السيارة رقم #{vehicleForm.id}</p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-3">
                {vehicleTypes.length ? (
                  <CompactAccordion
                    title="قائمة أنواع السيارات"
                    count={filteredVehicleTypes.length}
                    searchValue={vehicleTypeSearch}
                    onSearchChange={setVehicleTypeSearch}
                    searchPlaceholder="ابحث باسم السيارة أو السعة"
                    maxHeightClass="max-h-[22rem]"
                  >
                    {filteredVehicleTypes.map((vehicleType) => (
                      <AdminListItem
                        key={vehicleType.id}
                        title={`${vehicleType.name} · ${vehicleType.capacity} مقعد`}
                        subtitle={`ID #${vehicleType.id}`}
                        actions={
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                setVehicleForm({
                                  id: vehicleType.id,
                                  name: vehicleType.name,
                                  capacity: String(vehicleType.capacity)
                                })
                              }
                              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-red/30 hover:text-brand-red"
                            >
                              تعديل
                            </button>
                            <button
                              onClick={() => handleVehicleDelete(vehicleType.id)}
                              className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
                            >
                              {busyKey === `vehicle-${vehicleType.id}` ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                              حذف
                            </button>
                          </div>
                        }
                      />
                    ))}
                    {!filteredVehicleTypes.length ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                        لا توجد نتائج مطابقة.
                      </div>
                    ) : null}
                  </CompactAccordion>
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                    لا توجد أنواع سيارات مضافة حتى الآن.
                  </div>
                )}
              </div>
            </div>
          </SectionCard>
        </div>

        <SectionCard
          title="إدارة الرحلات"
          description="إنشاء رحلة جديدة أو تعديل رحلة موجودة من كتالوج مباشر قابل للبحث والتصفح."
          icon={<RouteIcon className="h-5 w-5" />}
          action={
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleTripRouteSave("create")}
                className="inline-flex items-center gap-2 rounded-full bg-brand-red px-4 py-2 text-sm font-semibold text-white shadow-soft"
              >
                <Plus className="h-4 w-4" />
                إضافة رحلة
              </button>
              <button
                onClick={() => handleTripRouteSave("update")}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              >
                <PencilLine className="h-4 w-4" />
                تحديث الرحلة
              </button>
              <button
                onClick={() => handleTripRouteDelete()}
                className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                حذف الرحلة
              </button>
            </div>
          }
        >
          <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
            <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200/70">
              <p className="text-sm font-semibold text-brand-dark">نموذج الرحلة</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-xs text-slate-500">رقم الرحلة للتعديل/الحذف</label>
                  <input
                    value={tripRouteForm.id}
                    onChange={(event) => setTripRouteForm((previous) => ({ ...previous, id: event.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-red/40 focus:ring-2 focus:ring-brand-red/15"
                    placeholder="مثال: 12"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">من محافظة</label>
                  <select
                    value={tripRouteForm.fromGovernorateId}
                    onChange={(event) =>
                      setTripRouteForm((previous) => ({ ...previous, fromGovernorateId: event.target.value }))
                    }
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                  >
                    <option value="">اختر</option>
                    {governorates.map((governorate) => (
                      <option key={governorate.id} value={governorate.id}>
                        {governorate.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500">إلى محافظة</label>
                  <select
                    value={tripRouteForm.toGovernorateId}
                    onChange={(event) =>
                      setTripRouteForm((previous) => ({ ...previous, toGovernorateId: event.target.value }))
                    }
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                  >
                    <option value="">اختر</option>
                    {governorates.map((governorate) => (
                      <option key={governorate.id} value={governorate.id}>
                        {governorate.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500">نوع السيارة</label>
                  <select
                    value={tripRouteForm.vehicleTypeId}
                    onChange={(event) =>
                      setTripRouteForm((previous) => ({ ...previous, vehicleTypeId: event.target.value }))
                    }
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                  >
                    <option value="">اختر</option>
                    {vehicleTypes.map((vehicleType) => (
                      <option key={vehicleType.id} value={vehicleType.id}>
                        {vehicleType.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500">السعر</label>
                  <input
                    type="number"
                    min={0}
                    value={tripRouteForm.price}
                    onChange={(event) =>
                      setTripRouteForm((previous) => ({ ...previous, price: event.target.value }))
                    }
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-red/40 focus:ring-2 focus:ring-brand-red/15"
                    placeholder="350"
                  />
                </div>
                <label className="sm:col-span-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={tripRouteForm.isActive}
                    onChange={(event) =>
                      setTripRouteForm((previous) => ({ ...previous, isActive: event.target.checked }))
                    }
                    className="h-4 w-4 rounded border-slate-300 text-brand-red focus:ring-brand-red"
                  />
                  رحلة نشطة وقابلة للحجز
                </label>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={() => handleTripRouteSave("create")}
                  className="inline-flex items-center gap-2 rounded-2xl bg-brand-red px-4 py-3 text-sm font-semibold text-white shadow-soft"
                >
                  <Plus className="h-4 w-4" />
                  حفظ جديد
                </button>
                <button
                  onClick={() => handleTripRouteSave("update")}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                >
                  <Save className="h-4 w-4" />
                  حفظ التعديل
                </button>
                <button
                  onClick={() => handleTripRouteDelete()}
                  className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                  حذف
                </button>
                <button
                  onClick={resetTripRouteForm}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                >
                  مسح النموذج
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <CompactAccordion
                title="الرحلات الحالية"
                count={filteredTripRoutes.length}
                defaultOpen={true}
                searchValue={tripRouteSearch}
                onSearchChange={setTripRouteSearch}
                searchPlaceholder="ابحث بين المحافظات أو السيارة أو السعر"
                maxHeightClass="max-h-[31rem]"
              >
                <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                  <span>
                    الصفحة {routePageIndex} من {totalRoutePages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadRoutes(routePageIndex, true)}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700"
                    >
                      تحديث
                    </button>
                    <button
                      onClick={() => setRoutePageIndex((previous) => Math.max(1, previous - 1))}
                      disabled={routePageIndex <= 1 || routesLoading}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      السابق
                    </button>
                    <button
                      onClick={() => setRoutePageIndex((previous) => Math.min(totalRoutePages, previous + 1))}
                      disabled={routePageIndex >= totalRoutePages || routesLoading}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      التالي
                    </button>
                  </div>
                </div>
                {routesLoading ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                    جاري تحميل الرحلات...
                  </div>
                ) : filteredTripRoutes.length ? (
                  filteredTripRoutes.map((route) => (
                    <AdminListItem
                      key={route.id}
                      title={`${route.fromGovernorateName} → ${route.toGovernorateName}`}
                      subtitle={`${route.vehicleTypeName} · ${currency(route.price)} ج.م · #${route.id}`}
                      actions={
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRouteEdit(route)}
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-red/30 hover:text-brand-red"
                          >
                            تعديل
                          </button>
                          <button
                            onClick={() => handleTripRouteDelete(route.id)}
                            className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
                          >
                            {busyKey === `route-${route.id}` ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            حذف
                          </button>
                        </div>
                      }
                    />
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                    لا توجد نتائج مطابقة.
                  </div>
                )}
              </CompactAccordion>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          id="admin-bookings"
          title="حجوزات الإدارة"
          description="استعراض الحجوزات وتغيير الحالة مباشرة من لوحة الإدارة."
          icon={<CalendarCheck2 className="h-5 w-5" />}
        >
          <div className="mb-4 flex items-center justify-between text-sm text-slate-500">
            <p>
              الصفحة {bookingPageIndex} من {totalBookingPages} · {bookingTotalCount} حجز
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => loadData(Math.max(1, bookingPageIndex - 1), true)}
                disabled={bookingPageIndex <= 1}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                السابق
              </button>
              <button
                onClick={() => loadData(Math.min(totalBookingPages, bookingPageIndex + 1), true)}
                disabled={bookingPageIndex >= totalBookingPages}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                التالي
              </button>
            </div>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
              جاري تحميل بيانات الإدارة...
            </div>
          ) : bookings.length ? (
            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3 overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-3 text-right text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-4 py-2">الحجز</th>
                    <th className="px-4 py-2">المسار</th>
                    <th className="px-4 py-2">العميل</th>
                    <th className="px-4 py-2">التاريخ</th>
                    <th className="px-4 py-2">السعر</th>
                    <th className="px-4 py-2">الحالة</th>
                    <th className="px-4 py-2">الإجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => {
                    const meta = statusMeta[booking.status] || statusMeta[1];

                    return (
                      <tr key={booking.id} className="rounded-3xl bg-white shadow-soft">
                        <td className="rounded-r-3xl px-4 py-4 font-semibold text-slate-900">#{booking.id}</td>
                        <td className="px-4 py-4 text-slate-600">
                          <p className="font-medium text-slate-900">
                            {booking.fromGovernorateName} → {booking.toGovernorateName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {booking.vehicleTypeName} · Route #{booking.tripRouteId}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          <p className="font-medium text-slate-900">{booking.contactName}</p>
                          <p className="text-xs text-slate-500">{booking.userEmail || booking.contactPhone}</p>
                        </td>
                        <td className="px-4 py-4 text-slate-600">{formatDateTime(booking.travelDate)}</td>
                        <td className="px-4 py-4 font-semibold text-slate-900">{currency(booking.price)} ج.م</td>
                        <td className="px-4 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.className}`}>
                            {meta.label}
                          </span>
                        </td>
                        <td className="rounded-l-3xl px-4 py-4">
                          <div className="flex items-center gap-2">
                            <select
                              value={statusDrafts[booking.id] ?? booking.status}
                              onChange={(event) =>
                                setStatusDrafts((previous) => ({
                                  ...previous,
                                  [booking.id]: Number(event.target.value)
                                }))
                              }
                              className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none"
                            >
                              {bookingStatusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleBookingStatusSave(booking.id)}
                              disabled={busyKey === `booking-${booking.id}`}
                              className="inline-flex items-center gap-2 rounded-2xl bg-brand-red px-4 py-2 text-sm font-semibold text-white shadow-soft disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              {busyKey === `booking-${booking.id}` ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4" />
                              )}
                              حفظ
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </motion.div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
              لا توجد حجوزات في هذه الصفحة.
            </div>
          )}
        </SectionCard>

        <SectionCard
          id="admin-corporate"
          title="طلبات نقل الموظفين"
          description="طلبات الشركات المرسلة من الصفحة العامة وإدارة حالتها وفق دورة الاعتماد."
          icon={<Truck className="h-5 w-5" />}
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
            <p>الصفحة {corporateRequestPage} من {totalCorporatePages} · {corporateRequestTotal} طلب</p>
            <div className="flex gap-2">
              <button onClick={() => loadCorporateRequests(Math.max(1, corporateRequestPage - 1))} disabled={corporateRequestPage <= 1} className="rounded-full border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">السابق</button>
              <button onClick={() => loadCorporateRequests(Math.min(totalCorporatePages, corporateRequestPage + 1))} disabled={corporateRequestPage >= totalCorporatePages} className="rounded-full border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">التالي</button>
            </div>
          </div>
          {corporateLoading ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">جاري تحميل طلبات نقل الموظفين...</div>
          ) : corporateRequests.length ? (
            <div className="space-y-3">
              {corporateRequests.map((request) => {
                const requestId = request.id ?? 0;
                const meta = corporateStatusMeta[request.status] ?? corporateStatusMeta[1];
                return (
                  <div key={requestId} className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-brand-dark">{request.companyName}</p>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.className}`}>{meta.label}</span>
                      </div>
                      <p className="mt-1 break-all text-xs text-slate-500">{request.trackingCode} · {request.contactPersonName || "بدون مسؤول"} · {request.businessEmail || "بدون بريد"}</p>
                      <p className="mt-2 text-sm text-slate-600">{request.routes?.length ?? 0} مسار · {request.employeesRequiringTransportation ?? 0} موظف يحتاجون للنقل</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <select value={corporateStatusDrafts[requestId] ?? request.status} onChange={(event) => setCorporateStatusDrafts((previous) => ({ ...previous, [requestId]: Number(event.target.value) }))} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none">
                        {getCorporateStatusOptions(request.status).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                      <Link to={`/admin/corporate-transportation-requests/${requestId}`} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-red/30 hover:text-brand-red">التفاصيل</Link>
                      <button onClick={() => handleCorporateStatusSave(requestId, request.status)} disabled={busyKey === `corporate-${requestId}`} className="inline-flex items-center gap-2 rounded-2xl bg-brand-red px-4 py-2 text-sm font-semibold text-white shadow-soft disabled:cursor-not-allowed disabled:opacity-70">
                        {busyKey === `corporate-${requestId}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} حفظ
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">لا توجد طلبات نقل موظفين.</div>
          )}
        </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}