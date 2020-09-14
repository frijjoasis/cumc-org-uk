import Home from "./views/home/index.js";
import Blog from "./views/blog/index.js";
import Register from "./views/login/index.js"

import ClubAbout from "./views/about/club.js";
import CommitteeAbout from "./views/about/committee.js";
import SafetyAbout from "./views/about/safety.js";
import CompetitionsAbout from "./views/about/competitions.js";
import GearAbout from "./views/about/gear.js";

import UpcomingMeets from "./views/meets/upcoming.js"
import ViewMeet from "./views/meets/view.js";
import MeetForm from "./views/meets/form.js";
import IndoorMeets from "./views/meets/indoor.js"
import OutdoorMeets from "./views/meets/outdoor.js"
import SocialMeets from "./views/meets/social.js"

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
    path: "/about/safety",
    name: "Safety",
    icon: "pe-7s-attention",
    Component: SafetyAbout,
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
    auth: true,
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