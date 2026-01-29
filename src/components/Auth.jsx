import React, { useState } from 'react';

const Auth = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          // On stocke les infos de session
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          onLoginSuccess(data.user);
        } else {
          alert("Compte créé ! Connecte-toi maintenant.");
          setIsLogin(true);
        }
      } else {
        setError(data.error || "Une erreur est survenue");
      }
    } catch (err) {
      setError("Impossible de contacter le serveur");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl font-jost">
      <h2 className="text-2xl font-black text-[#00F0FF] mb-6 tracking-widest uppercase">
        {isLogin ? 'Connexion' : 'Inscription'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-[#00F0FF]"
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-[#00F0FF]"
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-[#00F0FF]"
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
        />
        
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

        <button type="submit" className="w-full py-4 bg-[#00F0FF] text-black font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform">
          {isLogin ? 'Entrer' : 'Créer mon compte'}
        </button>
      </form>

      <button 
        onClick={() => setIsLogin(!isLogin)}
        className="w-full mt-6 text-slate-500 text-sm hover:text-white transition-colors"
      >
        {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
      </button>
    </div>
  );
};

export default Auth;