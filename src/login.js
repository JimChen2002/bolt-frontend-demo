import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import { API_VERSION_PARAM } from './functions';

import ReCAPTCHA from 'react-google-recaptcha';

const API_ROOT = process.env.REACT_APP_API_ROOT

const LOGIN_POPUP_ANCHOR_ID = 'pkuhelper_login_popup_anchor';

class LoginPopupSelf extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading_status: 'idle',
      recaptcha_verified: false,
      email_verified: false,
      phase: 0,
    };

    this.ref = {
      email: React.createRef(),
      email_verification: React.createRef(),
      phone: React.createRef(),
      phone_verification: React.createRef(),
      password: React.createRef(),
      password_confirm: React.createRef(),

      checkbox_terms: React.createRef(),
      checkbox_account: React.createRef(),
    };

    this.popup_anchor = document.getElementById(LOGIN_POPUP_ANCHOR_ID);
    if (!this.popup_anchor) {
      this.popup_anchor = document.createElement('div');
      this.popup_anchor.id = LOGIN_POPUP_ANCHOR_ID;
      document.body.appendChild(this.popup_anchor);
    }
  }

  valid_registration() {
    if (this.ref.password.current.value.length < 8) {
      alert('Password too short, should have length at least 8');
      return 2;
    }
    if (
      this.ref.password.current.value !==
      this.ref.password_confirm.current.value
    ) {
      alert('Passwords are not the same');
      return 3;
    }
    return 0;
  }

  async sha256(message) {
    // encode as UTF-8
    const msgBuffer = new TextEncoder().encode(message);

    // hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    // convert bytes to hex string
    return hashArray.map((b) => ('00' + b.toString(16)).slice(-2)).join('');
  }

  async hashpassword(password) {
    let password_hashed = await this.sha256(password);
    password_hashed = await this.sha256(password_hashed);
    return password_hashed;
  }

  verify_email(failed_callback) {
    const old_token = new URL(location.href).searchParams.get('old_token');
    const email = this.ref.email.current.value;
    // VALIDATE EMAIL IN FRONT-END HERE
    const body = new URLSearchParams();
    Object.entries({
      email,
      old_token,
    }).forEach((param) => body.append(...param));
    this.setState(
      {
        loading_status: 'loading',
      },
      () => {
        fetch(API_ROOT + 'security/login/check_email?' + API_VERSION_PARAM(), {
          method: 'POST',
          body,
        })
          .then((res) => res.json())
          .then((json) => {
            // COMMENT NEXT LINE
            //json.code = 2;
            if (json.code < 0) throw new Error(json.msg);
            if (json.code == 1){
              alert("Verification Email Sent Successfully!");
              this.setState({
                loading_status: 'done',
                email_verified: true,
              });
            }
            else{
              alert('Fail to check email\n');
              this.setState({
                loading_status: 'done',
              });
            }
          })
          .catch((e) => {
            alert('Fail to check email\n' + e);
            this.setState({
              loading_status: 'done',
            });
            console.error(e);
          });
      },
    );
  }

  verify_email_code() {
    if(!this.state.email_verified){
      alert("Please enter your email first!");
      return;
    }
    const old_token = new URL(location.href).searchParams.get('old_token');
    const email = this.ref.email.current.value;
    const valid_code = this.ref.email_verification.current.value;
    // VALIDATE EMAIL IN FRONT-END HERE
    const body = new URLSearchParams();
    Object.entries({
      email,
      old_token,
      valid_code,
    }).forEach((param) => body.append(...param));
    this.setState(
      {
        loading_status: 'loading',
      },
      () => {
        fetch(API_ROOT + 'security/login/check_email_code?' + API_VERSION_PARAM(), {
          method: 'POST',
          body,
        })
          .then((res) => res.json())
          .then((json) => {
            if (json.code !== 0) throw new Error(json.msg);
            this.props.token_callback(json.token);
            alert('Email Checked Successfully!');
            this.setState({
              loading_status: 'done',
              phase: 1,
            });
          })
          .catch((e) => {
            alert('Fail to check email verification code\n' + e);
            this.setState({
              loading_status: 'done',
            });
            console.error(e);
          });
      },
    );
  }

  render() {
    window.recaptchaOptions = {
      useRecaptchaNet: true,
    };
    return ReactDOM.createPortal(
      <>
        <div>
          <div className="treehollow-login-popup-shadow" />
          <div className="treehollow-login-popup margin-popup">
            <p style={this.state.phase === 0 ? {} : { display: 'none' }}>
              <label>
                Email:&nbsp;
                <input
                  ref={this.ref.email}
                  type="email"
                  autoFocus={true}
                  placeholder="Input your Email"
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      this.verify_email(()=>{})
                    }
                  }}
                />
              </label>
            </p>
            {this.state.phase === 0 && (
              <>
                <p>
                  <button
                    onClick={()=>{
                      this.verify_email(()=>{})
                    }}
                  >
                    <b>Send</b>
                  </button>
                </p>
                <p>
                  <label>
                    Verification Code:&nbsp;
                    <input
                      ref={this.ref.email_verification}
                      type="text"
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          this.verify_email_code()
                        }
                      }}
                    />
                  </label>
                </p>
                <p>
                  <button
                    onClick={()=>{
                      this.verify_email_code()
                    }}
                  >
                    <b>Confirm</b>
                  </button>
                </p>
              </>
            )}
            
            {this.state.phase === 1 && (
              <>
                <p>
                  <label>
                    Phone:&nbsp;
                    <input
                      ref={this.ref.phone}
                      type="tel"
                      autoFocus={true}
                      placeholder="Input your phone number"
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          this.verify_phone()
                        }
                      }}
                    />
                  </label>
                </p>
                <p>
                  <button
                    onClick={()=>{
                      this.verify_phone()
                    }}
                  >
                    <b>Send</b>
                  </button>
                </p>
                <p>
                  <label>
                    Verification Code:&nbsp;
                    <input
                      ref={this.ref.email_verification}
                      type="text"
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          this.verify_phone_code()
                        }
                      }}
                    />
                  </label>
                </p>
                <p>
                  <button
                    onClick={()=>{
                      this.verify_phone_code()
                    }}
                  >
                    <b>Confirm</b>
                  </button>
                </p>
              </>
            )}
            {this.state.phase === 2 && (
              <>
                <p>
                  <b>KYC Form</b>
                </p>
                <p>
                  <label>
                    Verification code:&nbsp;
                    <input
                      ref={this.ref.email_verification}
                      type="tel"
                      autoFocus={true}
                    />
                  </label>
                </p>
              </>
            )}
            {this.state.phase === 3 && (
              <>
                <p>
                  <b>Backup Plan</b>
                </p>
              </>
            )}
          </div>
        </div>
      </>,
      this.popup_anchor,
    );
  }
}

