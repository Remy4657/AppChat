// SkeletonCard.tsx
import { Skeleton } from "@/components/ui/skeleton"; // nếu dùng shadcn

export function SkeletonCard() {
  return (
    <div className="flex items-center space-x-4 p-4 border rounded-lg">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}
