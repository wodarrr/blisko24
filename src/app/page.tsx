import Header from "../components/Header";
import Hero from "../components/Hero";
import Categories from "../components/Categories";
import LatestAds from "../components/LatestAds";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      <Header />
      <Hero />
      <Categories />
      <LatestAds />
      <Footer />
    </main>
  );
}






