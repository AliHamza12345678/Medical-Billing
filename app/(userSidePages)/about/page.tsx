import Image from "next/image";
import Aboutsection from "../components/aboutus-section";
import AboutusSection from "../components/Aboutsection";
import ProfessionalCareTeam from "../components/professional-care-team";
import Howitwork from "../components/how-it-work";
import Discountnow from "../components/Discount-now"
import Testimonialst from "../components/Testimonialst"






export default function Home() {
    return (
        <>
            <Aboutsection />
            <AboutusSection/>
            <ProfessionalCareTeam/>
            <Howitwork/>
            <Discountnow/>
            <Testimonialst />


        </>
    );
}
