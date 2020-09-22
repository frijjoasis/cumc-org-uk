import Home from "./views/home/index.js";
import MeetManager from "./views/meets";

const routes = [
    {
        path: "/home",
        name: "Home",
        icon: "pe-7s-home",
        Component: Home,
        layout: "/committee",
    },
    {
        path: "/meets",
        name: "Meets",
        icon: "pe-7s-map-2",
        Component: MeetManager,
        layout: "/committee",
    },
];

export default routes;