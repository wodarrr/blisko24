import Header from "../components/Header";
import Hero from "../components/Hero";
import FreeJobSeekerBanner from "../components/FreeJobSeekerBanner";
import RecentCandidates from "../components/RecentCandidates";
import RecentEmployers from "../components/RecentEmployers";
import HomeStats from "../components/HomeStats";
import FeaturedAdvertisements from "../components/FeaturedAdvertisements";
import Categories from "../components/Categories";
import LatestAds from "../components/LatestAds";
import ProvinceStatistics from "../components/ProvinceStatistics";
import HomeBanner from "../components/HomeBanner";
import PortalStats from "../components/PortalStats";
import LivePortal from "../components/LivePortal";
import Footer from "../components/Footer";
import PopularAdvertisements from "../components/PopularAdvertisements";

type Props = {
  searchParams: Promise<{
    search?: string;
    category?: string;
    province?: string;
    city?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    promoted?: string;
    urgent?: string;
    featured?: string;
  }>;
};

export default async function Home({
  searchParams,
}: Props) {
  const {
    search,
    category,
    province,
    city,
    sort,
    minPrice,
    maxPrice,
    promoted,
    urgent,
    featured,
  } = await searchParams;

  return (
    <main>
      <Header />

      <Hero />

      <FreeJobSeekerBanner />

      <RecentCandidates />

      <RecentEmployers />

      <HomeStats />

      <FeaturedAdvertisements />

      <PopularAdvertisements />

      <Categories />

      <LatestAds
        search={search}
        category={category}
        province={province}
        city={city}
        sort={sort}
        minPrice={minPrice}
        maxPrice={maxPrice}
        promotedOnly={promoted === "true"}
        urgentOnly={urgent === "true"}
        featuredOnly={featured === "true"}
      />

      <ProvinceStatistics />

      <HomeBanner />

      <PortalStats />

      <LivePortal />

      <Footer />
    </main>
  );
}