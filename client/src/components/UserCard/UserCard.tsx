import { CommitteePersonData } from '@/types/committee';
import { User } from '@/types/models';
import React from 'react';
import { Card, CardContent } from '../ui/card';
import { CardFooter } from 'react-bootstrap';

interface UserCardProps {
  person: CommitteePersonData;
}

export class UserCard extends React.Component<UserCardProps> {
  render() {
    return (
      <Card className="card-user">
        <div className="h-30">
          <img src={this.props.person.cover} alt="Cover" />
        </div>
        <CardContent>
          <div className="author">
            <img
              className="avatar border-gray"
              src={this.props.person.profile}
              alt="Profile"
            />
            <h6>{this.props.person.role}</h6>
            <h4 className="title">{this.props.person.name}</h4>
          </div>
        </CardContent>
        <CardFooter className="text-muted text-center">
          <h6>{this.props.person.social}</h6>
        </CardFooter>
      </Card>
    );
  }
}

export default UserCard;
