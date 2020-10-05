import Home from "./views/home/";
import Blog from "../components/UnderConstruction/Construction";
import Register from "./views/login/"

import ClubAbout from "./views/about/club";
import CommitteeAbout from "./views/about/committee";
import DocumentsAbout from "./views/about/documents";
import CompetitionsAbout from "./views/about/competitions";
import GearAbout from "./views/about/gear";

import UpcomingMeets from "./views/meets/upcoming";
import ViewMeet from "./views/meets/upcoming/view";
import MeetForm from "./views/meets/upcoming/form";
import IndoorMeets from "./views/meets/indoor";
import OutdoorMeets from "./views/meets/outdoor";
import SocialMeets from "./views/meets/social";

// Warning: Order matters here. It's an array!
const routes = [
  {
    path: "/home",
    name: "Home",
    icon: "pe-7s-home",
    Component: Home,
    layout: "",
  },
  {
    path: "/blog",
    name: "Blog",
    icon: "pe-7s-news-paper",
    Component: Blog,
    layout: "",
  },
  {
    category: true,
    name: "About",
  },
  {
    path: "/about/club",
    name: "The Club",
    icon: "pe-7s-info",
    Component: ClubAbout,
    layout: "",
  },
  {
    path: "/about/committee",
    name: "Committee",
    icon: "pe-7s-id",
    Component: CommitteeAbout,
    layout: "",
  },
  {
    path: "/about/competitions",
    name: "Competitions",
    icon: "pe-7s-medal",
    Component: CompetitionsAbout,
    layout: "",
  },
  {
    path: "/about/gear",
    name: "Gear",
    icon: "pe-7s-config",
    Component: GearAbout,
    layout: "",
  },
  {
    path: "/about/documents",
    name: "Documents",
    icon: "pe-7s-attention",
    Component: DocumentsAbout,
    layout: "",
  },
  {
    category: true,
    name: "Meets",
  },
  {
    path: "/meets/upcoming",
    name: "Upcoming",
    icon: "pe-7s-clock",
    Component: UpcomingMeets,
    layout: "",
  },
  {
    path: "/meets/upcoming/view/:id",
    name: "View Meet",
    hide: true,
    Component: ViewMeet,
    layout: "",
  },
  {
    path: "/meets/upcoming/register/:id",
    name: "Meet Registration",
    hide: true,
    Component: MeetForm,
    layout: "",
  },
  {
    path: "/meets/indoor",
    name: "Indoor",
    icon: "pe-7s-gym",
    Component: IndoorMeets,
    layout: "",
  },
  {
    path: "/meets/outdoor",
    name: "Outdoor",
    icon: "pe-7s-photo",
    Component: OutdoorMeets,
    layout: "",
  },
  {
    path: "/meets/social",
    name: "Social",
    icon: "pe-7s-wine",
    Component: SocialMeets,
    layout: "",
  },
  {
    path: "/register",
    name: "Register",
    hide: true, // Hide from sidebar
    auth: true, // Requires auth
    Component: Register,
    layout: "",
  },
];

export default routes;