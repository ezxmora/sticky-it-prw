import React, { Fragment, Component } from 'react';
import { Link } from 'react-router-dom';
import Axios from 'axios';
import TimeAgo from 'react-timeago';
import { toast } from 'react-toastify';
import _ from 'underscore';
import spanishStrings from 'react-timeago/lib/language-strings/es';
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';
const formatter = buildFormatter(spanishStrings);

export default class Reports extends Component {
    constructor() {
        super();

        this.state = {
            reports: [],
            error: false,
            reportPerPage: 10,
            tab: "0"
        }
    }

    componentWillMount() {
        this._loadReports();
    }

    _loadReports() {
        Axios.get(`/reports/?index=${Number(this.state.tab)}`)
            .then((res) => {
                const nextReports = res.data.reports.map(report => ({
                    _id: report._id,
                    resolved: report.resolved,
                    sentBy: report.sentBy,
                    reason: report.reason,
                    createdAt: report.createdAt,
                    reportedId: report.reportedId
                }));

                this.setState({
                    reports: [...nextReports],
                    totalReports: res.data.count
                });
            }).catch((err) => {
                toast.error(err.response.data.err);
            });
    }

    _handleClick(e) {
        this.setState({
            counter: e.target.id * 10,
            currentPage: Number(e.target.id)
        }, () => {
            this._loadReports();
        });
    }

    _handleReport(id) {
        Axios.put(`/report/${id}`)
            .then(() => {
                this._loadReports();
            })
    }

    _reportSolved(id) {
        Axios.put(`/report/update/${id}`, { resolved: true })
            .then(() => {
                this.setState({
                    reports: _.reject(this.state.reports, function (element) {
                        return element._id === id;
                    }), tab: "0"
                }, () => {
                    toast.info('Se ha resuelto el reporte');
                });
            })

        console.log(id);
    }

    _handleTabs(e) {
        this.setState({ tab: e.target.id });
    }

    render() {

        const { error, reports, totalReports, reportPerPage } = this.state;

        const pageNumbers = [];
        for (let i = 1; i <= Math.ceil(totalReports / reportPerPage); i++) {
            pageNumbers.push(i);
        }

        const renderPageNumbers = pageNumbers.map(n => {
            return (<li key={n - 1} id={n - 1} onClick={this._handleClick.bind(this)} > {n}</li >)
        });

        return (
            <div className="ReportList">
                {reports.map(report => (
                    <Fragment key={report._id}>
                        <div className="Report">
                            <h4>{report.reason}</h4>
                            <Link to={`/note/${report.reportedId}`}>Enlace a la nota</Link>
                            <div className="clear-both"></div>
                            <small><TimeAgo date={report.createdAt} formatter={formatter} /></small>
                            <i onClick={() => this._reportSolved(report._id)} className="fas fa-check-circle"></i>
                        </div>
                    </Fragment>
                ))}

                {error &&
                    <div style={{ color: '#900' }}>
                        {error}
                    </div>
                }
                <ul id="paginator">
                    {renderPageNumbers}
                </ul>
            </div>
        )
    }
}



