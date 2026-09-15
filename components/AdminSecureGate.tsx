'use client';

import React, { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { AdminView } from '@/components/views/AdminView';
import {
  browserSessionPersistence,
  getMultiFactorResolver,
  multiFactor,
  onAuthStateChanged,
  sendEmailVerification,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  TotpMultiFactorGenerator,
} from 'firebase/auth';
import type { MultiFactorError, MultiFactorResolver, TotpSecret, User } from 'firebase/auth';

const ADMIN_UID = 'hx9EpMe3uhgdaIxlhS8FcsKAhcB2';
type AdminTab = 'inicio' | 'sobre' | 'servicos' | 'projetos' | 'blog' | 'contato';

interface AdminSecureGateProps {
  onNavigateToTab: (tab: AdminTab) => void;
}

const errorCode = (error: unknown) =>
  typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code ?? '')
    : '';

const otp = (value: string) => value.replace(/\D/g, '').slice(0, 6);

const hasTotpSignInClaim = async (candidate: User) => {
  const tokenResult = await candidate.getIdTokenResult();
  const firebaseClaim = tokenResult.claims.firebase;

  if (typeof firebaseClaim !== 'object' || firebaseClaim === null) {
    return false;
  }

  return (
    (firebaseClaim as { sign_in_second_factor?: unknown }).sign_in_second_factor ===
    TotpMultiFactorGenerator.FACTOR_ID
  );
};

