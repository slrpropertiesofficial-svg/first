import { DEFAULT_FILTERS } from "../utils/filters.js";
import { useApp } from "../context/AppContext.jsx";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import FloatingContact from "./FloatingContact.jsx";
import EnquiryModal from "./EnquiryModal.jsx";

export default function Layout({ children }) {
  const { saved, applyFilters, enquiry, setEnquiry } = useApp();
  const pick = (group, sub) => applyFilters({ ...DEFAULT_FILTERS, group, sub: sub || "all" }, true);
  return (
    <>
      <Header onPick={pick} savedCount={saved.length} />
      <main id="home">{children}</main>
      <Footer onPick={(group) => pick(group)} />
      <FloatingContact />
      {enquiry && <EnquiryModal target={enquiry} onClose={() => setEnquiry(null)} />}
    </>
  );
}
