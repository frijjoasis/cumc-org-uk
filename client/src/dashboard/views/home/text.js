import {NavLink} from "react-router-dom";
import React from "react";

const slides = [
	{
		img: require('../../../assets/img/carousel/welcome.jpg').default,
		header: "Welcome!",
		desc: "Welcome to the Cambridge University Mountaineering Club website!",
	},
	{
		img: require('../../../assets/img/carousel/competitions.jpg').default,
		header: "Indoor Bouldering",
		desc: "Our competition team crushing in a training session",
	},
    {
        img: require('../../../assets/img/carousel/trad.jpg').default,
        header: "Trad Climbing",
        desc: "Who doesn't love slabs?",
    },
    {
        img: require('../../../assets/img/carousel/bouldering.jpg').default,
        header: "Outdoor Bouldering",
        desc: "Elizabeth (our current president!) bouldering at Stanage",
    },
    {
        img: require('../../../assets/img/carousel/alpine.jpg').default,
        header: "Scottish Winter",
        desc: "Green Gully, Ben Nevis",
    },
];

function aboutText(link) {
    return [
        <p>
            We’re active in pretty much all areas of mountaineering and climbing, from indoor bouldering, to outdoor
            sport
            and trad climbing, right up to winter and alpine climbing. You don’t have to have any prior experience of
            climbing to join, so if you're at all interested in mountaineering or climbing we'd like to meet you. If
            you’re
            joining us as a fresher in October we’ll have a number of freshers’ events coming up in the first few weeks
            of
            term and we’ll be at the CUSU societies fair. If you’re joining later in the year then fear not! We run
            weekly
            bouldering socials throughout the year which you can attend without paying membership, so come along and say
            hi!
        </p>,
        <br/>,
        <p>
            If you want to find out more about what we do then have a look at the upcoming meets section (they should
            start
            appearing just before the start of each term). You can also register with Raven and sign up to our mailing
            list
            for free, which will mean you'll get our weekly bulletin and find out what we’ve got going on each week. We
            also have a
            <a href="https://www.facebook.com/cumcofficial/"> Facebook page <i className="fa fa-facebook-square"/></a>,
            <a href={link}> Whatsapp group <i
                className="fa fa-whatsapp"/></a>,
            and <a href="https://www.instagram.com/cumcofficial"> Instagram <i className="fa fa-instagram"/></a>. If
            you've
            got any questions then feel free to <NavLink to="/about/committee"
                                                         className="simple-text">email</NavLink> one
            of us! Hopefully see you climbing soon!
        </p>
    ];
}

const membershipText = [
    <p>
        Thinking about becoming a member? Here's why you should.
    </p>,
    <br />,
    <p>
        What you can do with us if you're not a member:
    </p>,
    <ul>{[
        ["Come on our Monday evening bouldering socials at Kelsey Kerridge bouldering wall (followed by the pub). We " +
        "also run sessions on Fridays 2-4pm at ",
            <a key="rr-link" href="https://rainbowrocket.cc/">Rainbow Rocket</a>,
            "."],
        ["Come to one ",
            <NavLink key="indoor-link" to="/meets/indoor" className="simple-text">indoor</NavLink>, " or ",
            <NavLink key="outdoor-link" to="/meets/outdoor" className="simple-text">outdoor</NavLink>, " " +
            "meet to try it out. You wont have to pay membership but you will still have to pay the cost of the " +
            "meet (typically £15 for outdoor meets and £6 for indoor meets)"],
        "Come to the freshers' bouldering, freshers' squash and freshers' meet, which all take place in the first " +
        "few weeks of Michealmas term.",
        "Create an account on the website and sign up to the weekly bulletin, so you can find out what sort of stuff " +
        "we get up to.",
    ].map((i, key) => <li key={key}>{i}</li>)}</ul>,
    <br />,
    <p>
        What you can do with us if you are a member:
    </p>,
    <ul>{[
        ["Attend indoor and outdoor meets. Details of our regular meets will appear in the ",
            <NavLink key="upcoming-link" to="/meets/upcoming" className="simple-text">'Upcoming'</NavLink>,
            " section shortly before term starts. There's more general info about the meets (",
            <NavLink key="outdoor-link" to="/meets/outdoor" className="simple-text">outdoor</NavLink>, ", ",
            <NavLink key="indoor-link" to="/meets/indoor" className="simple-text">indoor</NavLink>, ", ",
            <NavLink key="social-link" to="/meets/social" className="simple-text">social</NavLink>,
            ") in each respective category"],
        ["Borrow ",
            <NavLink key="gear-link" to="/about/gear" className="simple-text">gear</NavLink>,
            " from the club for free, including racks, guidebooks, shoes etc."],
        ["Compete in various climbing ",
            <NavLink key="comp-link" to="/about/competitions" className="simple-text">competitions</NavLink>,
            " for the University."],
        "Buy stash.",
        "Get BMC (British Mountaineering Council) membership included with your club membership.",
        "Plus much more...",
    ].map((i, key) => <li key={key}>{i}</li>)}</ul>,
    <br />,
    <p>
        To become a member simply create an account (sign in with Raven) on the website and follow the instructions.
        Membership costs £27 for the academic year (£22 if you sign up in Easter term).
    </p>
];

// Images here should have the same aspect ratio
const homeImagesOne = [ // appear between about and membership sections
    require('../../../assets/img/home-1.jpg').default,
    require('../../../assets/img/home-2.jpg').default,
    require('../../../assets/img/home-3.jpg').default,
];
const homeImagesTwo = [ // appear below membership section
    require('../../../assets/img/home-4.jpg').default,
    require('../../../assets/img/home-5.jpg').default,
];
const homeImagesThree = [ // second row below membership section
    require('../../../assets/img/home-6.jpg').default,
    require('../../../assets/img/home-7.jpg').default,
];

export {slides, aboutText, membershipText, homeImagesOne, homeImagesTwo, homeImagesThree};
