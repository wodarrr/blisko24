import Header from "../components/Header";
import Hero from "../components/Hero";
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
  }>;
};

export default async function Home({ searchParams }: Props) {
  const {
    search,
    category,
    province,
    city,
    sort,
  } = await searchParams;

  return (
    <main className="min-h-screen bg-gray-100">
      <Header />

      <Hero />

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
      />

      <ProvinceStatistics />

      <HomeBanner />

      <PortalStats />

      <LivePortal />

      <Footer />
    </main>
  );
}