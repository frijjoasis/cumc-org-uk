import React from 'react';
import axios from "axios";

class Register extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: false
        }
    }

    componentDidMount() {
        axios.get("/api/auth/register").then(res => {
            this.setState({
                content: res.data
            })
        });
    }

    render() {
        return (
            `registration form`
        )
    }
}

export default Register;