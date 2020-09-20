import Home from "./views/home/index.js";

const routes = [
    {
        path: "/home",
        name: "Home",
        icon: "pe-7s-home",
        Component: Home,
        layout: "/committee",
    }
];

export default routes;