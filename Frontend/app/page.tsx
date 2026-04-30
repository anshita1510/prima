import HeroSection from "./components/Sections/heroSection";
import Section1 from "./components/Sections/section1";
import Section2 from "./components/Sections/section2";
import Section3 from "./components/Sections/section3";
import Navbar from "./components/partials/navbar";
import Footer from "./components/partials/Footer";

export default function page() {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <Section1 />
      <Section2 />
      <Section3 />
      <Footer />
    </div>
  );
}
