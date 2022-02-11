import React, { Component } from 'react';
import { LoginPopup } from './login';

import './UserAction.css';

export const TokenCtx = React.createContext({
  value: null,
  set_value: () => {},
});

export function DoUpdate(clear_cache = true) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (let registration of registrations) {
        console.log('unregister', registration);
        registration.unregister();
      }
    });
  }
  setTimeout(() => {
    window.location.reload(true);
  }, 1000);
}

export function InfoSidebar(props) {
  return (
    <div>
      <LoginForm show_sidebar={props.show_sidebar} />
      <div className="box list-menu">
        <a href={"./static/bg/1.jpg"} target="_blank">
          <span className="icon icon-textfile" />
          <label>Post</label>
        </a>
        &nbsp;&nbsp;
        <a href={"./static/bg/2.jpg"} target="_blank">
          <span className="icon icon-textfile" />
          <label>Reply</label>
        </a>       
      </div>
    </div>
  );
}

export class LoginForm extends Component {

  render() {
    return (
      <TokenCtx.Consumer>
        {(token) => (
          <div>
            <div className="login-form box">
              {token.value ? (
                <div>
                  <p>
                    <b>You are logged in</b>
                    <button
                      type="button"
                      onClick={() => {
                        this.setState({
                          token: NULL,
                        });
                      }}
                    >
                      <span className="icon icon-logout" /> Log Out
                    </button>
                    <br />
                  </p>
                </div>
              ) : (
                <LoginPopup token_callback={token.set_value}>
                  {(do_popup) => (
                    <div>
                      <p>
                        <button type="button" onClick={do_popup}>
                          <span className="icon icon-login" />
                          &nbsp;Log In&nbsp;
                        </button>
                      </p>
                      <p>
                        &nbsp;Exclusively for CMU students, enjoy :)
                      </p>
                    </div>
                  )}
                </LoginPopup>
              )}
            </div>
          </div>
        )}
      </TokenCtx.Consumer>
    );
  }
}