import React, { Component } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import axios from 'axios';

class RolesManager extends Component {
    constructor(props) {
        super(props);
        this.state = {
            roles: [],
            rolesStatus: [],
            showModal: false,
            editingRole: null,
            formData: {
                role_name: '',
                role_slug: '',
                description: '',
                email_alias: '',
                is_required: false,
                max_positions: 1,
                sort_order: 0,
                is_active: true
            },
            alert: null,
            loading: false
        };
    }

    componentDidMount() {
        this.fetchRoles();
        this.fetchRolesStatus();
    }

    fetchRoles = async () => {
        try {
            const response = await axios.get('/api/committee/roles');
            this.setState({ roles: response.data });
        } catch (error) {
            console.error('Error fetching roles:', error);
            this.showAlert('Error fetching roles data', 'danger');
        }
    };

    fetchRolesStatus = async () => {
        try {
            const response = await axios.get('/api/committee/roles/status');
            this.setState({ rolesStatus: response.data });
        } catch (error) {
            console.error('Error fetching roles status:', error);
            this.showAlert('Error fetching roles status', 'danger');
        }
    };

    showAlert = (message, variant = 'info') => {
        this.setState({ alert: { message, variant } });
        setTimeout(() => this.setState({ alert: null }), 5000);
    };

    handleShowModal = (role = null) => {
        if (role) {
            this.setState({
                editingRole: role,
                formData: { ...role },
                showModal: true
            });
        } else {
            this.setState({
                editingRole: null,
                formData: {
                    role_name: '',
                    role_slug: '',
                    description: '',
                    email_alias: '',
                    is_required: false,
                    max_positions: 1,
                    sort_order: 0,
                    is_active: true
                },
                showModal: true
            });
        }
    };

    handleCloseModal = () => {
        this.setState({ showModal: false, editingRole: null });
    };

    handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        let processedValue = value;
        
        // Auto-generate slug from role name
        if (name === 'role_name') {
            const slug = value.toLowerCase()
                .replace(/[^a-z0-9\s]/g, '')
                .replace(/\s+/g, '-')
                .trim();
            this.setState({
                formData: {
                    ...this.state.formData,
                    role_name: value,
                    role_slug: slug
                }
            });
            return;
        }
        
        // Convert numeric fields
        if (name === 'max_positions' || name === 'sort_order') {
            processedValue = parseInt(value) || 0;
        }
        
