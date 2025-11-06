import React from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { NavLink } from 'react-router-dom';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';

interface AboutCardProps {
  title: string;
  text: string | JSX.Element[];
  button?: {
    type?: 'button' | string; // You can use string for type
    to: string;
    text: string;
  };
}

export class AboutCard extends React.Component<AboutCardProps> {
  render() {
    return (
      <Row>
        <Col>
          <Card className="py-0">
            <CardContent>
              <h2>{this.props.title}</h2>
              <span>
                <hr />
                {this.props.text}
              </span>
            </CardContent>
            {this.props.button ? (
              <CardFooter className="flex justify-end gap-2 bg-muted p-2 rounded-b-xl border-t border-accent">
                {this.props.button.type === 'button' ? (
                  <Link to={this.props.button.to}>
                    <Button className="float-right" variant="outline">
                      {this.props.button.text}
                    </Button>
                  </Link>
                ) : (
                  <NavLink
                    className="float-right btn btn-primary"
                    to={this.props.button.to}
                  >
                    {this.props.button.text}
                  </NavLink>
                )}
              </CardFooter>
            ) : null}
          </Card>
        </Col>
      </Row>
    );
  }
}

export default AboutCard;