export class LoginPopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      popup_show: false,
    };
    this.on_popup_bound = this.on_popup.bind(this);
    this.on_close_bound = this.on_close.bind(this);
  }

  on_popup() {
    this.setState({
      popup_show: true,
    });
  }

  on_close() {
    this.setState({
      popup_show: false,
    });
  }

  render() {
    return (
      <>
        {this.props.children(this.on_popup_bound)}
        {this.state.popup_show && (
          <LoginPopupSelf
            token_callback={this.props.token_callback}
            on_close={this.on_close_bound}
          />
        )}
      </>
    );
  }
}

export class RecaptchaV2Popup extends Component {
  constructor(props, context) {
    super(props, context);
    this.onChange = this.onChange.bind(this);
    this.state = {
      popup_show: false,
    };
    this.on_popup_bound = this.on_popup.bind(this);
    this.on_close_bound = this.on_close.bind(this);
  }

  on_popup() {
    this.setState({
      popup_show: true,
    });
  }

  on_close() {
    this.setState({
      popup_show: false,
    });
  }

  componentDidMount() {
    if (this.captchaRef) {
      console.log('started, just a second...');
      this.captchaRef.reset();
      this.captchaRef.execute();
    }
  }

  onChange(recaptchaToken) {
    localStorage['recaptcha'] = recaptchaToken;
    this.setState({
      popup_show: false,
    });
    this.props.callback();
  }

  render() {
    return (
      <>
        {this.props.children(this.on_popup_bound)}
        {this.state.popup_show && (
          <div>
            <div className="treehollow-login-popup-shadow" />
            <div className="treehollow-login-popup">
              <div className="g-recaptcha">
                <ReCAPTCHA
                  ref={(el) => {
                    this.captchaRef = el;
                  }}
                  sitekey={process.env.REACT_APP_RECAPTCHA_V2_KEY}
                  // size={"compact"}
                  onChange={this.onChange}
                />
              </div>

              <p>
                <button onClick={this.on_close_bound}>Cancel</button>
              </p>
            </div>
          </div>
        )}
      </>
    );
  }
}
