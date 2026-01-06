import { useState } from 'react';

function getStrength(password) {
  if (!password) return { label: '', color: '#6b7280' };

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { label: 'Password strength: Weak', color: '#dc2626' };    
  if (score <= 3) return { label: 'Password strength: Medium', color: '#d97706' };     
  return { label: 'Password strength: Strong', color: '#16a34a' };                    
}

export default function PasswordInput({
  label = 'Password',
  value,
  onChange,
  autoComplete = 'off',
  showStrength = false,   
}) {
  const [visible, setVisible] = useState(false);
  const strength = getStrength(value);

  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{ display: 'block', marginBottom: 4 }}>
          {label}
        </label>
      )}

      <div style={{ position: 'relative' }}>
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className="no-native-eye"
          style={{
            width: '100%',
            padding: '8px 44px 8px 10px', 
            boxSizing: 'border-box',
          }}
        />

        <button
          type="button"
          onClick={() => setVisible(v => !v)}
          style={{
            position: 'absolute',
            top: '50%',
            right: 10,
            transform: 'translateY(-50%)',
            border: 'none',
            background: 'transparent',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
              <circle cx="12" cy="12" r="3" />
              <line x1="4" y1="4" x2="20" y2="20" />
            </svg>
          )}
        </button>
      </div>

      {showStrength && value && (
        <div
          style={{
            marginTop: 4,
            fontSize: 12,
            color: strength.color,
          }}
        >
          {strength.label}
        </div>
      )}
    </div>
  );
}