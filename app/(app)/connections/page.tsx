import FollowersList from "./_components/FollowersList";
import FollowingList from "./_components/FollowingList";
import ConnectionsSidebar from "./_components/ConnectionSidebar";
import SuggestionsSection from "./_components/SuggestionSection";

interface ConnectionsPageProps {
  searchParams?: Promise<{
    tab?: string;
  }>;
}

export default async function ConnectionsPage({
  searchParams,
}: ConnectionsPageProps) {
  const resolvedSearchParams = await searchParams;
  const tab = resolvedSearchParams?.tab;

  return (
    <div className="max-w-7xl mx-auto mt-6">
      <div className="grid grid-cols-6 gap-6">
        {/* LEFT SIDEBAR */}
        <div className="col-span-2">
          <ConnectionsSidebar tab={tab} />
        </div>

        {/* MAIN CONTENT */}
        <div className="col-span-4">
          {!tab && <SuggestionsSection />}
          {tab === "followers" && <FollowersList />}
          {tab === "following" && <FollowingList />}
        </div>
      </div>
    </div>
  );
}
