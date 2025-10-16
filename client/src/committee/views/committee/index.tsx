import React, { Component } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Alert,
  Nav,
  Badge,
} from 'react-bootstrap';
import axios from 'axios';

interface CommitteeMember {
  id: number;
  year: string;
  role: string;
  role_id: string;
  role_name?: string;
  role_description?: string;
  person_name: string;
  person_email: string;
  email_alias?: string;
  sort_order: number;
  is_current: boolean;
  status: string;
}

interface Role {
  id: number;
  role_name: string;
  description?: string;
  email_alias?: string;
  is_required?: boolean;
}

interface Alert {
  message: string;
  variant: string;
}

interface FormData {
  year: string;
  role: string;
  role_id: string;
  person_name: string;
  person_email: string;
  sort_order: number;
  is_current: boolean;
  status: string;
}

interface CommitteeManagerProps {}

interface CommitteeManagerState {
  currentCommittee: CommitteeMember[];
  stagedCommittee: CommitteeMember[];
  availableRoles: Role[];
  committeeStatus: any[];
  showModal: boolean;
  editingMember: CommitteeMember | null;
  activeTab: 'current' | 'staged';
  stagingYear: string;
  formData: FormData;
  alert: Alert | null;
  loading: boolean;
}

class CommitteeManager extends Component<
  CommitteeManagerProps,
  CommitteeManagerState
