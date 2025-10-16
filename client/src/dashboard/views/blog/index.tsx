import React from 'react';
import axios from 'axios';

class Blog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      content: false,
    };
  }

  componentDidMount() {
    axios.get('/api/index').then(res => {
      this.setState({
        content: res.data,
      });
    });
  }

  render() {
    return `blog`;
  }
}

export default Blog;
