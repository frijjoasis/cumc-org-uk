import { lazy } from 'react';
import { RouteConfig } from '../types';

const Home = lazy(() => import('./views/home/'));
const Blog = lazy(() => import('../components/UnderConstruction/Construction'));
const Register = lazy(() => import('./views/login/'));

// About Views
const ClubAbout = lazy(() => import('./views/about/club'));
const CommitteeAbout = lazy(() => import('./views/about/committee'));
const DocumentsAbout = lazy(() => import('./views/about/documents'));
const CompetitionsAbout = lazy(() => import('./views/about/competitions'));
const GearAbout = lazy(() => import('./views/about/gear'));
const ResourcesAbout = lazy(() => import('./views/about/resources'));

// Meets Views
const UpcomingMeets = lazy(() => import('./views/meets/upcoming'));
const ViewMeet = lazy(() => import('./views/meets/upcoming/view'));
const MeetForm = lazy(() => import('./views/meets/upcoming/form'));
const IndoorMeets = lazy(() => import('./views/meets/indoor'));
const OutdoorMeets = lazy(() => import('./views/meets/outdoor'));
const SocialMeets = lazy(() => import('./views/meets/social'));
const BritRock = lazy(() => import('./views/britrock'));

/**
 * Route Configuration
 * Note: The order in this array determines the order in the Sidebar.
 */
const routes: RouteConfig[] = [
  {
    path: '/home',
    name: 'Home',
    icon: 'pe-7s-home',
    Component: Home,
    layout: '',
  },
  {
    path: '/blog',
    name: 'Blog',
    icon: 'pe-7s-news-paper',
    Component: Blog,
    layout: '',
  },

  /* --- ABOUT SECTION --- */
  {
    category: true,
    name: 'About',
  },
  {
    path: '/about/club',
    name: 'The Club',
    icon: 'pe-7s-info',
    Component: ClubAbout,
    layout: '',
  },
  {
    path: '/about/committee',
    name: 'Committee',
    icon: 'pe-7s-id',
    Component: CommitteeAbout,
    layout: '',
  },
  {
    path: '/about/competitions',
    name: 'Competitions',
    icon: 'pe-7s-medal',
    Component: CompetitionsAbout,
    layout: '',
  },
  {
    path: '/about/gear',
    name: 'Gear',
    icon: 'pe-7s-config',
    Component: GearAbout,
    layout: '',
  },
  {
    path: '/about/resources',
    name: 'Resources',
    icon: 'pe-7s-note2',
    Component: ResourcesAbout,
    layout: '',
  },
  {
    path: '/about/documents',
    name: 'Documents',
    icon: 'pe-7s-attention',
    Component: DocumentsAbout,
    layout: '',
  },

  /* --- MEETS SECTION --- */
  {
    category: true,
    name: 'Meets',
  },
  {
    path: '/meets/upcoming',
    name: 'Upcoming',
    icon: 'pe-7s-clock',
    Component: UpcomingMeets,
    layout: '',
  },
  {
    path: '/meets/upcoming/view/:id',
    name: 'View Meet',
    hide: true, // Only accessible via links, not Sidebar
    Component: ViewMeet,
    layout: '',
  },
  {
    path: '/meets/upcoming/register/:id',
    name: 'Meet Registration',
    hide: true,
    Component: MeetForm,
    layout: '',
  },
  {
    path: '/meets/indoor',
    name: 'Indoor',
    icon: 'pe-7s-gym',
    Component: IndoorMeets,
    layout: '',
  },
  {
    path: '/meets/outdoor',
    name: 'Outdoor',
    icon: 'pe-7s-photo',
    Component: OutdoorMeets,
    layout: '',
  },
  {
    path: '/meets/social',
    name: 'Social',
    icon: 'pe-7s-wine',
    Component: SocialMeets,
    layout: '',
  },

  /* --- OTHER --- */
  {
    path: '/register',
    name: 'Register',
    hide: true,
    auth: true,
    Component: Register,
    layout: '',
  },
  // Commented out as its over for this year
  // {
  //   path: '/britrock',
  //   name: 'Brit Rock',
  //   icon: 'pe-7s-film',
  //   Component: BritRock,
  //   layout: '',
  // },
];

export default routes;
