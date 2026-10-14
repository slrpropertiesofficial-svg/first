import { useApp } from "../context/AppContext.jsx";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import FloatingContact from "./FloatingContact.jsx";
import EnquiryModal from "./EnquiryModal.jsx";

export default function Layout({ children }) {
  const { saved, enquiry, setEnquiry } = useApp();
  return (
    <>
      <a className="skip" href="#main">Skip to main content</a>
      <header><Header savedCount={saved.length} /></header>
      <main id="main" tabIndex="-1">{children}</main>
      <Footer />
      <FloatingContact />
      {enquiry && <EnquiryModal target={enquiry} onClose={() => setEnquiry(null)} />}
    </>
  );
}
