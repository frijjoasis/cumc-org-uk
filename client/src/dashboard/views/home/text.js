import {NavLink} from "react-router-dom";
import React from "react";

const slides = [
    {
        img: require('../../../assets/img/carousel/trad.jpg'),
        header: "Trad Climbing",
        desc: "Who doesn't love slabs?",
    },
    {
        img: require('../../../assets/img/carousel/bouldering.jpg'),
        header: "Bouldering",
        desc: "Elizabeth sending hard on the gritstone of the Peak District",
    },
    {
        img: require('../../../assets/img/carousel/alpine.jpg'),
        header: "Alpine",
        desc: "A nice view in Chamonix",
    },
];

const aboutText = [
    "We’re active in pretty much all areas of mountaineering and climbing, from indoor bouldering, " +
    "to outdoor sport and trad climbing, right up to winter and alpine climbing. You don’t have to have any prior " +
    "experience of climbing to join, so if you're at all interested in mountaineering or climbing we'd like to meet " +
    "you. If you’re joining us as a fresher in October we’ll have a number of freshers’ events coming up in the " +
    "first few weeks of term and we’ll be at the CUSU societies fair. If you’re joining later in the year then fear " +
    "not! We run weekly bouldering socials throughout the year which you can attend without paying membership, so " +
    "come along and say hi!",
    <br />, <br />,
    "If you want to find out more about what we do then have a look at the upcoming meets section (they should start " +
    "appearing just before the start of each term). You can also register with Raven and sign up to our " +
    "mailing list for free, which will mean you'll get our weekly bulletin and find out what we’ve got going on each " +
    "week. We also have a ",
    <a href="https://www.facebook.com/cumcofficial/">Facebook page <i className="fa fa-facebook-square" /></a>,
    ", ",
    <a href="">Whatsapp group <i className="fa fa-whatsapp" /></a>,
    ", and ",
    <a href="https://www.instagram.com/cumcofficial">Instagram <i className="fa fa-instagram" /></a>,
    ". If you've got any questions then feel free to ",
    <NavLink to="/about/committee" className="simple-text">email</NavLink>,
    " one of us! Hopefully see you climbing soon!"
];

const membershipText = [
    "Thinking about becoming a member? Here's why you should.",
    <br />, <br />,
    "What you can do with us if you're not a member:",
    <br />, <br />,
    <ul>{[
        ["Come on our Monday bouldering socials at the ",
            <a href="https://rainbowrocket.cc/">Rainbow Rocket</a>,
            " bouldering wall (followed by the pub)."],
        ["Come to one ",
            <NavLink to="/meets/indoor" className="simple-text">indoor</NavLink>, " or ",
            <NavLink to="/meets/outdoor" className="simple-text">outdoor</NavLink>, " " +
            "meet to try it out. You wont have to pay membership but you will still have to pay the cost of the " +
            "meet (typically £15 for outdoor meets and £6 for indoor meets)"],
        "Come to the freshers' bouldering, freshers' squash and freshers' meet, which all take place in the first " +
        "few weeks of Michealmas term.",
        "Create an account on the website and sign up to the weekly bulletin, so you can find out what sort of stuff " +
        "we get up to.",
    ].map(i => <li>{i}</li>)}</ul>,
    <br />,
    "What you can do with us if you are a member:",
    <br />, <br />,
    <ul>{[
        ["Attend indoor and outdoor meets. Details of our regular meets will appear in the ",
            <NavLink to="/meets/upcoming" className="simple-text">'Upcoming'</NavLink>,
            " section shortly before term starts. There's more general info about the meets (",
            <NavLink to="/meets/outdoor" className="simple-text">outdoor</NavLink>, ", ",
            <NavLink to="/meets/indoor" className="simple-text">indoor</NavLink>, ", ",
            <NavLink to="/meets/social" className="simple-text">social</NavLink>,
            ") in each respective category"],
        ["Borrow ",
            <NavLink to="/about/gear" className="simple-text">gear</NavLink>,
            " from the club for free, including racks, guidebooks, shoes etc."],
        ["Compete in various climbing ",
            <NavLink to="/about/competitions" className="simple-text">competitions</NavLink>,
            " for the University."],
        "Buy stash.",
        "Get BMC (British Mountaineering Council) membership included with your club membership.",
        "Plus much more...",
    ].map(i => <li>{i}</li>)}</ul>,
    <br />,
    "To become a member simply create an account (sign in with Raven) on the website and follow the instructions. " +
    "Membership costs £25 for the academic year (£20 if you sign up in Easter term)."
];

// Images here should have the same aspect ratio
const homeImages = [
    require('../../../assets/img/home-1.jpg'),
    require('../../../assets/img/home-2.jpg'),
];

export {slides, aboutText, membershipText, homeImages};