export const AdminSecureGate: React.FC<AdminSecureGateProps> = ({ onNavigateToTab }) => {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [totpActive, setTotpActive] = useState(false);
  const [mfaSessionVerified, setMfaSessionVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resolver, setResolver] = useState<MultiFactorResolver | null>(null);
  const [loginCode, setLoginCode] = useState('');
  const [secret, setSecret] = useState<TotpSecret | null>(null);
  const [enrollCode, setEnrollCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const syncUser = async (nextUser: User | null) => {
    setUser(nextUser);
    setEmailVerified(Boolean(nextUser?.emailVerified));

    if (!nextUser) {
      setTotpActive(false);
      setMfaSessionVerified(false);
      return;
    }

    const enrolled = multiFactor(nextUser).enrolledFactors.some(
      (factor) => factor.factorId === TotpMultiFactorGenerator.FACTOR_ID,
    );
    setTotpActive(enrolled);

    try {
      setMfaSessionVerified(enrolled && (await hasTotpSignInClaim(nextUser)));
    } catch {
      setMfaSessionVerified(false);
    }
  };

  useEffect(() => {
    return onAuthStateChanged(auth, async (nextUser) => {
      if (nextUser && nextUser.uid !== ADMIN_UID) {
        await signOut(auth);
        await syncUser(null);
        setMessage('Usuário não autorizado.');
      } else {
        await syncUser(nextUser);
      }
      setReady(true);
    });
  }, []);

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage('');
    try {
      await setPersistence(auth, browserSessionPersistence);
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (credential.user.uid !== ADMIN_UID) {
        await signOut(auth);
        setMessage('Usuário não autorizado.');
      } else {
        await syncUser(credential.user);
        setPassword('');
      }
    } catch (error: unknown) {
      if (errorCode(error) === 'auth/multi-factor-auth-required') {
        const nextResolver = getMultiFactorResolver(auth, error as MultiFactorError);
        if (nextResolver.hints.some((hint) => hint.factorId === TotpMultiFactorGenerator.FACTOR_ID)) {
          setResolver(nextResolver);
          setPassword('');
          setMessage('Senha validada. Informe o código do autenticador.');
        } else {
          setMessage('O segundo fator cadastrado não é compatível com este painel.');
        }
      } else {
        setMessage('Falha na autenticação. Verifique as credenciais.');
      }
    } finally {
      setBusy(false);
    }
  };

  const finishLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!resolver || loginCode.length !== 6 || busy) return;
    const hint = resolver.hints.find((factor) => factor.factorId === TotpMultiFactorGenerator.FACTOR_ID);
    if (!hint) return;
    setBusy(true);
    setMessage('');
    try {
      const assertion = TotpMultiFactorGenerator.assertionForSignIn(hint.uid, loginCode);
      const credential = await resolver.resolveSignIn(assertion);
      if (credential.user.uid !== ADMIN_UID) {
        await signOut(auth);
        setMessage('Usuário não autorizado.');
      } else {
        await credential.user.getIdToken(true);
        await syncUser(credential.user);
        setResolver(null);
        setLoginCode('');
      }
    } catch {
      setMessage('Código inválido ou expirado.');
    } finally {
      setBusy(false);
    }
  };

  const sendVerification = async () => {
    if (!user || busy) return;
    setBusy(true);
    try {
      await sendEmailVerification(user);
      setMessage('E-mail de verificação enviado. Abra o link recebido e depois atualize o status.');
    } catch {
      setMessage('Não foi possível enviar o e-mail de verificação agora.');
    } finally {
      setBusy(false);
    }
  };

  const refreshVerification = async () => {
    if (!user || busy) return;
    setBusy(true);
    try {
      await user.reload();
      setEmailVerified(user.emailVerified);
      setMessage(user.emailVerified ? 'E-mail verificado.' : 'O e-mail ainda não aparece como verificado.');
    } finally {
      setBusy(false);
    }
  };

  const beginEnrollment = async () => {
    if (!user || !emailVerified || busy) return;
    setBusy(true);
    setMessage('');
    try {
      const session = await multiFactor(user).getSession();
      setSecret(await TotpMultiFactorGenerator.generateSecret(session));
    } catch (error: unknown) {
      if (errorCode(error) === 'auth/requires-recent-login') {
        await signOut(auth);
        await syncUser(null);
        setMessage('Faça login novamente antes de cadastrar o autenticador.');
      } else {
        setMessage('Não foi possível iniciar o cadastro do TOTP.');
      }
    } finally {
      setBusy(false);
    }
  };

  const finishEnrollment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !secret || enrollCode.length !== 6 || busy) return;
    setBusy(true);
    setMessage('');
    try {
      const assertion = TotpMultiFactorGenerator.assertionForEnrollment(secret, enrollCode);
      await multiFactor(user).enroll(assertion, 'Google Authenticator');
      setSecret(null);
      setEnrollCode('');
      await signOut(auth);
      await syncUser(null);
      setMessage('MFA cadastrado. Entre novamente e confirme o código do autenticador para abrir o painel.');
    } catch {
      setMessage('Código inválido. Use o código atual do aplicativo autenticador.');
    } finally {
      setBusy(false);
    }
  };

  if (!ready) {
    return <div className="min-h-[70vh] bg-slate-950 text-slate-300 flex items-center justify-center">Verificando sessão segura...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] bg-slate-950 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md p-8 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-5 text-white">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Painel Administrativo Seguro</h1>
            <p className="text-xs text-slate-400 mt-1">Firebase Authentication + TOTP</p>
          </div>
          {resolver ? (
            <form onSubmit={finishLogin} className="space-y-4">
              <label className="block text-xs text-slate-400">Código do autenticador</label>
              <input value={loginCode} onChange={(e) => setLoginCode(otp(e.target.value))} inputMode="numeric" autoComplete="one-time-code" maxLength={6} className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-center text-xl tracking-[0.4em] font-mono" autoFocus />
              <button disabled={busy || loginCode.length !== 6} className="w-full p-3 rounded-xl bg-amber-500 text-slate-950 font-bold disabled:opacity-50">VALIDAR SEGUNDO FATOR</button>
              <button type="button" onClick={() => { setResolver(null); setLoginCode(''); setMessage(''); }} className="w-full p-2 text-xs text-slate-400">Voltar</button>
            </form>
          ) : (
            <form onSubmit={login} className="space-y-4">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail administrativo" autoComplete="username" required className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" autoComplete="current-password" required className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700" />
              <button disabled={busy} className="w-full p-3 rounded-xl bg-amber-500 text-slate-950 font-bold disabled:opacity-50">{busy ? 'ENTRANDO...' : 'ENTRAR'}</button>
            </form>
          )}
          {message && <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-center text-slate-300">{message}</div>}
        </div>
      </div>
    );
  }

  if (!totpActive) {
    return (
      <div className="min-h-[70vh] bg-slate-950 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl p-8 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-5 text-white">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Ativar MFA do administrador</h1>
            <p className="text-xs text-slate-400 mt-1">O painel só será liberado depois do cadastro TOTP.</p>
          </div>
          {!emailVerified ? (
            <div className="space-y-3">
              <p className="text-sm text-amber-200">O Firebase exige e-mail verificado antes da matrícula TOTP.</p>
              <button onClick={sendVerification} disabled={busy} className="w-full p-3 rounded-xl bg-amber-500 text-slate-950 font-bold disabled:opacity-50">ENVIAR E-MAIL DE VERIFICAÇÃO</button>
              <button onClick={refreshVerification} disabled={busy} className="w-full p-3 rounded-xl border border-slate-700 text-slate-300 disabled:opacity-50">JÁ VERIFIQUEI — ATUALIZAR</button>
            </div>
          ) : !secret ? (
            <button onClick={beginEnrollment} disabled={busy} className="w-full p-3 rounded-xl bg-amber-500 text-slate-950 font-bold disabled:opacity-50">GERAR CHAVE DO AUTENTICADOR</button>
          ) : (
            <form onSubmit={finishEnrollment} className="space-y-4">
              <p className="text-xs text-red-300">Esta chave é secreta. Não a envie por mensagem, e-mail, captura de tela ou chat.</p>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 font-mono text-sm text-amber-300 break-all select-all">{secret.secretKey}</div>
              <div className="text-xs text-slate-300 space-y-1">
                <p>No Google Authenticator, toque em <strong>+</strong> → <strong>Inserir chave de configuração</strong>.</p>
                <p>Nome: <strong>MR Engenharia</strong>. Tipo: <strong>Baseada em tempo</strong>.</p>
              </div>
              <input value={enrollCode} onChange={(e) => setEnrollCode(otp(e.target.value))} inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="000000" className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-center text-xl tracking-[0.4em] font-mono" />
              <button disabled={busy || enrollCode.length !== 6} className="w-full p-3 rounded-xl bg-amber-500 text-slate-950 font-bold disabled:opacity-50">CONFIRMAR E ATIVAR MFA</button>
            </form>
          )}
          {message && <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-center text-slate-300">{message}</div>}
          <button onClick={() => signOut(auth)} className="w-full p-2 text-xs text-slate-500">Sair</button>
        </div>
      </div>
    );
  }

  if (!mfaSessionVerified) {
    return (
      <div className="min-h-[70vh] bg-slate-950 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md p-8 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-5 text-white text-center">
          <h1 className="text-2xl font-bold">Segundo fator necessário</h1>
          <p className="text-sm text-slate-300">
            Esta sessão não contém a confirmação TOTP exigida para operações administrativas.
          </p>
          <button
            onClick={async () => {
              await signOut(auth);
              await syncUser(null);
              setMessage('Entre novamente e informe o código do autenticador.');
            }}
            className="w-full p-3 rounded-xl bg-amber-500 text-slate-950 font-bold"
          >
            FAZER LOGIN COM MFA
          </button>
        </div>
      </div>
    );
  }

  return <AdminView onNavigateToTab={onNavigateToTab} />;
};
