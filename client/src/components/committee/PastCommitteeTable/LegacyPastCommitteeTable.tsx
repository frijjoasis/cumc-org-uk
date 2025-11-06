import React from 'react';
import { Committee, Member, User } from '@/types/models';
import { Component } from 'react';
import axios from 'axios';
import { Table } from '@/components/ui/table';

interface Props {}
interface State {
  pastCommittees: {
    year: string;
    committee: Committee[];
  }[];
  loading: boolean;
}

class LegacyPastCommitteeTable extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      pastCommittees: [],
      loading: true,
    };
  }

  componentDidMount() {
    this.fetchCommitteeData();
  }

  fetchCommitteeData = async () => {
    try {
      const [pastResponse] = await Promise.all([
        axios.get('/api/committee/past'),
      ]);

      this.setState({
        pastCommittees: pastResponse.data,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching committee data:', error);
      this.setState({ loading: false });
    }
  };

  render() {
    return (
      <Table>
        <div style={{ fontSize: 9 }}>
          {/*can't get responsive table to work inside card*/}
          <thead>
            <tr>
              {pastCommittees.head &&
                pastCommittees.head.map((prop, key) => {
                  return <th key={key}>{prop}</th>;
                })}
            </tr>
          </thead>
          <tbody>
            {pastCommittees.body &&
              pastCommittees.body.map((prop, key) => {
                return (
                  <tr key={key}>
                    {prop.map((prop, key) => {
                      return <td key={key}>{prop}</td>;
                    })}
                  </tr>
                );
              })}
          </tbody>
        </div>
      </Table>
    );
  }
}
