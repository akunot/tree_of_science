import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../lib/api';
import { useAuth } from '../hooks/useAuth.jsx';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Token de verificación faltante');
      return;
    }

    authAPI.verifyEmail(token)
      .then((res) => {
        // El backend ya dejó las cookies y devolvió user
        if (res.data?.user) {
          login(res.data);          // guarda user en localStorage
          navigate('/dashboard');   // o '/admin' si quieres lógica de rol
        } else {
          setStatus('success');
          setMessage('Email verificado correctamente. Ahora puede iniciar sesión.');
        }
      })
      .catch((error) => {
        console.error('Error verificando email', error);
        const msg = error.response?.data?.error || 'Token inválido o expirado';
        setStatus('error');
        setMessage(msg);
      });
  }, [searchParams, navigate]);

  return (
    <div>
      {status === 'loading' && <p>Verificando email...</p>}
      {status === 'success' && <p>{message}</p>}
      {status === 'error' && <p>{message}</p>}
    </div>
  );
};

export default VerifyEmail;