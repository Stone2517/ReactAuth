import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';
import firebase from 'firebase'

const Home = () => <h1>Welcome Back</h1>

export default class App extends Component {
  constructor() {
    super()
    this.state = {
      authed: false,
      loading: true,
      error: null
    }
    this.setLoading = this.setLoading.bind(this)
    this.setError = this.setError.bind(this)
  }

  componentDidMount() {
    this.removeListener = firebase.auth().onAuthStateChanged((user) => {
      this.setState({
        authed: user !== null,
        loading: false
      })
    })
  }

  componentWillUnmount() {
    this.removeListener()
  }

  setLoading(loading) {
    this.setState({ loading, error: null })
  }

  setError(error) {
    this.setState({ error, loading: false })
  }

  render() {
    const { authed, loading, error } = this.state
    if (loading) {
      return <h1>Loading</h1>
    }

    const logout = () => { firebase.auth().signOut() }
    const user = firebase.auth().currentUser;
    return (
      <Router>
        <div className='app'>
          {authed ?
            <div>
              <h1>Home</h1>
              {user.emailVerified ? <h2>Email was verified</h2> : <h2>Email is not verified</h2>}
              <button onClick={logout}>Log out</button>
            </div> :
            <h1>LoginIn</h1>
          }
          {error && <div className='error'>{error.message}</div>}
          <div>
            <Redirect from='/' to='/home' />
            <ProtectedRoute path='/home' component={Home} authed={authed} />
            <Route path='/login' render={(props) => (
              <Login
                authed={authed}
                setLoading={this.setLoading}
                setError={this.setError} {...props}
              />)}
            />
          </div>
        </div>
      </Router>
    )
  }
}

const Login = ({ authed, setLoading, setError, location }) => {
  let email = null
  let password = null

  const login = () => {
    setLoading(true)
    firebase.auth().signInWithEmailAndPassword(email.value, password.value)
      .then(() => { setLoading(false) })
      .catch((error) => { setError(error) })
  }

  const signup = () => {
    setLoading(true)
    firebase.auth().createUserWithEmailAndPassword(email.value, password.value)
      .then(() => {
        setLoading(false)
        var user = firebase.auth().currentUser;
        user.sendEmailVerification().then(() => {
          alert("verification email sent to " + user.email);
        }).catch((error) => console.error(error))
      })
      .catch((error) => { setError(error) })
  }

  const from = location.state.from || { pathname: '/home' }
  if (authed) {
    return <Redirect to={from} />
  }

  return (
    <form className='login' action='login'>
      <input placeholder='email@example.com' type='email' ref={c => (email = c)} />
      <input placeholder='your password' type='password' ref={c => (password = c)} />
      <div className='button-row'>
        <button onClick={login}> Log in </button>
        <button onClick={signup}> Sign up </button>
      </div>
    </form>
  )
}

const ProtectedRoute = ({ component, authed, ...rest }) => {
  const renderProtectedRoute = (props) => {
    if (authed) {
      return React.createElement(component, props)
    } else {
      const state = { from: props.location }
      return <Redirect to={{ pathname: '/login', state }} />
    }
  }
  return <Route {...rest} render={renderProtectedRoute} />
}

// Replace with your firebase config from
// https://console.firebase.google.com/project/<your_poject_id>
firebase.initializeApp({
  apiKey: "yours",
  authDomain: "yours",
  databaseURL: "yours",
})
