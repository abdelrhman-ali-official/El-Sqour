import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Clock3,
  Copy,
  Download,
  MapPinned,
  Navigation,
  Printer,
  Route,
  Ticket,
  User2,
  CarFront,
  ShieldCheck,
  Map,
  FileText
} from "lucide-react";
import SectionHeading from "../components/SectionHeading";
import { getVehicleImage } from "../data/vehicleTypeImages";
import { useAuth } from "../context/AuthContext";
import { fetchMyTripBookings, type TripBooking } from "../utils/api";

type TicketRoute = {
  fromGovernorateName?: string;
  toGovernorateName?: string;
  vehicleTypeName?: string;
  price?: number;
  vehicleTypeId?: number;
};

type PrintableBooking = TripBooking & {
  seatNumber?: string;
  driverName?: string;
  arrivalTime?: string;
  estimatedDurationMinutes?: number;
  bookingReference?: string;
};

const statusMap: Record<number, { label: string; className: string }> = {
  1: { label: "Pending", className: "bg-amber-50 text-amber-700 ring-amber-200" },
  2: { label: "Confirmed", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  3: { label: "Cancelled", className: "bg-rose-50 text-rose-700 ring-rose-200" }
};

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function formatTime(value?: string) {
  if (!value) return "--:--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function buildBarcodePattern(seed: string) {
  const chars = (seed || "SQOUR").replace(/\s+/g, "").split("");
  const bars: number[] = [];
  for (let index = 0; index < 42; index += 1) {
    const charCode = chars[index % chars.length]?.charCodeAt(0) ?? 65;
    const width = 1 + ((charCode + index * 7) % 4);
    bars.push(width);
  }
  return bars;
}

function Barcode({ value }: { value: string }) {
  const bars = useMemo(() => buildBarcodePattern(value), [value]);
  return (
    <div className="flex h-14 items-end gap-0.5 overflow-hidden rounded-xl bg-white px-2 py-1 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.06)]">
      {bars.map((width, index) => (
        <span
          key={`${value}-${index}`}
          className="bg-slate-950"
          style={{ width: `${width}px`, height: `${18 + (index % 6) * 4}px` }}
        />
      ))}
    </div>
  );
}

export default function BookingSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const printableRef = useRef<HTMLDivElement | null>(null);
  const [booking, setBooking] = useState<PrintableBooking | null>(state?.booking ?? null);
  const [route, setRoute] = useState<TicketRoute | null>(state?.route ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    if (booking || !user) return;

    const fetchMine = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMyTripBookings(user.token, 1, 10);
        const first = data?.data?.[0];
        if (!first) {
          setError("لا توجد حجوزات حالياً.");
          return;
        }
        setBooking(first as PrintableBooking);
        setRoute({
          fromGovernorateName: first.fromGovernorateName,
          toGovernorateName: first.toGovernorateName,
          vehicleTypeName: first.vehicleTypeName,
          price: first.price,
          vehicleTypeId: (first as TripBooking & { vehicleTypeId?: number }).vehicleTypeId
        });
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "خطأ في الاتصال.");
      } finally {
        setLoading(false);
      }
    };

    fetchMine();
  }, [booking, user]);

  const ticketTitle = useMemo(() => {
    if (!booking) return "Boarding Pass";
    return `${booking.fromGovernorateName} → ${booking.toGovernorateName}`;
  }, [booking]);

  const reference = useMemo(() => {
    if (!booking) return "SQ-0000";
    return booking.bookingReference || `SQ-${String(booking.id).padStart(5, "0")}`;
  }, [booking]);

  const departureDate = booking?.travelDate ?? booking?.createdAt;
  const departureTime = formatTime(booking?.travelDate);
  const arrivalTime = booking?.arrivalTime ?? "--:--";
  const estimatedDuration = booking?.estimatedDurationMinutes ? `${booking.estimatedDurationMinutes} min` : "Estimated";
  const status = statusMap[booking?.status ?? 2] ?? statusMap[2];
  const qrValue = booking
    ? JSON.stringify({
        bookingId: booking.id,
        routeId: booking.tripRouteId,
        from: booking.fromGovernorateName,
        to: booking.toGovernorateName,
        passenger: booking.contactName,
        ref: reference
      })
    : "SQOUR-TICKET";

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = async () => {
    if (!booking) return;
    const text = [
      `Booking: ${reference}`,
      `Route: ${booking.fromGovernorateName} -> ${booking.toGovernorateName}`,
      `Passenger: ${booking.contactName}`,
      `Phone: ${booking.contactPhone}`
    ].join("\n");
    await navigator.clipboard.writeText(text);
  };

  const handleDownloadPdf = async () => {
    if (!printableRef.current) return;
    setPdfLoading(true);
    try {
      // Wait for fonts to be ready if supported
      await document.fonts?.ready;

      // Helper: wait for images inside an element to load (or error)
      const waitForImages = (root: HTMLElement) =>
        new Promise<void>((resolve) => {
          const imgs = Array.from(root.querySelectorAll("img")) as HTMLImageElement[];
          if (!imgs.length) return resolve();
          let remaining = imgs.length;
          const check = () => {
            remaining -= 1;
            if (remaining <= 0) resolve();
          };
          imgs.forEach((img) => {
            if (img.complete && img.naturalWidth !== 0) {
              check();
            } else {
              img.addEventListener("load", check, { once: true });
              img.addEventListener("error", check, { once: true });
            }
          });
        });

      // Clone the printable node and make it visible in the viewport for html2canvas
      const original = printableRef.current;
      const clone = original.cloneNode(true) as HTMLElement;
      Object.assign(clone.style, {
        position: "fixed",
        left: "-10000px",
        top: "-10000px",
        transform: "none",
        visibility: "visible",
        zIndex: "9999",
        maxWidth: "1120px",
        width: original.offsetWidth ? `${original.offsetWidth}px` : "1120px",
        fontFamily: 'Tahoma, Arial, sans-serif',
        boxShadow: "none",
      } as Partial<CSSStyleDeclaration>);

      clone.setAttribute("dir", "ltr");
      clone.querySelectorAll<HTMLElement>("[data-pdf-ar]").forEach((element) => {
        element.setAttribute("dir", "rtl");
        element.setAttribute("lang", "ar");
        element.style.direction = "rtl";
        element.style.unicodeBidi = "plaintext";
        element.style.textAlign = "right";
        element.style.letterSpacing = "0";
        element.style.fontFamily = 'Tahoma, Arial, sans-serif';
      });

      document.body.appendChild(clone);
      try {
        await waitForImages(clone);
        // Short delay to let layout settle
        await new Promise((r) => setTimeout(r, 80));

        const canvas = await html2canvas(clone, {
          scale: 2,
          backgroundColor: "#f4f5f7",
          useCORS: true,
          allowTaint: true,
        });
        const imgData = canvas.toDataURL("image/png", 1.0);
        const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 8;
        const width = pageWidth - margin * 2;
        const height = (canvas.height * width) / canvas.width;
        const y = Math.max(margin, (pageHeight - height) / 2);
        pdf.addImage(imgData, "PNG", margin, y, width, height, undefined, "FAST");
        pdf.save(`sqour-ticket-${reference}.pdf`);
      } finally {
        // remove clone from DOM
        try {
          document.body.removeChild(clone);
        } catch (e) {
          // ignore
        }
      }
    } finally {
      setPdfLoading(false);
    }
  };

  if (!booking) {
    return (
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="حجز" title="تفاصيل الحجز" description="لا توجد بيانات حجز للعرض حالياً." />
          <div className="mt-6 rounded-3xl bg-white/80 p-6 text-center shadow-soft">
            {loading ? (
              <p className="text-sm text-slate-600">جاري جلب الحجوزات...</p>
            ) : error ? (
              <>
                <p className="text-sm text-red-600">{error}</p>
                <div className="mt-4 flex justify-center">
                  <button onClick={() => navigate(-1)} className="rounded-2xl bg-brand-red px-4 py-2 text-white">
                    العودة
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-600">لا توجد حجوزات لعرضها.</p>
                <div className="mt-4 flex justify-center">
                  <button onClick={() => navigate("/")} className="rounded-2xl bg-brand-red px-4 py-2 text-white">
                    العودة للرئيسية
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-x-hidden py-8 sm:py-12 print:py-0">
      <style>{`
        @media print {
          html, body {
            background: #ffffff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          body * {
            visibility: hidden;
          }

          #printable-ticket, #printable-ticket * {
            visibility: visible;
          }

          #printable-ticket {
            position: fixed;
            inset: 0;
            margin: 0;
            width: 100% !important;
            box-shadow: none !important;
          }

          .print-hide {
            display: none !important;
          }
        }
      `}</style>

      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(255,43,43,0.10),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.05),transparent_25%)]" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="print-hide">
          <SectionHeading
            eyebrow="تم الحجز"
            title="تم إنشاء الحجز بنجاح"
            description="يمكنك الآن طباعة التذكرة أو تنزيلها PDF من التذكرة الاحترافية المخصصة للطباعة فقط."
          />

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="rounded-3xl bg-white/85 p-6 shadow-soft sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-200">
                    <img src="/logo.png" alt="الصقور" className="h-12 w-12 object-cover" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-red">Al Saqour</p>
                    <h1 className="mt-1 text-2xl font-black text-slate-950">رحلتك جاهزة</h1>
                    <p className="mt-2 text-sm text-slate-600">حجزك تم بنجاح ويمكنك فتح التذكرة للطباعة أو PDF وقت ما تحتاج.</p>
                  </div>
                </div>

                <div className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 ${status.className}`}>
                  <BadgeCheck className="h-4 w-4" />
                  {status.label}
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                  <p className="text-xs text-slate-400">Booking ID</p>
                  <p className="mt-2 text-lg font-bold text-slate-950">{reference}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                  <p className="text-xs text-slate-400">Route</p>
                  <p className="mt-2 text-lg font-bold text-slate-950">{booking.fromGovernorateName} → {booking.toGovernorateName}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                  <p className="text-xs text-slate-400">Passenger</p>
                  <p className="mt-2 text-lg font-bold text-slate-950">{booking.contactName}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5"
                >
                  <Copy className="h-4 w-4" />
                  نسخ التفاصيل
                </button>
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5"
                >
                  <Printer className="h-4 w-4" />
                  طباعة التذكرة
                </button>
                <button
                  onClick={handleDownloadPdf}
                  disabled={pdfLoading}
                  className="inline-flex items-center gap-2 rounded-2xl bg-brand-red px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {pdfLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" /> : <Download className="h-4 w-4" />}
                  تحميل PDF
                </button>
              </div>
            </div>

            <div className="rounded-3xl bg-white/85 p-6 shadow-soft sm:p-8">
              <div className="flex items-center gap-3 text-slate-900">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-red/10 text-brand-red">
                  <Route className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Trip Summary</p>
                  <p className="text-xl font-black">{booking.vehicleTypeName}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 text-sm text-slate-600">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span>Departure</span>
                  <span className="font-semibold text-slate-950">{departureTime}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span>Pickup</span>
                  <span className="font-semibold text-slate-950">{booking.pickupPoint}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span>Dropoff</span>
                  <span className="font-semibold text-slate-950">{booking.dropoffPoint}</span>
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,249,251,0.95))] p-4 text-xs leading-6 text-slate-500">
                طباعة التذكرة الفعلية من الزر أدناه. التصميم المعروض هنا مخصص للشاشة فقط، بينما بطاقة الطباعة تبقى بتصميم boarding pass الاحترافي.
              </div>
            </div>
          </div>
        </div>

        <div
          id="printable-ticket"
          ref={printableRef}
          className="fixed left-0 top-0 w-[1120px] max-w-[1120px] -translate-x-[250vw] overflow-hidden rounded-[32px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,249,251,0.96))] shadow-[0_20px_80px_rgba(15,23,42,0.12)] ring-1 ring-black/5 print:static print:w-full print:max-w-none print:translate-x-0 print:shadow-none print:ring-0"
        >
          <div className="border-b border-dashed border-slate-200 bg-[linear-gradient(90deg,rgba(255,43,43,0.06),rgba(255,255,255,0.95))] px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-200">
                  <img src="/logo.png" alt="الصقور" className="h-12 w-12 object-cover" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-red">Al Saqour</p>
                  <h1 data-pdf-ar className="mt-1 text-2xl font-black tracking-tight text-slate-950">الصقور</h1>
                  <p className="mt-1 text-sm text-slate-500">Premium Travel Boarding Pass</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 ${status.className}`}>
                  <BadgeCheck className="h-4 w-4" />
                  {status.label}
                </div>
                <div className="rounded-2xl bg-white px-4 py-3 shadow-soft ring-1 ring-slate-200">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Booking ID</p>
                  <p className="mt-1 text-lg font-black text-slate-950">{reference}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[1fr,340px]">
            <div className="px-5 py-5 sm:px-6 sm:py-6">
              <div className="grid gap-5 xl:grid-cols-[1.3fr,0.95fr]">
                <div className="rounded-[28px] border border-slate-100 bg-white/90 p-5 shadow-soft">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Route</p>
                      <h2 data-pdf-ar className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                        {booking.fromGovernorateName}
                      </h2>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-red text-white shadow-[0_18px_40px_rgba(255,43,43,0.35)]">
                      <Route className="h-7 w-7" />
                    </div>
                  </div>

                  <div className="my-5 flex items-center gap-3">
                    <span className="h-px flex-1 bg-slate-200" />
                    <span className="rounded-full border border-dashed border-slate-300 bg-slate-50 px-3 py-1 text-xs font-semibold tracking-[0.22em] text-slate-500">
                      BOARDING PASS
                    </span>
                    <span className="h-px flex-1 bg-slate-200" />
                  </div>

                  <div className="flex flex-col gap-2 text-center sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">From</p>
                      <p className="mt-2 text-2xl font-black text-slate-950">{booking.fromGovernorateName}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-white shadow-lg">
                      <Navigation className="h-5 w-5 rotate-45" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">To</p>
                      <p className="mt-2 text-2xl font-black text-slate-950">{booking.toGovernorateName}</p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                        <CalendarDays className="h-4 w-4 text-brand-red" />
                        Departure Date
                      </p>
                      <p className="mt-2 text-base font-bold text-slate-950">{formatDate(departureDate)}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                        <Clock3 className="h-4 w-4 text-brand-red" />
                        Departure Time
                      </p>
                      <p className="mt-2 text-base font-bold text-slate-950">{departureTime}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                        <Clock3 className="h-4 w-4 text-brand-red" />
                        Arrival Time
                      </p>
                      <p className="mt-2 text-base font-bold text-slate-950">{arrivalTime}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                        <User2 className="h-4 w-4 text-brand-red" />
                        Passenger Name
                      </p>
                      <p className="mt-2 text-base font-bold text-slate-950">{booking.contactName}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                        <Ticket className="h-4 w-4 text-brand-red" />
                        Seat Number
                      </p>
                      <p className="mt-2 text-base font-bold text-slate-950">{booking.seatNumber ?? "Assigned at check-in"}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                        <CarFront className="h-4 w-4 text-brand-red" />
                        Vehicle Type
                      </p>
                      <p className="mt-2 text-base font-bold text-slate-950">{booking.vehicleTypeName}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                        <ShieldCheck className="h-4 w-4 text-brand-red" />
                        Driver Name
                      </p>
                      <p className="mt-2 text-base font-bold text-slate-950">{booking.driverName ?? "Will be shared before departure"}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                        <MapPinned className="h-4 w-4 text-brand-red" />
                        Pickup Location
                      </p>
                      <p className="mt-2 text-base font-bold text-slate-950">{booking.pickupPoint}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                        <MapPinned className="h-4 w-4 text-brand-red" />
                        Dropoff Location
                      </p>
                      <p className="mt-2 text-base font-bold text-slate-950">{booking.dropoffPoint}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100 xl:col-span-3">
                      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                        <Map className="h-4 w-4 text-brand-red" />
                        Estimated Duration
                      </p>
                      <p className="mt-2 text-base font-bold text-slate-950">{estimatedDuration}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-5">
                  <div className="overflow-hidden rounded-[28px] border border-slate-100 bg-white/90 shadow-soft">
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={getVehicleImage(route?.vehicleTypeId)}
                        alt={booking.vehicleTypeName}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                        <p className="text-xs uppercase tracking-[0.3em] text-white/80">Trip Vehicle</p>
                        <p className="mt-2 text-2xl font-black">{booking.vehicleTypeName}</p>
                        <p className="mt-1 text-sm text-white/85">Luxury transport, clean interior, premium experience</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-slate-100 bg-white/90 p-5 shadow-soft">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Trip Summary</p>
                        <p className="mt-2 text-xl font-black text-slate-950">{booking.price.toLocaleString("ar-EG")} ج.م</p>
                      </div>
                      <div className="rounded-2xl bg-brand-red/5 px-3 py-2 text-right ring-1 ring-brand-red/10">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Status</p>
                        <p className="mt-1 text-sm font-bold text-brand-red">Confirmed</p>
                      </div>
                    </div>

                    <div className="mt-5 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-100">
                      <div className="flex items-center justify-between text-sm text-slate-600">
                        <span>Estimated Duration</span>
                        <span className="font-semibold text-slate-950">{estimatedDuration}</span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-brand-red to-slate-950" />
                      </div>
                    </div>

                    <div className="mt-5 rounded-3xl border border-dashed border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,249,251,0.96))] p-4">
                      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                        <Map className="h-4 w-4 text-brand-red" />
                        Mini map preview
                      </p>
                      <div className="mt-4 rounded-2xl bg-[radial-gradient(circle_at_20%_20%,rgba(255,43,43,0.10),transparent_30%),linear-gradient(135deg,#f8fafc,#eef2f7)] p-4 ring-1 ring-slate-100">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{booking.fromGovernorateName}</span>
                          <span>{booking.toGovernorateName}</span>
                        </div>
                        <div className="mt-4 flex items-center gap-3">
                          <div className="h-3 w-3 rounded-full bg-brand-red shadow-[0_0_0_6px_rgba(255,43,43,0.12)]" />
                          <div className="h-0.5 flex-1 bg-gradient-to-r from-brand-red via-slate-400 to-slate-950" />
                          <div className="h-3 w-3 rounded-full bg-slate-950 shadow-[0_0_0_6px_rgba(15,23,42,0.10)]" />
                        </div>
                        <p className="mt-4 text-xs leading-6 text-slate-600">
                          Compact route preview for a clean, premium travel feel. The final ticket remains print-safe and centered on A4.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <aside className="border-t border-dashed border-slate-200 bg-[linear-gradient(180deg,#fbfbfc,#f4f6f8)] px-5 py-5 lg:border-l lg:border-t-0 lg:px-4 lg:py-6">
              <div className="flex h-full flex-col gap-5">
                <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-soft">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Passenger</p>
                      <p className="mt-2 text-2xl font-black text-slate-950">{booking.contactName}</p>
                      <p className="mt-1 text-sm text-slate-500">{booking.contactPhone}</p>
                    </div>
                    <Ticket className="h-8 w-8 text-brand-red" />
                  </div>
                </div>

                <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-soft">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">QR Code</p>
                  <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                    <div className="flex items-center justify-center rounded-2xl bg-white p-4 shadow-sm">
                      <QRCode value={qrValue} size={156} bgColor="#ffffff" fgColor="#111827" />
                    </div>
                    <p className="mt-3 text-center text-xs leading-6 text-slate-500">
                      Scan this QR to verify the booking at check-in.
                    </p>
                  </div>
                </div>

                <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-soft">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Barcode</p>
                      <p className="mt-1 text-sm font-semibold text-slate-950">{reference}</p>
                    </div>
                    <FileText className="h-6 w-6 text-brand-red" />
                  </div>
                  <div className="mt-4">
                    <Barcode value={reference} />
                  </div>
                </div>

                <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-soft">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Terms & Conditions</p>
                  <ul className="mt-4 space-y-2 text-xs leading-6 text-slate-500">
                    <li>• Please arrive 15 minutes before departure.</li>
                    <li>• Keep your booking reference and QR code ready.</li>
                    <li>• Seat assignment may be finalized at boarding.</li>
                    <li>• Pickup and dropoff points are subject to operational conditions.</li>
                  </ul>
                </div>
              </div>
            </aside>
          </div>

          <div className="border-t border-dashed border-slate-200 bg-white px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-slate-500">
                <span className="font-semibold text-slate-900">الصقور</span> • Premium transportation experience
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span>Booking ID: {reference}</span>
                <span>•</span>
                <span>User: {booking.userEmail}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-3 print-hide">
          <button
            onClick={() => navigate("/my-trips")}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 text-sm font-semibold text-slate-700 shadow-soft transition hover:-translate-y-0.5"
          >
            <ArrowLeft className="h-4 w-4" />
            رجوع إلى رحلاتي
          </button>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    </section>
  );
}
