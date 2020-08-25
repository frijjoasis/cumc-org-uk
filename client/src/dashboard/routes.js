import Home from "./views/home/index.js";

import ClubAbout from "./views/about/club.js";
import CommitteeAbout from "./views/about/committee.js";
import SafetyAbout from "./views/about/safety.js";

import UpcomingMeets from "./views/meets/upcoming.js"
import IndoorMeets from "./views/meets/indoor.js"
import OutdoorMeets from "./views/meets/outdoor.js"
import SocialMeets from "./views/meets/social.js"

// Warning: Order matters here. It's an array!
var routes = [
  {
    path: "/home",
    name: "Home",
    icon: "pe-7s-home",
    component: Home,
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
    component: ClubAbout,
    layout: "",
  },
  {
    path: "/about/committee",
    name: "Committee",
    icon: "pe-7s-id",
    component: CommitteeAbout,
    layout: "",
  },
  {
    path: "/about/safety",
    name: "Safety",
    icon: "pe-7s-attention",
    component: SafetyAbout,
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
    component: UpcomingMeets,
    layout: "",
  },
  {
    path: "/meets/indoor",
    name: "Indoor",
    icon: "pe-7s-info",
    component: IndoorMeets,
    layout: "",
  },
  {
    path: "/meets/outdoor",
    name: "Outdoor",
    icon: "pe-7s-info",
    component: OutdoorMeets,
    layout: "",
  },
  {
    path: "/meets/social",
    name: "Social",
    icon: "pe-7s-wine",
    component: SocialMeets,
    layout: "",
  },
];
export default routes;
