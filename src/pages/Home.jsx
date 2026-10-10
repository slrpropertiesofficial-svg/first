import { useApp } from "../context/AppContext.jsx";
import { DEFAULT_FILTERS } from "../utils/filters.js";
import Seo from "../components/Seo.jsx";
import Hero from "../components/Hero.jsx";
import Browse from "../components/Browse.jsx";
import Listings from "../components/Listings.jsx";
import Why from "../components/Why.jsx";
import Process from "../components/Process.jsx";
import Faq from "../components/Faq.jsx";
import ContactSection from "../components/ContactSection.jsx";

export default function Home() {
  const { all, applyFilters } = useApp();
  return (
    <>
      <Seo title="Houses, Apartments, Villas, Plots & Commercial Rentals in Bangalore" path="/"
        description="SLR PROPERTIES - verified houses, apartments, villas, sites, agricultural land, layout plots and commercial rentals in Bangalore. Search by location, type and budget." />
      <Hero all={all} onSearch={(p) => applyFilters(p, true)} />
      <Browse all={all} onPick={(group) => applyFilters({ ...DEFAULT_FILTERS, group }, true)} />
      <Listings />
      <Why />
      <Process />
      <Faq />
      <ContactSection />
    </>
  );
}
