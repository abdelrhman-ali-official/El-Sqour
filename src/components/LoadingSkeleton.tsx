type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`skeleton ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-soft">
      <Skeleton className="h-44 w-full" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-4 w-24 rounded-full" />
        <Skeleton className="h-5 w-40 rounded-full" />
        <Skeleton className="h-4 w-32 rounded-full" />
      </div>
    </div>
  );
}
