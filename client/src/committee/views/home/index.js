import React from 'react';
import axios from "axios";

class CommitteeHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: {}
        }
    }

    componentDidMount() {
        axios.get("/api/gear/list").then(res => {
            this.setState({
                content: res.data
            })
        })
    }

    render() {
        return (
            <div className="content">
                <p>committee home</p>
            </div>
        )
    }
}

export default CommitteeHome;