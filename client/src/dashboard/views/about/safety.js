import React from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";

const safetyAbout = [
    <h2>Cambridge University Mountaineering Club Safety Policy</h2>,
    <br />,
    <h3>1 Introduction</h3>,
    <br />,
    "This policy is designed to outline the various safety issues that have been considered by the club and how they affect its running.",
    <br />,<br />,
    "Certain positions within the club committee have a designated responsibility for safety. The President will take the lead in promoting"+
    " a positive safety culture within the club. The Outdoor, Indoor and Alpine and Winter secretaries are responsible for leading and"+
    " promoting safe practice in their respective disciplines.",
    <br />,<br />,
    "The committee, as well as club members, should ensure that those holding such positions have the appropriate knowledge and experience"+
    " to fulfil effectively their health and safety responsibilities. In taking up a position of a club officer an individual must understand"+
    " that they are accepting responsibility and they must fulfil those duties to the best of their ability without negligence. ",
    <br />,
    <h3>2 Safety on meets</h3>,
    <br />,
    "No member is responsible for any other member regardless of experience; each member is responsible for their own actions and decisions"+
    " whilst climbing. This is a direct reflection of the BMC participation statement: ‘The BMC recognises that climbing, hill walking and"+
    " mountaineering are activities with a danger of personal injury or death. Participants in these activities should be aware of and accept"+
    " these risks and be responsible for their own actions and involvement.’",
    <br />,<br />,
    "Any members lacking items of equipment should contact the gear secretary. Members with questions concerning the nature of the climbing"+
    " should contact the meet organiser, usually the indoor or outdoor meet sec.",
    <br />,<br />,
    "Members without climbing experience are encouraged to gain the necessary skills as they see fit. No member shall be considered as an"+
    " instructor, unless they have the required qualifications and are acting in an official capacity on the trip.",
    <br />,<br />,
    "The meet organiser will endeavour to ensure that there is always an appropriate mix of experienced and inexperienced climbers on a meet."+
    " However, it must be appreciated that this may not always be possible; the first paragraph of this section must be borne in mind.",
    <br />,<br />,
    "Members on a trip should be given the phone number of the trip leader (the Outdoor Meet Secretary unless otherwise specified) and "+
    " Cambridge contact for use in emergency or if a problem/delay arises.",
    <br />,<br />,
    "It is the responsibility of the individual to inspect any equipment borrowed from the club, and to ensure they have adequate knowledge"+
    " regarding its proper usage. Any problems or issues should be reported immediately to the Gear Secretary (if present) or the trip leader.",
    <br />,<br />,
    "The Club endorses fully the use of helmets for all outdoor climbing activities; they are available to borrow from the Gear Secretary.",
    <br />,<br />,
    "A suitable number of first aid kits must be taken on all trips; ‘suitable’ equates to a minimum of one per group for single-pitch cragging"+
    " outings, and one per rope for outings in the mountains.",
    <br />,
    <h3>2.1 Driving on meets</h3>,
    <br />,
    "Drivers use cars at their own risk, whether they own the car or have hired it. They are responsible for ensuring that they are correctly"+
    " licensed, taxed and insured and that their car is road legal.",
    <br />,<br />,
    "If a driver is feeling fatigued or drowsy while driving then they should take a break at the first available safe opportunity. Passengers"+
    " should not pressure the driver into avoiding stops in order to get to the location sooner",
    <br />,<br />,
    "Drivers will be reimbursed at a rate of 25p per mile driven. This is intended to cover fuel and wear & tear only i.e. not insurance,"+
    " depreciation, tax etc. If a car is hired then the driver will simply be reimbursed for the cost of hire and fuel (receipts must be"+
    " retained as proof of purchase). Those hiring for the club should first read the guide to hiring on the club website.",
    <br />,
    <h3>3 Insurance</h3>,
    <br />,
    "The Cambridge University mountaineering club is an affiliated club of the British Mountaineering Council (BMC). The BMC provides club"+
    " liability insurance cover for the club and its members. Cover is applicable worldwide, subject to the exclusion of any legal action brought against the insured in a court of Law within the USA/Canada. This does not mean that activities in the USA/Canada are excluded, only that legal actions brought in the USA/Canada are excluded. It is recommended that members take out their own personal accident and travel insurance for trips that take place abroad.",
    <br />,
    <h3>4 Risk assessments</h3>,
    <br />,
    "It is a requirement of the University to have an up to date risk assessment for club activities. It is a condition of funding from the"+
    " Societies Syndicate that the safety procedures of such clubs (that do hazardous activities) are approved by the Director of Physical Education.",
    <br />,<br />,
    "Risk assessments have been done to cover the following club activities: (a) indoor climbing/bouldering, (b) outdoor climbing/bouldering"+
    " and (c) hill walking. These risk assessments should be reviewed on an annual basis. If any individual should wish to inspect them, please"+
    " contact the Secretary.",
    <br />,
    <h3>5 Equipment</h3>,
    <br />,
    "The Gear Secretary is responsible for the lending of club equipment to members. They will follow the British Mountaineering Council"+
    " recommendations for care and maintenance of club kit.",
    <br />,
    <h3>5.1 Equipment lending</h3>,
    <br />,
    "The club and the Gear Secretary shall endeavour to keep the club gear in good condition, however those borrowing the gear must understand"+
    " that we are ultimately a student society with limited resources. The borrower must make their own assessment of the condition of any gear"+
    " they borrow before using it.",
    <br />,<br />,
    "On loaning the Gear Secretary shall record the items lent to any individual, and the date on which they were lent.",
    <br />,<br />,
    "A precondition for borrowing is the acceptance of the club’s financial policy regarding lost or stolen equipment (see Section 5).",
    <br />,<br />,
    "On return the secretary is responsible for ascertaining:",
    <br />,<br />,
    <ul>
        <li>If any major falls have been taken. If so, all relevant gear should be checked for damage. This entails checking whether (a) nuts, hexes
         and cams are severely misshapen or have damaged wires, and (b) whether there are cuts or regions of serious abrasion on soft gear.
        </li>
        <li>Any equipment showing these signs should be immediately retired.</li>
        <li>Any helmets that have endured a major impact should also be retired.</li>
        <li>A rope that has held a major fall should be checked along its full length for any major unevenness, again which if present means the rope
         should be retired.
        </li>
        <li>A rope with minor damage (such as small amounts of sheath separation or furring up of the surface) should be downgraded to a top-rope as below.</li>
        <li>If the gear has been near seawater, i.e. used at a sea-cliff, it should all be washed and re-lubricated as necessary. If any of the gear
         has corrosion which cannot easily be removed it should be retired.
        </li>
    </ul>,
    <h3>5.2 Equipment maintenance</h3>,
    <br />,
    "A record of the purchase details (including date) and safety checks of club safety gear should be kept.",
    <br />,<br />,
    "The Gear sec should inspect the general condition of gear when it is returned (in accordance with point 3 in section 5.1). ",
    <br />,<br />,
    "At handover the new Gear sec should inspect all gear and flag anything they think needs replacing or retiring. If unsure they should"+
    " consult other members of the committee.",
    <br />,<br />,
    "No rope should be used for lead climbing for more than six years. After this, the rope may still be used for top-roping or as a safety"+
    " rope if it is in reasonable condition.",
    <br />,<br />,
    "All other gear can be used indefinitely, as long as it is deemed to be in reasonable condition.",
    <br />,
    <h3>6 Lost and stolen policy</h3>,
    <br />,
    "The club shall attempt to recoup money from those who lose or steal club equipment. Losing gear includes getting trad gear stuck, or any"+
    " situation where the borrower did not take reasonable steps to look after the gear. If in doubt, ask the question “if this person borrowed"+
    " my personal gear and lost/damaged it in this way, would I expect them to offer to replace it?”. If the answer to that is yes, then the club"+
    " should try to recoup money. The value of equipment is to be estimated according to the following:",
    <br />,<br />,
    "For any metal gear:",
    <br />,<br />,
    "value = cost when purchased",
    <br />,<br />,
    "For any soft gear:",
    <br />,<br />,
    "value = cost * (1 - age/recommended maximum age)",
    <br />,<br />,
    "This is a guideline only; it may be that the equipment has no ‘recommended maximum age’, or that other unprecedented circumstances render"+
    " the above inappropriate. In such cases, the Gear Secretary should consult the President for further advice.",
    <br />,<br />,
    <h3>7 Emergency procedures</h3>,
    <br />,<br />,
    "In the first instance club members should ensure their own safety. In the event of an accident the emergency services should be called"+
    " where necessary and the university informed. All incidents and accidents must be reported by submitting an accident report form to the"+
    " Physical Education Department.",
    <br />,
    <h3>8 Changes to policy</h3>,
    <br />,
    "This document should be kept up to date; a revised version can be approved by a simple majority of votes from the committee.",
    <br />

];

class SafetyAbout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: false
        }
    }

    render() {
        return (
            <div className="content">
                <Container>
                    <Row>
                        <Col>
                            <Card>
                                <Card.Body>
                                    <p>{safetyAbout}</p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

export default SafetyAbout;