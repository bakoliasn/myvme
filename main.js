var React = require('react');
var ReactDOM = require('react-dom');
var request = require('superagent');
import { Router, Route, IndexRoute, RouteHandler, Link } from 'react-router';
import { createHistory } from 'history';


var App = React.createClass({
  getInitialState() {
    return {
      tasks:[],
      todo:[],
      hours:[],
      NetExpense: [],
      externalDocs: [],
      notes:[],
      projects: []
    }
  },
  render() {
    return (
      <div>
        {this.props.children}
      </div>
    )
  }
});

var routes = (
  <Router history={createHistory()}>
    <Route path="/" component={App}>
      <IndexRoute component={Login} />
      <Route path="signup" component={Signup}/>
      <Route path="projects" component={HeaderMenu}/>
      <Route path="projects/" component={HeaderMenu}/>
      <Route path="projects/:id" component={ProjectPage}>
        <IndexRoute component={OverViewSetup}/>
        <Route path="expenses" component={ExpensePage}/>
        <Route path="notes" component={NotesPage}/>
        <Route path="hours" component={HoursPage}/>
        <Route path="externaldocs" component={ExternalDocs}/>
      </Route>
    </Route>
  </Router>
)
ReactDOM.render(routes, document.querySelector('#main'))
