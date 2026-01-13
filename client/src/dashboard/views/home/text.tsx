import { NavLink } from 'react-router-dom';
import React from 'react';
import { Slide } from '@/types/carousel';

// carousel images
import welcomeImg from '@assets/img/carousel/welcome.jpg';
import competitionsImg from '@assets/img/carousel/competitions.jpg';
import tradImg from '@assets/img/carousel/trad.jpg';
import boulderingImg from '@assets/img/carousel/bouldering.jpg';
import alpineImg from '@assets/img/carousel/alpine.jpg';

// home images
import home1 from '@assets/img/home-1.jpg';
import home2 from '@assets/img/home-2.jpg';
import home3 from '@assets/img/home-3.jpg';
import home4 from '@assets/img/home-4.jpg';
import home5 from '@assets/img/home-5.jpg';
import home6 from '@assets/img/home-6.jpg';
import home7 from '@assets/img/home-7.jpg';

const slides: Slide[] = [
  {
    img: welcomeImg,
    header: 'Welcome!',
    desc: 'Welcome to the Cambridge University Mountaineering Club website!',
  },
  {
    img: competitionsImg,
    header: 'Indoor Bouldering',
    desc: 'Our competition team crushing in a training session',
  },
  {
    img: tradImg,
    header: 'Trad Climbing',
    desc: "Who doesn't love slabs?",
  },
  {
    img: boulderingImg,
    header: 'Outdoor Bouldering',
    desc: 'Bouldering at Stanage',
  },
  {
    img: alpineImg,
    header: 'Scottish Winter',
    desc: 'Green Gully, Ben Nevis',
  },
];
function aboutText(link: string) {
  return (
    <div className="space-y-4 text-sm md:text-base leading-relaxed">
      <p>
        We’re active in pretty much all areas of mountaineering and climbing,
        from indoor bouldering, to outdoor sport and trad climbing, right up to
        winter and alpine climbing. You don’t have to have any prior experience
        of climbing to join, so if you're at all interested in mountaineering or
        climbing we'd like to meet you. If you’re joining us as a fresher in
        October we’ll have a number of freshers’ events coming up in the first
        few weeks of term and we’ll be at the CUSU societies fair. If you’re
        joining later in the year then fear not! We run weekly bouldering
        socials throughout the year which you can attend without paying
        membership, so come along and say hi!
      </p>
      <p>
        If you want to find out more about what we do then have a look at the
        upcoming meets section (they should start appearing just before the
        start of each term). You can also register with Raven and sign up to our
        mailing list for free, which will mean you'll get our weekly bulletin
        and find out what we’ve got going on each week. We also have a{' '}
        <a
          href="https://www.facebook.com/cumcofficial/"
          className="text-primary font-bold hover:underline"
        >
          Facebook <i className="fa fa-facebook-square" />
        </a>
        ,{' '}
        <a href={link} className="text-green-600 font-bold hover:underline">
          Whatsapp <i className="fa fa-whatsapp" />
        </a>
        , and{' '}
        <a
          href="https://www.instagram.com/cumcofficial"
          className="text-pink-600 font-bold hover:underline"
        >
          Instagram <i className="fa fa-instagram" />
        </a>
        . If you've got any questions then feel free to{' '}
        <NavLink
          to="/about/committee"
          className="text-blue-600 font-bold hover:underline"
        >
          email
        </NavLink>{' '}
        one of us! Hopefully see you climbing soon!
      </p>
    </div>
  );
}
const membershipText = (
  <div className="space-y-6 text-sm md:text-base leading-relaxed">
    <p className="font-semibold text-lg text-foreground">
      Thinking about becoming a member? Here's why you should.
    </p>

    <div className="space-y-3">
      <p className="font-bold text-primary">
        What you can do with us if you're not a member:
      </p>
      <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
        <li>
          Come on our Monday evening bouldering socials at Kelsey Kerridge
          bouldering wall (followed by the pub). We also run sessions on Fridays
          2-4pm at{' '}
          <a
            href="https://rainbowrocket.cc/"
            className="text-primary font-bold hover:underline"
          >
            Rainbow Rocket
          </a>
          .
        </li>
        <li>
          Come to one{' '}
          <NavLink
            to="/meets/indoor"
            className="text-primary font-bold hover:underline"
          >
            indoor
          </NavLink>{' '}
          or{' '}
          <NavLink
            to="/meets/outdoor"
            className="text-primary font-bold hover:underline"
          >
            outdoor
          </NavLink>{' '}
          meet to try it out. You won't have to pay membership but you will
          still have to pay the cost of the meet (typically £15 for outdoor
          meets and £6 for indoor meets).
        </li>
        <li>
          Come to the freshers' bouldering, freshers' squash and freshers' meet,
          which all take place in the first few weeks of Michaelmas term.
        </li>
        <li>
          Create an account on the website and sign up to the weekly bulletin,
          so you can find out what sort of stuff we get up to.
        </li>
      </ul>
    </div>

    <div className="space-y-3">
      <p className="font-bold text-primary">
        What you can do with us if you are a member:
      </p>
      <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
        <li>
          Attend indoor and outdoor meets. Details of our regular meets will
          appear in the{' '}
          <NavLink
            to="/meets/upcoming"
            className="text-primary font-bold hover:underline"
          >
            'Upcoming'
          </NavLink>{' '}
          section shortly before term starts. There's more general info about
          the meets ({' '}
          <NavLink
            to="/meets/outdoor"
            className="text-primary font-bold hover:underline"
          >
            outdoor
          </NavLink>
          ,{' '}
          <NavLink
            to="/meets/indoor"
            className="text-primary font-bold hover:underline"
          >
            indoor
          </NavLink>
          ,{' '}
          <NavLink
            to="/meets/social"
            className="text-primary font-bold hover:underline"
          >
            social
          </NavLink>{' '}
          ) in each respective category.
        </li>
        <li>
          Borrow{' '}
          <NavLink
            to="/about/gear"
            className="text-primary font-bold hover:underline"
          >
            gear
          </NavLink>{' '}
          from the club for free, including racks, guidebooks, shoes etc.
        </li>
        <li>
          Compete in various climbing{' '}
          <NavLink
            to="/about/competitions"
            className="text-primary font-bold hover:underline"
          >
            competitions
          </NavLink>{' '}
          for the University.
        </li>
        <li>Buy stash.</li>
        <li>
          Get BMC (British Mountaineering Council) membership included with your
          club membership.
        </li>
        <li>Plus much more...</li>
      </ul>
    </div>

    <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-primary text-sm italic shadow-sm">
      To become a member simply create an account (sign in with Raven) on the
      website and follow the instructions. Membership costs £30 for the academic
      year (£25 if you sign up in Easter term).
    </div>
  </div>
);
// Images here should have the same aspect ratio
const homeImagesOne = [
  // appear between about and membership sections
  home1,
  home2,
  home3,
];
const homeImagesTwo = [
  // appear below membership section
  home4,
  home5,
];
const homeImagesThree = [
  // second row below membership section
  home6,
  home7,
];
export {
  slides,
  aboutText,
  membershipText,
  homeImagesOne,
  homeImagesTwo,
  homeImagesThree,
};
