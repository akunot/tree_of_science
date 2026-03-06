import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../lib/api';
import { useAuth } from '../hooks/useAuth.jsx';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const hasFired = useRef(false); // ← evita doble ejecución en StrictMode

  useEffect(() => {
    if (hasFired.current) return; // segunda ejecución de StrictMode: ignorar
    hasFired.current = true;

    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Token de verificación faltante');
      return;
    }

    authAPI.verifyEmail(token)
      .then((res) => {
        if (res.data?.user) {
          login(res.data);
          navigate('/dashboard');
        } else {
          setStatus('success');
          setMessage('Email verificado correctamente. Ahora puede iniciar sesión.');
        }
      })
      .catch((error) => {
        const msg = error.response?.data?.error || 'Token inválido o expirado';
        setStatus('error');
        setMessage(msg);
      });
  }, []); // ← sin dependencias: solo debe correr al montar

  return (
    <div>
      {status === 'loading' && <p>Verificando email...</p>}
      {status === 'success' && <p>{message}</p>}
      {status === 'error' && <p>{message}</p>}
    </div>
  );
};

export default VerifyEmail;