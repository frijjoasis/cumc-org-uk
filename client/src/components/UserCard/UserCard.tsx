import { CommitteePersonData } from '@/types/committee';
import { User } from '@/types/models';
import React from 'react';
import Card from 'react-bootstrap/Card';

interface UserCardProps {
  person: CommitteePersonData;
}

export class UserCard extends React.Component<UserCardProps> {
  render() {
    return (
      <Card className="card-user">
        <div className="image">
          <img src={this.props.person.cover} alt="Cover" />
        </div>
        <Card.Body>
          <div className="author">
            <img
              className="avatar border-gray"
              src={this.props.person.profile}
              alt="Profile"
            />
            <h6>{this.props.person.role}</h6>
            <h4 className="title">{this.props.person.name}</h4>
          </div>
        </Card.Body>
        <Card.Footer className="text-muted text-center">
          <h6>{this.props.person.social}</h6>
        </Card.Footer>
      </Card>
    );
  }
}

export default UserCard;