> {
  constructor(props: CommitteeManagerProps) {
    super(props);
    this.state = {
      currentCommittee: [],
      stagedCommittee: [],
      availableRoles: [],
      committeeStatus: [],
      showModal: false,
      editingMember: null,
      activeTab: 'current', // 'current' or 'staged'
      stagingYear: '',
      formData: {
        year: '2024-2025',
        role: '',
        role_id: '',
        person_name: '',
        person_email: '',
        sort_order: 0,
        is_current: true,
        status: 'current',
      },
      alert: null,
      loading: false,
    };
  }

  componentDidMount() {
    this.fetchAllData();
  }

  fetchAllData = async () => {
    await Promise.all([
      this.fetchCurrentCommittee(),
      this.fetchStagedCommittee(),
      this.fetchAvailableRoles(),
      this.fetchCommitteeStatus(),
    ]);
  };

  fetchCurrentCommittee = async () => {
    try {
      const response = await axios.get('/api/committee/current');
      this.setState({ currentCommittee: response.data });
    } catch (error) {
      console.error('Error fetching committee:', error);
      this.showAlert('Error fetching committee data', 'danger');
    }
  };

  fetchStagedCommittee = async () => {
    try {
      const response = await axios.get('/api/committee/staged');
      this.setState({ stagedCommittee: response.data });
    } catch (error) {
      console.error('Error fetching staged committee:', error);
      this.showAlert('Error fetching staged committee data', 'danger');
    }
  };

  fetchAvailableRoles = async () => {
    try {
      const response = await axios.get('/api/committee/roles/active');
      this.setState({ availableRoles: response.data });
    } catch (error) {
      console.error('Error fetching available roles:', error);
      this.showAlert('Error fetching available roles', 'danger');
    }
  };

  fetchCommitteeStatus = async () => {
    try {
      const response = await axios.get('/api/committee/status');
      this.setState({ committeeStatus: response.data });
    } catch (error) {
      console.error('Error fetching committee status:', error);
      // Don't show error for this as it's not critical
    }
  };

  showAlert = (message: string, variant: string = 'info') => {
    this.setState({ alert: { message, variant } });
    setTimeout(() => this.setState({ alert: null }), 5000);
  };

  handleShowModal = (member: CommitteeMember | null = null) => {
    if (member) {
      this.setState({
        editingMember: member,
        formData: { ...member },
        showModal: true,
      });
    } else {
      this.setState({
        editingMember: null,
        formData: {
          year:
            this.state.activeTab === 'staged'
              ? this.state.stagingYear
              : '2024-2025',
          role: '',
          role_id: '',
          person_name: '',
          person_email: '',
          sort_order: 0,
          is_current: this.state.activeTab !== 'staged',
          status: this.state.activeTab === 'staged' ? 'staged' : 'current',
        },
        showModal: true,
      });
    }
  };

  handleCloseModal = () => {
    this.setState({ showModal: false, editingMember: null });
  };

  handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target as
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement;

    // Handle role selection - update both role_id and role name for compatibility
    if (name === 'role_id') {
      const selectedRole = this.state.availableRoles.find(
        role => role.id.toString() === value
      );
      this.setState({
        formData: {
          ...this.state.formData,
          role_id: value,
          role: selectedRole ? selectedRole.role_name : '',
          person_email:
            selectedRole && selectedRole.email_alias
              ? selectedRole.email_alias
              : this.state.formData.person_email,
        },
      });
      return;
    }

    this.setState({
      formData: {
        ...this.state.formData,
        [name]:
          type === 'checkbox' && e.target instanceof HTMLInputElement
            ? e.target.checked
            : value,
      },
    });
  };

  handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    this.setState({ loading: true });

    try {
      if (this.state.editingMember) {
        await axios.put(
          `/api/committee/members/${this.state.editingMember.id}`,
          this.state.formData
        );
        this.showAlert('Committee member updated successfully', 'success');
      } else {
        await axios.post('/api/committee/members', this.state.formData);
        this.showAlert('Committee member added successfully', 'success');
      }

      this.handleCloseModal();
      this.fetchAllData();
    } catch (error) {
      console.error('Error saving committee member:', error);
      this.showAlert('Error saving committee member', 'danger');
    } finally {
      this.setState({ loading: false });
    }
  };

  handleDelete = async (id: number) => {
    if (
      !window.confirm('Are you sure you want to delete this committee member?')
    ) {
      return;
    }

    try {
      await axios.delete(`/api/committee/members/${id}`);
      this.showAlert('Committee member deleted successfully', 'success');
      this.fetchAllData();
    } catch (error) {
      console.error('Error deleting committee member:', error);
      this.showAlert('Error deleting committee member', 'danger');
    }
  };

  handleStartStaging = async () => {
    const year = window.prompt(
      'Enter the year for the new committee (e.g., 2025-2026):'
    );
    if (!year) return;

    try {
      const response = await axios.post('/api/committee/start-staging', {
        year,
      });
      this.setState({ stagingYear: year, activeTab: 'staged' });
      this.showAlert(`Started staging committee for ${year}`, 'success');
      this.fetchAllData();
    } catch (error) {
      console.error('Error starting committee staging:', error);
      const message =
        error.response?.data?.error || 'Error starting committee staging';
      this.showAlert(message, 'danger');
    }
  };

  handleClearStaged = async () => {
    if (
      !window.confirm(
        'Are you sure you want to clear the staged committee? This will delete all staged committee members.'
      )
    ) {
      return;
    }

    try {
      await axios.post('/api/committee/clear-staged');
      this.showAlert('Staged committee cleared successfully', 'success');
      this.setState({ stagingYear: '', activeTab: 'current' });
      this.fetchAllData();
    } catch (error) {
      console.error('Error clearing staged committee:', error);
      const message =
        error.response?.data?.error || 'Error clearing staged committee';
      this.showAlert(message, 'danger');
    }
  };

  handleTransitionYear = async () => {
    const hasStagedCommittee = this.state.stagedCommittee.length > 0;

    if (!hasStagedCommittee) {
      this.showAlert(
        'No staged committee found. Please prepare the next committee before transitioning.',
        'warning'
      );
      return;
    }

    if (
      !window.confirm(
        'Are you sure you want to transition to the new committee year? This will:\n- Archive the current committee\n- Promote the staged committee to current\n\nThis action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      await axios.post('/api/committee/transition-year');
      this.showAlert(
        'Committee year transitioned successfully! Staged committee is now current.',
        'success'
      );
      this.setState({ activeTab: 'current', stagingYear: '' });
      this.fetchAllData();
    } catch (error) {
      console.error('Error transitioning committee year:', error);
      const message =
        error.response?.data?.error || 'Error transitioning committee year';
      this.showAlert(message, 'danger');
    }
  };

  render() {
    const {
      currentCommittee,
      stagedCommittee,
      showModal,
      formData,
      alert,
      loading,
      activeTab,
      stagingYear,
    } = this.state;

    const activeCommittee =
      activeTab === 'current' ? currentCommittee : stagedCommittee;
    const hasStaged = stagedCommittee.length > 0;

    return (
      <div className="content">
        <Container>
          {alert && (
            <Alert
              variant={alert.variant}
              dismissible
              onClose={() => this.setState({ alert: null })}
            >
              {alert.message}
            </Alert>
          )}

          <Row>
            <Col md={12}>
              <Card>
                <Card.Header>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4>Committee Management</h4>
                    <div>
                      {!hasStaged && (
                        <Button
                          variant="info"
                          onClick={this.handleStartStaging}
                          className="me-2"
                        >
                          Start Staging Next Year
                        </Button>
                      )}
                      {hasStaged && (
                        <>
                          <Button
                            variant="outline-secondary"
                            onClick={this.handleClearStaged}
                            className="me-2"
                          >
                            Clear Staged
                          </Button>
                          <Button
                            variant="success"
                            onClick={this.handleTransitionYear}
                            className="me-2"
                          >
                            Transition to New Year
                          </Button>
                        </>
                      )}
                      <Button
                        variant="primary"
                        onClick={() => this.handleShowModal()}
                      >
                        Add Member
                      </Button>
                    </div>
                  </div>

                  {/* Tabs for Current vs Staged */}
                  <Nav
                    variant="tabs"
                    activeKey={activeTab}
                    onSelect={k =>
                      this.setState({ activeTab: k as 'current' | 'staged' })
                    }
                  >
                    <Nav.Item>
                      <Nav.Link eventKey="current">
                        Current Committee
                        <Badge bg="primary" className="ms-2">
                          {currentCommittee.length}
                        </Badge>
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="staged" disabled={!hasStaged}>
                        Staged Committee {stagingYear && `(${stagingYear})`}
                        <Badge
                          bg={hasStaged ? 'warning' : 'secondary'}
                          className="ms-2"
                        >
                          {stagedCommittee.length}
                        </Badge>
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>
                </Card.Header>
                <Card.Body>
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Role</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Year</th>
                        <th>Sort Order</th>
                        <th>Current</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeCommittee.map(member => (
                        <tr key={member.id}>
                          <td>
                            {member.role_name || member.role}
                            {member.role_description && (
                              <div className="text-muted small">
                                {member.role_description}
                              </div>
                            )}
                          </td>
                          <td>{member.person_name}</td>
                          <td>
                            {member.person_email || member.email_alias || 'N/A'}
                          </td>
                          <td>{member.year}</td>
                          <td>{member.sort_order}</td>
                          <td>{member.is_current ? 'Yes' : 'No'}</td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => this.handleShowModal(member)}
                              className="me-2"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => this.handleDelete(member.id)}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  {activeCommittee.length === 0 && (
                    <div className="text-center py-4">
                      <p>
                        {activeTab === 'current'
                          ? 'No current committee members found. Add some members to get started!'
                          : 'No staged committee members yet. Start adding members for the next committee year!'}
                      </p>
                    </div>
                  )}

                  {activeTab === 'staged' && hasStaged && (
                    <div className="alert alert-info mt-3">
                      <strong>Staging Mode:</strong> You are preparing the
                      committee for {stagingYear}. These members will become the
                      current committee when you click "Transition to New Year".
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Modal show={showModal} onHide={this.handleCloseModal} size="lg">
            <Modal.Header closeButton>
              <Modal.Title>
                {this.state.editingMember
                  ? 'Edit Committee Member'
                  : 'Add Committee Member'}
              </Modal.Title>
            </Modal.Header>
            <Form onSubmit={this.handleSubmit}>
              <Modal.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Year</Form.Label>
                      <Form.Control
                        type="text"
                        name="year"
                        value={formData.year}
                        onChange={this.handleInputChange}
                        placeholder="e.g., 2024-2025"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Role</Form.Label>
                      <Form.Select
                        name="role_id"
                        value={formData.role_id}
                        onChange={this.handleInputChange}
                        required
                      >
                        <option value="">Select a role...</option>
                        {this.state.availableRoles.map(role => (
                          <option key={role.id} value={role.id}>
                            {role.role_name}
                            {role.is_required && ' (Required)'}
                          </option>
                        ))}
                      </Form.Select>
                      {formData.role_id && (
                        <Form.Text className="text-muted">
                          {(() => {
                            const selectedRole = this.state.availableRoles.find(
                              r => r.id.toString() === formData.role_id
                            );
                            return selectedRole?.description || '';
                          })()}
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="person_name"
                        value={formData.person_name}
                        onChange={this.handleInputChange}
                        placeholder="Full name"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="person_email"
                        value={formData.person_email}
                        onChange={this.handleInputChange}
                        placeholder="email@cumc.org.uk"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Sort Order</Form.Label>
                      <Form.Control
                        type="number"
                        name="sort_order"
                        value={formData.sort_order}
                        onChange={this.handleInputChange}
                        min="0"
                      />
                      <Form.Text className="text-muted">
                        Lower numbers appear first in listings
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        name="is_current"
                        checked={formData.is_current}
                        onChange={this.handleInputChange}
                        label="Current committee member"
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
                  {loading
                    ? 'Saving...'
                    : this.state.editingMember
                      ? 'Update'
                      : 'Add'}
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>
        </Container>
      </div>
    );
  }
}

export default CommitteeManager;
