import Fv from "@/components/SSG/Fv/Fv";
import Works from "@/components/SSG/Works/Works";
import About from "@/components/SSG/About/About";
import Service from "@/components/SSG/Service/Service";
import Flow from "@/components/SSG/Flow/Flow";
import Blogs from "@/components/SSG/Blogs/Blogs";
import Cta from "@/components/SSG/Cta/Cta";

export default function PageContent() {
  return (
    <>
      <Fv />
      <div id="works">
        <Works />
      </div>
      <About />
      <Service />
      <Flow />
      <Blogs />
      <Cta />
    </>
  );
}