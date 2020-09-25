import React from "react";
import {NavLink} from "react-router-dom";

const gearSecLink = <NavLink to="/about/committee">gear sec</NavLink>

const gearAbout = [
    <p>
        The table below shows what equipment is owned by the club, along with its availability. Gear can be borrowed
        and returned at regular "teas" during term time, which are advertised via the mailing list. Outside term time
        please contact the {gearSecLink}.
    </p>,
    <p>
        In term time, gear should be returned within one week of it being issued. If you want to keep it for longer,
        then you need to contact the gear secretary to ‘renew’ it. If gear is not returned, and the gear sec is not
        given a legitimate reason as to why (e.g. illness so couldn't make the gear tea), then the borrower will be
        expected to pay for the gear.
    </p>,
    <p>
        If gear is lost or damaged, but the borrower had taken reasonable precautions to look after it, then the club
        will cover the cost at their discretion. If the club decides that reasonable precautions weren't taken, then
        you will be expected to cover the cost of replacement/repair, using the formula:
    </p>,
    <p className="text-center">
        <code>estimated value = cost * (1-age/recommend max age)</code>
    </p>,
];

export {gearAbout}