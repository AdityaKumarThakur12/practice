import { useState } from 'react';
import { Link2, Mail, Lock, ArrowRight, Building2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function LoginPage() {
  const { login } = useApp();
  const [email, setEmail] = useState('admin@practiceprofitlabs.com');
  const [password, setPassword] = useState('demo1234');
  const [showOrgSelect, setShowOrgSelect] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      if (!email || !password) {
        setError('Please enter your email and password');
        setLoading(false);
        return;
      }
      login(email, password);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-teal-50">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: '#0d9488' }}>
            <Link2 size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Link IQ</h1>
          <p className="text-sm text-slate-500">Digital Attribution & Analytics Platform</p>
        </div>

        <div className="card p-8 shadow-xl">
          {!showOrgSelect ? (
            <>
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Welcome back</h2>
              <p className="text-sm text-slate-500 mb-6">Sign in to your Link IQ account</p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="input-base pl-9"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-base pl-9"
                    />
                  </div>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-slate-600">
                    <input type="checkbox" defaultChecked className="rounded" />
                    Remember me
                  </label>
                  <button type="button" className="text-teal-600 hover:underline" style={{ color: '#0d9488' }}>
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary justify-center w-full py-2.5"
                  style={{ background: '#0d9488' }}
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Sign in <ArrowRight size={16} /></>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 text-center mb-3">
                  Demo account pre-filled. Just click "Sign in".
                </p>
                <button
                  onClick={() => setShowOrgSelect(true)}
                  className="w-full flex items-center justify-center gap-2 text-sm text-slate-600 hover:bg-slate-50 py-2 rounded-lg transition"
                >
                  <Building2 size={16} />
                  Select organization
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Select organization</h2>
              <p className="text-sm text-slate-500 mb-6">Choose the organization to sign into</p>

              <div className="flex flex-col gap-2">
                {[
                  { name: 'Practice Profit Labs', plan: 'Growth Plan', members: 4 },
                  { name: 'Smile Dental Group', plan: 'Starter Plan', members: 2 },
                ].map(org => (
                  <button
                    key={org.name}
                    onClick={() => { setShowOrgSelect(false); handleSubmit({ preventDefault: () => {} } as React.FormEvent); }}
                    className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:border-teal-400 hover:bg-teal-50 transition text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Building2 size={20} className="text-slate-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{org.name}</p>
                      <p className="text-xs text-slate-400">{org.plan} • {org.members} members</p>
                    </div>
                    <ArrowRight size={16} className="text-slate-300" />
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowOrgSelect(false)}
                className="w-full text-sm text-slate-500 hover:text-slate-700 mt-4"
              >
                Back to sign in
              </button>
            </>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Practice Profit Labs — Link IQ. All rights reserved.
        </p>
      </div>
    </div>
  );
}
