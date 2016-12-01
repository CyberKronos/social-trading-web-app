import React from 'react'
import {Route, IndexRedirect, IndexRoute} from 'react-router'
import AuthService from 'utils/AuthService'
import Container from './Container'
import Home from './Home/Home'
import Login from './Login/Login'
import Messages from 'components/Messages/Messages'
import Accounts from 'components/Accounts/Accounts'
import Forms from 'components/Forms/Forms'
import History from 'components/History/History'

const auth = new AuthService(__AUTH0_CLIENT_ID__, __AUTH0_DOMAIN__);

// onEnter callback to validate authentication in private routes
const requireAuth = (nextState, replace) => {
  if (!auth.loggedIn()) {
    replace({ pathname: '/login' })
  }
}

export const makeMainRoutes = () => {
  return (
    <Route path="/" component={Container} auth={auth}>
      <IndexRedirect to="/home" />
      <Route path="home" component={Home} onEnter={requireAuth} />
      <Route path="login" component={Login} />
      <Route path="messages" component={Messages} />
      {/* <Route path="accounts/:accountKey" component={Accounts}> */}
      <Route path="accounts/:accountKey" component={Accounts}>
        <IndexRoute component={Forms}/>
        <Route path="forms" component={Forms} />
        <Route path="history" component={History} />
      </Route>
    </Route>
  )
}

export default makeMainRoutes
