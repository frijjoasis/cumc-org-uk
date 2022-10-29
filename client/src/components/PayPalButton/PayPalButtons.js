import React from "react";
import axios from "axios";
import Form from "react-bootstrap/Form";

class PayPalButtons extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showButton: false,
            paid: false,
            ref: React.createRef(),
            error: null
        }
    }

    componentDidMount() {
        window.paypal.Buttons({
            style: {
                layout: 'horizontal'
            },
            createOrder: (data, actions) => {
                return actions.order.create({
                    purchase_units: [
                        {
                            description: this.props.description,
                            amount: {
                                value: this.props.price,
                            },
                        },
                    ],
                    application_context: {
                        shipping_preference: 'NO_SHIPPING'
                    },
                    payer: this.props.payer
                });
            },

            onApprove: async (data, actions) => {
                if (this.props.intent === 'membership') {
                    return axios.post('/api/paypal/membership', {data: data}).then(res => {
                        // Verify and capture payment
                        if (res.data.err) {
                            this.props.onError(res.data.err);
                            this.setState({error: true})
                        } else {
                            this.props.onSuccess();
                            this.setState({paid: true});
                        }
                    });
                } else if (this.props.intent === 'register') {
                    return axios.post('/api/paypal/register', {data: data, form: this.props.form}).then(res => {
                        // Verify and authorise
                        // You have no idea how many bugs I spent hours fixing because authorize <=> authorise
                        if (res.data.err) {
                            this.props.onError(res.data.err);
                            this.setState({error: true})
                        } else {
                            this.props.onSuccess();
                            this.setState({paid: true});
                        }
                    });
                } else if (this.props.intent === 'britrock') {
                    return axios.post('/api/paypal/britrock', {data: data, form: this.props.form}).then(res => {
                        if (res.data.err) {
                            this.props.onError(res.data.err);
                            this.setState({error: true})
                        } else {
                            this.props.onSuccess();
                            this.setState({paid: true});
                        }
                    });
                }
            },

            onError: (err) => {
                this.setState({error: true});
                console.error(err);
            },
        }).render(this.state.ref.current);
    }

    render() {
        if (this.state.paid) {
            return (
                <Form.Control type="text"
                              className="text-success"
                              readOnly
                              value="Payment successful! Redirecting..."
                />
            )
        } else if (this.state.error) {
            return (
                <Form.Control type="text"
                              className="text-danger"
                              readOnly
                              value="An error occurred in processing payment. Please try again."
                />
            )
        } else return <div ref={this.state.ref} />
    }
}

export default PayPalButtons;