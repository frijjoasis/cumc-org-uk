import Home from './views/home/index';

import Treasure from './views/treasure';
import Webmaster from './views/webmaster';
import CommitteeManager from './views/committee';
import RolesManager from './views/roles';

import Members from './views/members';
import ViewMember from './views/members/view';

import MeetManager from './views/meets/';
import EditMeet from './views/meets/edit';
import ViewMeet from './views/meets/view';

import { RouteConfig } from '../types';

const routes: RouteConfig[] = [
  {
    path: '/home',
    name: 'Home',
    icon: 'pe-7s-home',
    Component: Home,
    layout: '/committee',
  },
  {
    path: '/meets',
    name: 'Meets',
    icon: 'pe-7s-map-2',
    Component: MeetManager,
    layout: '/committee',
  },
  {
    path: '/meets/archive',
    name: 'Meets Archive',
    hide: true,
    Component: MeetManager,
    layout: '/committee',
  },
  {
    path: '/meets/new',
    name: 'New Meet',
    hide: true,
    Component: EditMeet,
    layout: '/committee',
  },
  {
    path: '/meets/clone/:id',
    name: 'New Meet',
    hide: true,
    Component: EditMeet,
    layout: '/committee',
  },
  {
    path: '/meets/edit/:id',
    name: 'Edit Meet',
    hide: true,
    Component: EditMeet,
    layout: '/committee',
  },
  {
    path: '/meets/view/:id',
    name: 'View Meet',
    hide: true,
    Component: ViewMeet,
    layout: '/committee',
  },
  // {
  //   path: '/treasure',
  //   name: 'Treasure',
  //   icon: 'pe-7s-cash',
  //   Component: Treasure,
  //   layout: '/committee',
  // },
  {
    path: '/members',
    name: 'Members',
    icon: 'pe-7s-users',
    Component: Members,
    layout: '/committee',
  },
  {
    path: '/members/:id',
    name: 'Member Details',
    hide: true,
    Component: ViewMember,
    layout: '/committee',
  },
  {
    path: '/committee',
    name: 'Committee',
    icon: 'pe-7s-users',
    Component: CommitteeManager,
    layout: '/committee',
  },
  {
    path: '/roles',
    name: 'Committee Roles',
    icon: 'pe-7s-config',
    Component: RolesManager,
    layout: '/committee',
  },
  {
    path: '/webmaster',
    name: 'Webmaster',
    icon: 'pe-7s-tools',
    Component: Webmaster,
    layout: '/committee',
  },
];

export default routes;
