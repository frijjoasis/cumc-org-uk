import React, { Component } from 'react';
import { Alert, Button, Card, Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';

class DevLogin extends Component {
    constructor(props) {
        super(props);
        this.state = {
            devMode: false,
            authenticated: false,
            user: null,
            message: null,
            loading: false
        };
    }

    componentDidMount() {
        this.checkDevStatus();
    }

    checkDevStatus = async () => {
        try {
            const response = await axios.get('/api/auth/dev-status');
            this.setState({
                devMode: response.data.devMode,
                authenticated: response.data.authenticated,
                user: response.data.user,
                adminBypass: response.data.adminBypass
            });
        } catch (error) {
            // Dev mode not available or not enabled
            this.setState({ devMode: false });
        }
    };

    handleDevLogin = async () => {
        this.setState({ loading: true });
        try {
            const response = await axios.get('/api/auth/dev-login');
            this.setState({
                authenticated: true,
                user: response.data.user,
                message: { type: 'success', text: response.data.message },
                loading: false
            });
            
            // Refresh the page to update navigation
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error) {
            this.setState({
                message: { 
                    type: 'danger', 
                    text: error.response?.data?.err || 'Failed to login' 
                },
                loading: false
            });
        }
    };

    render() {
        const { devMode, authenticated, user, message, loading, adminBypass } = this.state;

        // Only show in development mode
        if (!devMode || !adminBypass) {
            return null;
        }

        return (
            <Container className="mt-4">
                <Row className="justify-content-center">
                    <Col md={6}>
                        <Card border="warning">
                            <Card.Header className="bg-warning text-dark">
                                <h5 className="mb-0">🚧 Development Mode</h5>
                            </Card.Header>
                            <Card.Body>
                                {message && (
                                    <Alert variant={message.type} dismissible 
                                           onClose={() => this.setState({ message: null })}>
                                        {message.text}
                                    </Alert>
                                )}
                                
                                {!authenticated ? (
                                    <>
                                        <p>
                                            You are in development mode. You can bypass authentication 
                                            to access admin features without Google login.
                                        </p>
                                        <Button 
                                            variant="warning" 
                                            onClick={this.handleDevLogin}
                                            disabled={loading}
                                        >
                                            {loading ? 'Logging in...' : '🔓 Login as Dev Admin'}
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Alert variant="success">
                                            ✅ Logged in as development admin
                                        </Alert>
                                        <p><strong>User:</strong> {user?.name}</p>
                                        <p><strong>Email:</strong> {user?.email}</p>
                                        <p>
                                            You now have full admin access to committee management features.
                                        </p>
                                        <Button 
                                            variant="primary" 
                                            href="/committee"
                                        >
                                            Go to Committee Dashboard
                                        </Button>
                                    </>
                                )}
                                
                                <hr />
                                <small className="text-muted">
                                    <strong>Note:</strong> This bypass only works in development mode 
                                    and will not be available in production.
                                </small>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default DevLogin;