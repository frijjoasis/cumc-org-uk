import React from 'react';
import Container from "react-bootstrap/Container";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import axios from 'axios';

import UserCard from '../../../../components/UserCard/UserCard';

import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";


import Image from "react-bootstrap/Image";
import img from "../../../../assets/img/committee-1.jpg";

class CommitteeAbout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentCommittee: [],
            pastCommittees: {
                head: [],
                body: [],
            },
            loading: true
        }
    }

    componentDidMount() {
        this.fetchCommitteeData();
    }

    fetchCommitteeData = async () => {
        try {
            const [currentResponse, pastResponse] = await Promise.all([
                axios.get("/api/committee/current"),
                axios.get("/api/committee/past")
            ]);
            
            this.setState({
                currentCommittee: currentResponse.data,
                pastCommittees: pastResponse.data,
                loading: false
            });
        } catch (error) {
            console.error('Error fetching committee data:', error);
            this.setState({ loading: false });
        }
    };

    groupCommitteeByRole = (committee) => {
        const grouped = {};
        committee.forEach(member => {
            if (!grouped[member.role]) {
                grouped[member.role] = [];
            }
            grouped[member.role].push(member);
        });
        return grouped;
    };

    renderCommitteeMember = (member, key) => {
        // Use role information from database if available, fall back to original role field
        const memberData = {
            role: member.role_name || member.role,
            name: member.person_name,
            social: member.person_email || member.email_alias || `${(member.role_slug || member.role.toLowerCase().replace(/\s+/g, '-'))}@cumc.org.uk`,
            // Use default images for now - could be enhanced later to use role-specific images
            profile: require(`../../../../assets/img/committee/gear.jpg`).default,
            cover: require(`../../../../assets/img/committee/gearCover.jpg`).default,
        };
        
        return (
            <Col key={key} md={3}>
                <UserCard person={memberData} />
            </Col>
        );
    };

    render() {
        const { currentCommittee, pastCommittees, loading } = this.state;

        if (loading) {
            return (
                <div className="content">
                    <Container>
                        <div className="text-center py-5">
                            <p>Loading committee information...</p>
                        </div>
                    </Container>
                </div>
            );
        }

        // Group committee members by role for display
        const groupedCommittee = this.groupCommitteeByRole(currentCommittee);

        return (
            <div className="content">
                <Container>
                    {/* Current Committee Display */}
                    <Row>
                        <Col md={12}>
                            <Card className="mb-4">
                                <Card.Body>
                                    <Card.Title>Current Committee</Card.Title>
                                    <Card.Subtitle className="mb-3">
                                        Meet the current CUMC committee members.
                                    </Card.Subtitle>
                                    <hr />
                                    
                                    {currentCommittee.length === 0 ? (
                                        <p className="text-center">No current committee members found.</p>
                                    ) : (
                                        <Row className="justify-content-md-center">
                                            {currentCommittee.map((member, index) => 
                                                this.renderCommitteeMember(member, index)
                                            )}
                                        </Row>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Past Committees */}
                    <Row>
                        <Col md={12}>
                            <Card>
                                <Card.Body>
                                    <Card.Title>Past Committees</Card.Title>
                                    <Card.Subtitle>
                                        Here you can find the committees of years past.
                                    </Card.Subtitle>
                                    <hr />
                                    <Table striped bordered hover>
                                        <div style={{fontSize: 9}}>{/*can't get responsive table to work inside card*/}
                                            <thead>
                                            <tr>
                                                {pastCommittees.head && pastCommittees.head.map((prop, key) => {
                                                    return <th key={key}>{prop}</th>;
                                                })}
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {pastCommittees.body && pastCommittees.body.map((prop, key) => {
                                                return (
                                                    <tr key={key}>
                                                        {prop.map((prop, key) => {
                                                            return <td key={key}>{prop}</td>;
                                                        })}
                                                    </tr>
                                                );
                                            })}
                                            </tbody>
                                        </div>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Row className="justify-content-center">
                        <Col md={12}>
                            <Card>
                                <Image src={img} fluid />
                                <Card.Footer className="text-center text-muted">The current committee members, at the 2024 Annual General Meeting</Card.Footer>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

export default CommitteeAbout;
