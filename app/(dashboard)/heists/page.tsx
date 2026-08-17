"use client";

import { Clock, Target } from "lucide-react";
import { useHeists } from "@/hooks";
import { HeistCard, HeistCardSkeleton } from "@/components/HeistCard";
import type { Heist } from "@/types/firestore";

function HeistSection({
  title,
  icon,
  heists,
  loading,
  emptyMessage,
}: {
  title: string;
  icon: React.ReactNode;
  heists: Heist[];
  loading: boolean;
  emptyMessage: string;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
        {icon}
        {title}
      </h2>
      {loading ? (
        <div className="heist-grid">
          {Array.from({ length: 3 }).map((_, i) => (
            <HeistCardSkeleton key={i} />
          ))}
        </div>
      ) : heists.length === 0 ? (
        <p className="text-sm text-body italic">{emptyMessage}</p>
      ) : (
        <div className="heist-grid">
          {heists.map((heist) => (
            <HeistCard key={heist.id} heist={heist} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function HeistsPage() {
  const { heists: activeHeists, loading: activeLoading } = useHeists("active");
  const { heists: assignedHeists, loading: assignedLoading } =
    useHeists("assigned");

  return (
    <div className="flex flex-col gap-8 p-6">
      <HeistSection
        title="Active Heists"
        icon={<Clock size={20} />}
        heists={activeHeists}
        loading={activeLoading}
        emptyMessage="No active heists assigned to you."
      />
      <HeistSection
        title="Assigned Heists"
        icon={<Target size={20} />}
        heists={assignedHeists}
        loading={assignedLoading}
        emptyMessage="You haven't assigned any heists yet."
      />
    </div>
  );
}
