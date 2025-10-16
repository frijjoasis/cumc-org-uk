import React from 'react';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';

import { resources } from './text';

class ResourcesAbout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      content: false,
    };
  }

  render() {
    return (
      <div className="content">
        <Container>
          {/* <AboutCard title="Resources" text={resourcesAbout} /> */}
          <Card>
            <Card.Body>
              <Card.Title>Resources</Card.Title>
              <Card.Subtitle>
                All things skills, training & education!
              </Card.Subtitle>

              {/* <hr /> */}

              <Card.Text>
                <ul>
                  {resources.map((i, key) => {
                    var title;
                    if (i.link === '') {
                      title = <h4>{i.title}</h4>;
                    } else {
                      title = (
                        <h4>
                          {' '}
                          <a href={i.link}> {i.title} </a>{' '}
                        </h4>
                      );
                    }

                    return (
                      <li>
                        {title}
                        {i.content}
                      </li>
                    );
                  })}
                </ul>
              </Card.Text>
            </Card.Body>
          </Card>
        </Container>
      </div>
    );
  }
}

export default ResourcesAbout;
