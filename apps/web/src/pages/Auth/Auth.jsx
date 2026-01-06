import { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api.js';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PasswordInput from '../Auth/PasswordInput.jsx';
import { useAuth } from '../../Hooks/AuthContext';

const cardStyle = {
  background: '#ffffff',
  borderRadius: 24,
  padding: '32px 32px 28px',
  boxShadow: '0 18px 45px rgba(15,23,42,0.08)',
  border: '1px solid #f3f4f6',
};

const headingStyle = {
  fontSize: 26,
  fontWeight: 600,
  textAlign: 'center',
  color: '#111827',
  marginBottom: 4,
  fontFamily: '"Times New Roman", ui-serif, Georgia, "Noto Serif", serif',
};

const subHeadingStyle = {
  textAlign: 'center',
  color: '#6b7280',
  fontSize: 14,
  marginBottom: 24,
};

const fieldLabelStyle = {
  fontSize: 13,
  fontWeight: 500,
  color: '#111827',
  marginBottom: 6,
};

const inputWrapperStyle = {
  display: 'flex',
  alignItems: 'center',
  borderRadius: 10,
  border: '1px solid #e5e7eb',
  background: '#ffffff',
  padding: '9px 12px',
  boxSizing: 'border-box',
};

const inputStyle = {
  border: 'none',
  outline: 'none',
  flex: 1,
  fontSize: 14,
  color: '#111827',
  padding: 0,
  minWidth: 0,
  background: 'transparent',
};

const primaryButtonStyle = {
  width: '100%',
  marginTop: 12,
  padding: '10px 16px',
  borderRadius: 9999,
  border: 'none',
  background: '#111827',
  color: '#ffffff',
  fontSize: 14,
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  boxShadow: '0 3px 6px rgba(15,23,42,0.35)',
};

const googleButtonStyle = {
  width: '80%',                
  margin: '12px auto 0',       
  padding: '10px 16px',
  borderRadius: 9999,
  border: '1px solid #e5e7eb',
  background: '#ffffff',
  color: '#374151',
  fontSize: 14,
  fontWeight: 500,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  cursor: 'pointer',
};

const errorBoxStyle = {
  marginBottom: 12,
  padding: '8px 10px',
  borderRadius: 8,
  background: '#fef2f2',
  color: '#b91c1c',
  fontSize: 13,
  border: '1px solid #fecaca',
};

const successBoxStyle = {
  marginBottom: 12,
  padding: '8px 10px',
  borderRadius: 8,
  background: '#ecfdf3',
  color: '#15803d',
  fontSize: 13,
  border: '1px solid #bbf7d0',
};

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refresh } = useAuth();

  const [tab, setTab] = useState('login');
  const [loginForm, setLogin] = useState({ email: '', password: '' });
  const [regForm, setReg] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [error, setError] = useState(null);
  const [ok, setOk] = useState(false);

  function switchToLogin() {
    setTab('login');
    setError(null);
    setOk(false);
  }

  function switchToRegister() {
    setTab('register');
    setError(null);
    setOk(false);
  }

  useEffect(() => {
    const err = searchParams.get('error');
    if (!err) return;

    if (err === 'already_registered') {
      switchToLogin();
      setError(
        'This Google account is already registered. Please sign in instead.'
      );
    } else if (err === 'google_cancelled') {
      setError('Google sign-in was cancelled or failed. Please try again.');
    }
  }, [searchParams]);

  function getNextPath() {
    const raw = searchParams.get('next');
    if (!raw) return '/';
    try {
      return decodeURIComponent(raw);
    } catch {
      return '/';
    }
  }

  async function onLogin(e) {
    e.preventDefault();
    setError(null);
    setOk(false);

    try {
      await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginForm),
      });

      await refresh();
      setOk(true);

      const nextPath = getNextPath();
      navigate(nextPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Incorrect email or password.');
    }
  }

  async function onRegister(e) {
    e.preventDefault();
    setError(null);
    setOk(false);

    if (regForm.password !== regForm.confirm) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          firstName: regForm.firstName,
          lastName: regForm.lastName,
          email: regForm.email,
          password: regForm.password,
        }),
      });

      await refresh();
      setOk(true);

      const nextPath = getNextPath();
      navigate(nextPath, { replace: true });
    } catch (err) {
      if (err.status === 409) {
        setError(
          err.message ||
            'This email is already registered. Please sign in instead.'
        );
        switchToLogin();
        setLogin((prev) => ({
          ...prev,
          email: regForm.email,
        }));
        return;
      }

      setError(err.message || 'Something went wrong. Please try again.');
    }
  }

  const apiBase = import.meta.env.VITE_API_URL;
  const googleLoginHref = `${apiBase}/api/auth/google?mode=login`;
  const googleRegisterHref = `${apiBase}/api/auth/google?mode=register`;

  const tabBase = {
    flex: 1,
    borderRadius: 9999,
    border: 'none',
    padding: '8px 12px',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    background: 'transparent',
  };

  const loginActive = tab === 'login';
  const registerActive = tab === 'register';

  return (
    <main
      style={{
        minHeight: 'calc(100vh - 80px)',
        background: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
      }}
    >
      <section style={{ width: '100%', maxWidth: 420 }}>
        <div style={cardStyle}>
          <h1 style={headingStyle}>Welcome</h1>
          <p style={subHeadingStyle}>
            Sign in to your account or create a new one
          </p>

          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                background: '#f3f4f6',
                borderRadius: 9999,
                padding: 4,
                display: 'flex',
                boxShadow: 'inset 0 0 0 1px #e5e7eb',
              }}
            >
              <button
                type="button"
                onClick={switchToLogin}
                style={{
                  ...tabBase,
                  background: loginActive ? '#111827' : 'transparent',
                  color: loginActive ? '#ffffff' : '#4b5563',
                  boxShadow: loginActive
                    ? '0 2px 4px rgba(15,23,42,0.35)'
                    : 'none',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 2,
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5l7 7-7 7" />
                  </svg>
                </span>
                Login
              </button>

              <button
                type="button"
                onClick={switchToRegister}
                style={{
                  ...tabBase,
                  background: registerActive ? '#111827' : 'transparent',
                  color: registerActive ? '#ffffff' : '#4b5563',
                  boxShadow: registerActive
                    ? '0 2px 4px rgba(15,23,42,0.35)'
                    : 'none',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 2,
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="16" y1="11" x2="22" y2="11" />
                  </svg>
                </span>
                Register
              </button>
            </div>
          </div>

          {error && <div style={errorBoxStyle}>{error}</div>}
          {ok && !error && <div style={successBoxStyle}>Success.</div>}

          {tab === 'login' ? (
            <form onSubmit={onLogin} style={{ marginTop: 4 }}>
              <div style={{ marginBottom: 14 }}>
                <label style={fieldLabelStyle}>Email</label>
                <div style={inputWrapperStyle}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 6,
                      color: '#9ca3af',
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="3"
                        y="5"
                        width="18"
                        height="14"
                        rx="2"
                        ry="2"
                      />
                      <polyline points="3 7 12 13 21 7" />
                    </svg>
                  </span>
                  <input
                    required
                    type="email"
                    placeholder="Enter your email"
                    value={loginForm.email}
                    onChange={(e) =>
                      setLogin((f) => ({ ...f, email: e.target.value }))
                    }
                    style={inputStyle}
                    autoComplete="email"
                  />
                </div>
              </div>

              <PasswordInput
                label="Password"
                value={loginForm.password}
                onChange={(e) =>
                  setLogin((f) => ({ ...f, password: e.target.value }))
                }
                autoComplete="current-password"
                showStrength={false}
              />

              <button type="submit" style={primaryButtonStyle}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 6,
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5l7 7-7 7" />
                  </svg>
                </span>
                Sign In
              </button>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: 16,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: '#e5e7eb',
                  }}
                />
                <span
                  style={{
                    fontSize: 12,
                    color: '#9ca3af',
                    padding: '0 8px',
                  }}
                >
                  Or
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: '#e5e7eb',
                  }}
                />
              </div>

              <a href={googleLoginHref} style={googleButtonStyle}>
                <span
                  style={{
                    width: 18,
                    height: 18,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    width="18"
                    height="18"
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.57 13.02 17.79 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.5 24.5c0-1.57-.15-3.08-.43-4.55H24v9.02h12.7c-.55 2.96-2.23 5.47-4.74 7.16l7.64 5.94C43.9 37.96 46.5 31.77 46.5 24.5z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.54 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.27-3.13.76-4.59l-7.98-6.19C.82 16.09 0 19.01 0 22c0 4.99 1.82 9.57 4.88 13.11l7.66-6.52z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.91-5.79l-7.64-5.94C30.5 37.53 27.47 38.5 24 38.5c-6.21 0-11.43-3.52-13.56-8.47l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                    <path fill="none" d="M0 0h48v48H0z" />
                  </svg>
                </span>
                <span>Sign in with Google</span>
              </a>
            </form>
          ) : (
            <form onSubmit={onRegister} style={{ marginTop: 4 }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  columnGap: 8,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <label style={fieldLabelStyle}>First Name</label>
                  <div style={inputWrapperStyle}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 6,
                        color: '#9ca3af',
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      placeholder="First name"
                      value={regForm.firstName}
                      onChange={(e) =>
                        setReg((f) => ({
                          ...f,
                          firstName: e.target.value,
                        }))
                      }
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <label style={fieldLabelStyle}>Last Name</label>
                  <div style={inputWrapperStyle}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 6,
                        color: '#9ca3af',
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      placeholder="Last name"
                      value={regForm.lastName}
                      onChange={(e) =>
                        setReg((f) => ({
                          ...f,
                          lastName: e.target.value,
                        }))
                      }
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={fieldLabelStyle}>Email</label>
                <div style={inputWrapperStyle}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 6,
                      color: '#9ca3af',
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="3"
                        y="5"
                        width="18"
                        height="14"
                        rx="2"
                        ry="2"
                      />
                      <polyline points="3 7 12 13 21 7" />
                    </svg>
                  </span>
                  <input
                    required
                    type="email"
                    placeholder="Enter your email"
                    value={regForm.email}
                    onChange={(e) =>
                      setReg((f) => ({ ...f, email: e.target.value }))
                    }
                    style={inputStyle}
                    autoComplete="email"
                  />
                </div>
              </div>

              <PasswordInput
                label="Password"
                value={regForm.password}
                onChange={(e) =>
                  setReg((f) => ({ ...f, password: e.target.value }))
                }
                autoComplete="new-password"
                showStrength={true}
              />

              <PasswordInput
                label="Confirm Password"
                value={regForm.confirm}
                onChange={(e) =>
                  setReg((f) => ({ ...f, confirm: e.target.value }))
                }
                autoComplete="new-password"
                showStrength={false}
              />

              <button type="submit" style={primaryButtonStyle}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 6,
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 5v14" />
                    <path d="M5 12h14" />
                  </svg>
                </span>
                Create Account
              </button>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: 16,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: '#e5e7eb',
                  }}
                />
                <span
                  style={{
                    fontSize: 12,
                    color: '#9ca3af',
                    padding: '0 8px',
                  }}
                >
                  Or
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: '#e5e7eb',
                  }}
                />
              </div>

              <a href={googleRegisterHref} style={googleButtonStyle}>
                <span
                  style={{
                    width: 18,
                    height: 18,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    width="18"
                    height="18"
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.57 13.02 17.79 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.5 24.5c0-1.57-.15-3.08-.43-4.55H24v9.02h12.7c-.55 2.96-2.23 5.47-4.74 7.16l7.64 5.94C43.9 37.96 46.5 31.77 46.5 24.5z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.54 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.27-3.13.76-4.59l-7.98-6.19C.82 16.09 0 19.01 0 22c0 4.99 1.82 9.57 4.88 13.11l7.66-6.52z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.91-5.79l-7.64-5.94C30.5 37.53 27.47 38.5 24 38.5c-6.21 0-11.43-3.52-13.56-8.47l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                    <path fill="none" d="M0 0h48v48H0z" />
                  </svg>
                </span>
                <span>Sign up with Google</span>
              </a>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}