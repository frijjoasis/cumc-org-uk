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
                    intent: this.props.intent,
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
                if (this.props.intent === 'CAPTURE') {
                    return actions.order.capture().then(details => {
                        this.setState({
                            paid: true
                        });
                        axios.post('/api/paypal/membership', {data: data, details: details}).then(res => {
                            if (res.data.err) this.props.onError(res.data.err);
                            else this.props.onSuccess();
                        });
                    });
                } else if (this.props.intent === 'AUTHORISE') {

                }
            },

            onError: (err) => {
                this.setState({
                    error: true
                });
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
            this.props.onError('An error occurred in processing payment. Please try again.')
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