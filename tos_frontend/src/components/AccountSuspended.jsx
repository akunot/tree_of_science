import { Link } from 'react-router-dom';

const AccountSuspended = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold text-red-600 mb-2">Cuenta Suspendida</h1>
      <p className="text-gray-700 mb-4">
        Tu cuenta está suspendida o pendiente de activación. Contacta al administrador para más información.
      </p>
      <Link
        to="/login"
        className="text-blue-600 hover:text-blue-500 font-medium text-sm"
      >
        Volver al inicio de sesión
      </Link>
    </div>
  </div>
);

export default AccountSuspended;
