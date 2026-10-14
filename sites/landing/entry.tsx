import { hydrateRoot } from "react-dom/client";
import { LandingPage } from "../../components/landing-page";

const launched = document.documentElement.dataset.launched === "true";
hydrateRoot(document.getElementById("root")!, <LandingPage launched={launched} appUrl="https://charpai.sreechand.pm/app" />);
