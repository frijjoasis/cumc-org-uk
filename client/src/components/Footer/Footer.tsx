import React from 'react';
import Container from 'react-bootstrap/Container';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import axios from 'axios';

interface FooterState {
  link: string;
}

class Footer extends React.Component<{}, FooterState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      link: 'https://www.cumc.org.uk/login',
    };
  }

  componentDidMount() {
    axios.get<string>('/api/about/whatsapp').then(res => {
      this.setState({
        link: res.data,
      });
    });
  }

  render() {
    return (
      <footer className="footer">
        <Container fluid style={{ display: 'flex', justifyContent: 'center' }}>
          <nav>
            <ul>
              <li>
                <a href="https://www.facebook.com/cumcofficial/">
                  <i className="fa fa-facebook-square" />
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/cumcofficial">
                  <i className="fa fa-instagram" />
                </a>
              </li>
              <li>
                <a href={this.state.link}>
                  <i className="fa fa-whatsapp" />
                </a>
              </li>
              <li>
                <OverlayTrigger
                  placement="right"
                  overlay={
                    <Tooltip id="button-tooltip-2">Made by Edmund</Tooltip>
                  }
                >
                  <a href="https://github.com/frijjoasis/cumc-org-uk">
                    <i className="fa fa-github" />
                  </a>
                </OverlayTrigger>
              </li>
            </ul>
          </nav>
        </Container>
      </footer>
    );
  }
}

export default Footer;
