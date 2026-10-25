import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { googleLogin } from '../api';
import { useAuth } from './context/AuthContext';

export default function GoogleAuthButton({ text = 'signin', onError, onSuccess }) {
  const buttonRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const clientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '86612520610-58lvicvbj3o954p46egc7cgpm97ku4t1.apps.googleusercontent.com';

  const handleCredentialResponse = async (response) => {
    if (!response || !response.credential) {
      const msg = 'Google authentication response was empty.';
      setErrorMsg(msg);
      if (onError) onError(msg);
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const data = await googleLogin(response.credential);

      if (data.token) {
        loginUser(data.token, data.user);
      }

      if (onSuccess) {
        onSuccess(data);
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Google login error:', err);
      const msg = err.message || 'Google sign-in failed. Please try again.';
      setErrorMsg(msg);
      if (onError) onError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let intervalId;

    const initGoogleBtn = () => {
      if (window.google?.accounts?.id && buttonRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          // Render button into container
          buttonRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            shape: 'rectangular',
            text: text === 'signup' ? 'signup_with' : 'signin_with',
            logo_alignment: 'left',
            width: 320,
          });

          return true;
        } catch (e) {
          console.error('Failed to initialize Google button:', e);
        }
      }
      return false;
    };

    if (!initGoogleBtn()) {
      // Retry for a few seconds if script is still loading
      intervalId = setInterval(() => {
        if (initGoogleBtn()) {
          clearInterval(intervalId);
        }
      }, 300);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [clientId, text]);

  return (
    <div className="google-auth-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', margin: '0.75rem 0' }}>
      <div ref={buttonRef} style={{ minHeight: '44px', display: 'flex', justifyContent: 'center' }} />
      {loading && (
        <p style={{ fontSize: '0.875rem', color: '#ff9800', marginTop: '0.5rem', textAlign: 'center' }}>
          Verifying with Google...
        </p>
      )}
      {errorMsg && (
        <p style={{ fontSize: '0.85rem', color: 'crimson', marginTop: '0.5rem', textAlign: 'center' }}>
          {errorMsg}
        </p>
      )}
    </div>
  );
}
