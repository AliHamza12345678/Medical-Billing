
import Image from "next/image";

import HeroSection from "./components/herosection";
import AboutSection from "./components/Aboutsection";
import Services from "./components/services";
import HowItWorks from "./components/how-it-work";
import ProfessionalCareTeam from "./components/professional-care-team";
import OurPricing from "./components/Our-pricing";
import Discountnow from "./components/Discount-now";
import Testimonialst from "./components/Testimonialst";
import Counter from "./components/Conter";
import Faq from "./components/Faq";
import Appointment from "./components/Appointment";


export default function Home() {
  return (
    <>

      <HeroSection />
      <AboutSection />
      <Services />
      <HowItWorks />
      <ProfessionalCareTeam />
      <OurPricing />
      <Discountnow />
      <Testimonialst />
      <Counter />
      <Faq />
      <Appointment />

    </>
  );
}
