import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import axios from 'axios';

interface MembershipChangerProps {
  callback: (error: any, success: any) => void;
  id: string;
  default: boolean;
}
interface MembershipChangerState {}

class MembershipChanger extends React.Component<
  MembershipChangerProps,
  MembershipChangerState
> {
  constructor(props: MembershipChangerProps) {
    super(props);
    this.state = {
      default: true,
      callback: null,
    };
  }

  handleChange() {
    axios
      .post('/api/member/update', {
        id: this.props.id,
        status: !this.props.default,
      })
      .then(res => {
        if (res.data.err) {
          this.props.callback(res.data.err, null);
        } else {
          this.props.callback(null, 'Successfully updated membership status');
        }
      });
  }

  render() {
    return (
      <Dropdown>
        <Dropdown.Toggle id="membership-status">
          {this.props.default ? (
            <div className="text-success" style={{ display: 'inline-flex' }}>
              Yes
            </div>
          ) : (
            <div className="text-danger" style={{ display: 'inline-flex' }}>
              No
            </div>
          )}
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item onClick={this.handleChange.bind(this)}>
            {!this.props.default ? (
              <div className="text-success" style={{ display: 'inline-flex' }}>
                Yes
              </div>
            ) : (
              <div className="text-danger" style={{ display: 'inline-flex' }}>
                No
              </div>
            )}
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

export default MembershipChanger;
