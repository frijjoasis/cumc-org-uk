import React from 'react';
import axios from 'axios';
import Form from 'react-bootstrap/Form';

interface PayPalButtonsProps {
  description: string;
  price: string;
  payer?: any;
  intent: 'membership' | 'register' | 'britrock';
  form?: any;
  onSuccess: () => void;
  onError: (error: string) => void;
}

interface PayPalButtonsState {
  paid: boolean;
  error: boolean | null;
}

class PayPalButtons extends React.Component<
  PayPalButtonsProps,
  PayPalButtonsState
> {
  paypalRef: React.RefObject<HTMLDivElement>;

  constructor(props: PayPalButtonsProps) {
    super(props);
    this.paypalRef = React.createRef();
    this.state = {
      paid: false,
      error: null,
    };
  }

  componentDidMount() {
    window.paypal
      .Buttons({
        style: {
          layout: 'horizontal',
        },
        createOrder: (data: any, actions: any) => {
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
              shipping_preference: 'NO_SHIPPING',
            },
            payer: this.props.payer,
          });
        },

        onApprove: async (data: any, actions: any) => {
          if (this.props.intent === 'membership') {
            return axios
              .post('/api/paypal/membership', { data: data })
              .then(res => {
                if (res.data.err) {
                  this.props.onError(res.data.err);
                  this.setState({ error: true });
                } else {
                  this.props.onSuccess();
                  this.setState({ paid: true });
                }
              });
          } else if (this.props.intent === 'register') {
            return axios
              .post('/api/paypal/register', {
                data: data,
                form: this.props.form,
              })
              .then(res => {
                if (res.data.err) {
                  this.props.onError(res.data.err);
                  this.setState({ error: true });
                } else {
                  this.props.onSuccess();
                  this.setState({ paid: true });
                }
              });
          } else if (this.props.intent === 'britrock') {
            return axios
              .post('/api/paypal/britrock', {
                data: data,
                form: this.props.form,
              })
              .then(res => {
                if (res.data.err) {
                  this.props.onError(res.data.err);
                  this.setState({ error: true });
                } else {
                  this.props.onSuccess();
                  this.setState({ paid: true });
                }
              });
          }
        },

        onError: (err: any) => {
          this.setState({ error: true });
          console.error(err);
        },
      })
      .render(this.paypalRef.current);
  }

  render() {
    if (this.state.paid) {
      return (
        <Form.Control
          type="text"
          className="text-success"
          readOnly
          value="Payment successful! Redirecting..."
        />
      );
    } else if (this.state.error) {
      return (
        <Form.Control
          type="text"
          className="text-danger"
          readOnly
          value="An error occurred in processing payment. Please try again."
        />
      );
    } else {
      return <div ref={this.paypalRef} />;
    }
  }
}

export default PayPalButtons;
