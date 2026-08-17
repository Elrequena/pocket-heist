"use client";

import { useHeists } from "@/hooks";
import { Skeleton } from "@/components/Skeleton";

function HeistSection({
  title,
  heists,
  loading,
  emptyMessage,
}: {
  title: string;
  heists: { id: string; title: string }[];
  loading: boolean;
  emptyMessage: string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {loading ? (
        <div className="flex flex-col gap-2">
          <Skeleton width="100%" height="20px" />
          <Skeleton width="80%" height="20px" />
          <Skeleton width="60%" height="20px" />
        </div>
      ) : heists.length === 0 ? (
        <p className="text-sm text-gray-500 italic">{emptyMessage}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {heists.map((heist) => (
            <li key={heist.id} className="text-sm text-body">
              {heist.title}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function HeistsPage() {
  const { heists: activeHeists, loading: activeLoading } = useHeists("active");
  const { heists: assignedHeists, loading: assignedLoading } =
    useHeists("assigned");
  const { heists: expiredHeists, loading: expiredLoading } =
    useHeists("expired");

  return (
    <div className="flex flex-col gap-8 p-6">
      <HeistSection
        title="Your Active Heists"
        heists={activeHeists}
        loading={activeLoading}
        emptyMessage="No active heists assigned to you."
      />
      <HeistSection
        title="Heists You've Assigned"
        heists={assignedHeists}
        loading={assignedLoading}
        emptyMessage="You haven't assigned any heists yet."
      />
      <HeistSection
        title="All Expired Heists"
        heists={expiredHeists}
        loading={expiredLoading}
        emptyMessage="No expired heists found."
      />
    </div>
  );
}
