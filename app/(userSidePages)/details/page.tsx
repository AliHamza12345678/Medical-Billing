import Image from "next/image";
import CardiologyHealth from "../components/Cardiology-Health";
import ServiceDetails from "../components/Services-details"












export default function Home() {
    return (
        <>
       <CardiologyHealth/>

        <div className="bg-white">
               <ServiceDetails />
        </div>

        </>
    );
}