        this.setState({
            formData: {
                ...this.state.formData,
                [name]: type === 'checkbox' ? checked : processedValue
            }
        });
    };

    handleSubmit = async (e) => {
        e.preventDefault();
        this.setState({ loading: true });

        try {
            if (this.state.editingRole) {
                await axios.put(`/api/committee/roles/${this.state.editingRole.id}`, this.state.formData);
                this.showAlert('Role updated successfully', 'success');
            } else {
                await axios.post('/api/committee/roles', this.state.formData);
                this.showAlert('Role created successfully', 'success');
            }
            
            this.handleCloseModal();
            this.fetchRoles();
            this.fetchRolesStatus();
        } catch (error) {
            console.error('Error saving role:', error);
            const message = error.response?.data?.error || 'Error saving role';
            this.showAlert(message, 'danger');
        } finally {
            this.setState({ loading: false });
        }
    };

    handleDeactivate = async (id) => {
        if (!window.confirm('Are you sure you want to deactivate this role? This will hide it from future use but preserve historical data.')) {
            return;
        }

        try {
            await axios.delete(`/api/committee/roles/${id}`);
            this.showAlert('Role deactivated successfully', 'success');
            this.fetchRoles();
            this.fetchRolesStatus();
        } catch (error) {
            console.error('Error deactivating role:', error);
            const message = error.response?.data?.error || 'Error deactivating role';
            this.showAlert(message, 'danger');
        }
    };

    getRoleStatusBadge = (role) => {
        const statusRole = this.state.rolesStatus.find(sr => sr.id === role.id);
        if (!statusRole) return null;

        const badges = [];
        
        if (role.is_required && statusRole.needs_filling) {
            badges.push(<Badge key="needs-filling" bg="danger" className="me-1">Needs Filling</Badge>);
        }
        
        if (statusRole.is_full) {
            badges.push(<Badge key="full" bg="success" className="me-1">Full</Badge>);
        }
        
        if (role.is_required) {
            badges.push(<Badge key="required" bg="primary" className="me-1">Required</Badge>);
        }

        if (!role.is_active) {
            badges.push(<Badge key="inactive" bg="secondary" className="me-1">Inactive</Badge>);
        }

        return badges;
    };

    render() {
        const { roles, showModal, formData, alert, loading } = this.state;

        return (
            <div className="content">
                <Container>
                    {alert && (
                        <Alert variant={alert.variant} dismissible onClose={() => this.setState({ alert: null })}>
                            {alert.message}
                        </Alert>
                    )}
                    
                    <Row>
                        <Col md={12}>
                            <Card>
                                <Card.Header>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h4>Committee Roles Management</h4>
                                        <Button 
                                            variant="primary" 
                                            onClick={() => this.handleShowModal()}
                                        >
                                            Add New Role
                                        </Button>
                                    </div>
                                </Card.Header>
                                <Card.Body>
                                    <Table striped bordered hover responsive>
                                        <thead>
                                            <tr>
                                                <th>Role Name</th>
                                                <th>Email Alias</th>
                                                <th>Status</th>
                                                <th>Members</th>
                                                <th>Max Positions</th>
                                                <th>Sort Order</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {roles.map((role) => {
                                                const statusRole = this.state.rolesStatus.find(sr => sr.id === role.id);
                                                return (
                                                    <tr key={role.id} className={!role.is_active ? 'table-secondary' : ''}>
                                                        <td>
                                                            <strong>{role.role_name}</strong>
                                                            {role.description && (
                                                                <div className="text-muted small">
                                                                    {role.description}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td>{role.email_alias || 'N/A'}</td>
                                                        <td>{this.getRoleStatusBadge(role)}</td>
                                                        <td>{statusRole ? statusRole.current_members : 0}</td>
                                                        <td>{role.max_positions}</td>
                                                        <td>{role.sort_order}</td>
                                                        <td>
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                onClick={() => this.handleShowModal(role)}
                                                                className="me-2"
                                                            >
                                                                Edit
                                                            </Button>
                                                            {role.is_active && (
                                                                <Button
                                                                    variant="outline-danger"
                                                                    size="sm"
                                                                    onClick={() => this.handleDeactivate(role.id)}
                                                                >
                                                                    Deactivate
                                                                </Button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </Table>
                                    
                                    {roles.length === 0 && (
                                        <div className="text-center py-4">
                                            <p>No committee roles found. Add some roles to get started!</p>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Modal show={showModal} onHide={this.handleCloseModal} size="lg">
                        <Modal.Header closeButton>
                            <Modal.Title>
                                {this.state.editingRole ? 'Edit Committee Role' : 'Add Committee Role'}
                            </Modal.Title>
                        </Modal.Header>
                        <Form onSubmit={this.handleSubmit}>
                            <Modal.Body>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Role Name *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="role_name"
                                                value={formData.role_name}
                                                onChange={this.handleInputChange}
                                                placeholder="e.g., President, Secretary"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Role Slug</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="role_slug"
                                                value={formData.role_slug}
                                                onChange={this.handleInputChange}
                                                placeholder="e.g., president, secretary"
                                            />
                                            <Form.Text className="text-muted">
                                                Auto-generated from role name. Used for URLs and internal references.
                                            </Form.Text>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="description"
                                        value={formData.description}
                                        onChange={this.handleInputChange}
                                        placeholder="Brief description of the role responsibilities"
                                    />
                                </Form.Group>
                                
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Email Alias</Form.Label>
                                            <Form.Control
                                                type="email"
                                                name="email_alias"
                                                value={formData.email_alias}
                                                onChange={this.handleInputChange}
                                                placeholder="e.g., president@cumc.org.uk"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Max Positions</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="max_positions"
                                                value={formData.max_positions}
                                                onChange={this.handleInputChange}
                                                min="1"
                                                max="10"
                                            />
                                            <Form.Text className="text-muted">
                                                How many people can hold this role
                                            </Form.Text>
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Sort Order</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="sort_order"
                                                value={formData.sort_order}
                                                onChange={this.handleInputChange}
                                                min="0"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Check
                                                type="checkbox"
                                                name="is_required"
                                                checked={formData.is_required}
                                                onChange={this.handleInputChange}
                                                label="Required role (must be filled each year)"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Check
                                                type="checkbox"
                                                name="is_active"
                                                checked={formData.is_active}
                                                onChange={this.handleInputChange}
                                                label="Active role"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={this.handleCloseModal}>
                                    Cancel
                                </Button>
                                <Button variant="primary" type="submit" disabled={loading}>
                                    {loading ? 'Saving...' : (this.state.editingRole ? 'Update Role' : 'Create Role')}
                                </Button>
                            </Modal.Footer>
                        </Form>
                    </Modal>
                </Container>
            </div>
        );
    }
}

export default RolesManager;