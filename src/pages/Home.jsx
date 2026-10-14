import { useMemo } from "react";
import { useApp } from "../context/AppContext.jsx";
import { DEFAULT_FILTERS } from "../utils/filters.js";
import { metaFor } from "../utils/seo.js";
import { siteOrigin } from "../utils/boot.js";
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
  const meta = useMemo(() => metaFor({ type: "home", path: "/" }, all, siteOrigin()), [all]);
  return (
    <>
      <Seo meta={meta} />
      <Hero all={all} onSearch={(p) => applyFilters({ ...DEFAULT_FILTERS, ...p }, true)} />
      <Browse all={all} />
      <Listings />
      <Why />
      <Process />
      <Faq />
      <ContactSection />
    </>
  );
}
