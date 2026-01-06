import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../lib/auth';

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      await logout();

      navigate('/', { replace: true });

    
      window.location.reload();
    })();
  }, [navigate]);

  return <p>Signing you out…</p>;
}
