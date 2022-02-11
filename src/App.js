import React, { Component } from 'react';
import { Title } from './Title'
import { Sidebar } from './Sidebar'
import { TokenCtx } from './UserAction'
import { LoginPopup } from './login';
import './App.css';
import './Sidebar.css';
import './Title.css';
import './UserAction.css';

const MAX_SIDEBAR_STACK_SIZE = 10;

function DeprecatedAlert(props) {
  return <div id="global-hint-container" style={{ display: 'none' }} />;
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sidebar_stack: [[null, null]], // list of [status, content]
      token: null,
    };
    this.show_sidebar_bound = this.show_sidebar.bind(this);
  }

  show_sidebar(title, content, mode = 'push') {
    this.setState((prevState) => {
      let ns = prevState.sidebar_stack.slice();
      if (mode === 'push') {
        if (ns.length === 1) {
          document.body.style.top = `-${window.scrollY}px`;
          document.body.style.position = 'fixed';
          document.body.style.width = '100vw'; // Be responsive with fixed position
        }
        if (ns.length > MAX_SIDEBAR_STACK_SIZE) ns.splice(1, 1);
        ns = ns.concat([[title, content]]);
      } else if (mode === 'pop') {
        if (ns.length === 1) return;
        if (ns.length === 2) {
          const scrollY = document.body.style.top;
          document.body.style.position = '';
          document.body.style.top = '';
          document.body.style.width = '';
          window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
        ns.pop();
      } else if (mode === 'replace') {
        ns.pop();
        ns = ns.concat([[title, content]]);
      } else if (mode === 'clear') {
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
        ns = [[null, null]];
      } else throw new Error('bad show_sidebar mode');
      return {
        sidebar_stack: ns,
      };
    });
  }

  render() {
    return (      
      <TokenCtx.Provider
        value={{
          value: this.state.token,
          set_value: (x) => {
            localStorage['TOKEN'] = x || '';
            this.setState({
              token: x,
            });
          },
        }}
      >
        <Title
          show_sidebar={this.show_sidebar_bound}
          mode={this.state.mode}
        />  
        <TokenCtx.Consumer>
          {(token) => (
            <div className="left-container">
              <DeprecatedAlert token={token.value} />
              {!token.value && (
                <div className="flow-item-row aux-margin">
                  <div className="box box-tip">
                    <p>
                      <LoginPopup token_callback={token.set_value}>
                        {(do_popup) => (
                          <a onClick={do_popup}>
                            <span className="icon icon-login" />
                            &nbsp;(Email) Log In / Sign Up
                          </a>
                        )}
                      </LoginPopup>
                    </p>
                  </div>
                </div>
              )}
              {
                <p style = { {textAlign : 'center'} }>
                  @Jim
                </p>
              }
              <br />
            </div>
          )}
        </TokenCtx.Consumer>
        <Sidebar
          show_sidebar={this.show_sidebar_bound}
          stack={this.state.sidebar_stack}
        />
      </TokenCtx.Provider>
    );
  }
}

export default App;
