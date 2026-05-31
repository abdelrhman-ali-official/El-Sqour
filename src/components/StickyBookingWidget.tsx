import SearchBox from "./SearchBox";

export default function StickyBookingWidget() {
  return (
    <div className="glass rounded-3xl p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">حجز سريع</p>
          <p className="text-lg font-semibold text-slate-900">احجز رحلتك الآن</p>
        </div>
        <span className="rounded-full bg-brand-red/10 px-3 py-1 text-xs font-semibold text-brand-red">
          VIP
        </span>
      </div>
      <div className="mt-4">
        <SearchBox variant="compact" withContainer={false} />
      </div>
      <p className="mt-4 text-xs text-slate-500">
        فريقنا متاح على مدار الساعة لتأكيد الحجز فورًا.
      </p>
    </div>
  );
}
