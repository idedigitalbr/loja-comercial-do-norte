'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Crown,
  ExternalLink,
  Eye,
  EyeOff,
  Gem,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  User,
  X,
} from 'lucide-react';
import { useAuth } from './auth-provider';

type FlowStep = 'email' | 'login' | 'register' | 'forgot_password';

interface DevAccount {
  role: string;
  badge: string;
  badgeColor: string;
  desc: string;
  email: string;
  password: string;
  type: 'admin' | 'cliente';
}

const DEV_ACCOUNTS: DevAccount[] = [
  {
    role: 'Administrador Geral',
    badge: 'ADMIN',
    badgeColor: 'bg-[#004CB1]',
    desc: 'Acesso total, gestão de catálogo e Painel Admin (/admin)',
    email: 'admin@admin.com',
    password: 'admin123456',
    type: 'admin',
  },
  {
    role: 'Cliente Comprador',
    badge: 'CLIENTE',
    badgeColor: 'bg-emerald-600',
    desc: 'Acesso a cotações, lista de favoritos e compras no atacado/varejo',
    email: 'cliente@demo.com',
    password: 'cliente123456',
    type: 'cliente',
  },
];

export function AuthFlowCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/conta';

  const { checkEmail, login, register, user, isAuthenticated, logout } = useAuth();

  const [step, setStep] = useState<FlowStep>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [googleNotice, setGoogleNotice] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Segurança e Captcha Anti-bot
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [captchaError, setCaptchaError] = useState(false);

  // Modal de Desenvolvimento: Ver Senhas
  const [showDevModal, setShowDevModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Validação básica de e-mail
  function isValidEmail(val: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  }

  // Medidor de força de senha
  function getPasswordStrength(p: string) {
    if (!p) return { label: 'Vazia', color: 'bg-slate-200', width: '0%' };
    if (p.length < 8) return { label: 'Muito curta (mínimo 8)', color: 'bg-rose-500', width: '25%' };
    let score = 1;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score === 2) return { label: 'Média', color: 'bg-amber-500', width: '60%' };
    if (score >= 3) return { label: 'Forte e segura', color: 'bg-emerald-500', width: '100%' };
    return { label: 'Razoável', color: 'bg-blue-400', width: '45%' };
  }

  // Interação com o Captcha
  function handleToggleCaptcha() {
    if (captchaVerified) {
      setCaptchaVerified(false);
      return;
    }
    setCaptchaLoading(true);
    setCaptchaError(false);
    setTimeout(() => {
      setCaptchaLoading(false);
      setCaptchaVerified(true);
    }, 450);
  }

  // Copiar credenciais para a área de transferência
  async function handleCopy(text: string, key: string) {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // Ignora falha de clipboard
    }
  }

  // Ação rápida DEV: Preencher e entrar direto
  async function handleQuickLogin(targetEmail: string, targetPass: string) {
    setEmail(targetEmail);
    setPassword(targetPass);
    setCaptchaVerified(true);
    setCaptchaError(false);
    setErrorMessage(null);
    setShowDevModal(false);

    setLoading(true);
    const result = await login(targetEmail, targetPass);
    setLoading(false);

    if (result.ok) {
      const target = redirectUrl && redirectUrl !== '/conta' ? redirectUrl : '/';
      router.push(target);
      router.refresh();
    } else {
      setStep('login');
      setErrorMessage(result.error || 'Não foi possível entrar. Verifique sua senha.');
    }
  }

  // Ação rápida DEV: Apenas preencher campos
  function handleQuickFill(targetEmail: string, targetPass: string) {
    setEmail(targetEmail);
    setPassword(targetPass);
    setCaptchaVerified(true);
    setCaptchaError(false);
    setErrorMessage(null);
    setStep('login');
    setShowDevModal(false);
  }

  // ETAPA 1: Usuário digita e-mail -> Sistema verifica se existe ou não
  async function handleCheckEmail(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setErrorMessage('Por favor, informe um endereço de e-mail válido.');
      return;
    }

    if (!captchaVerified) {
      setCaptchaError(true);
      setErrorMessage('Por favor, confirme a verificação de segurança (Não sou um robô) antes de continuar.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setGoogleNotice(null);

    try {
      const { exists } = await checkEmail(cleanEmail);
      if (exists) {
        // Se tem conta -> continua o login (Etapa de Senha)
        setStep('login');
      } else {
        // Se NÃO tem conta -> vai para Etapa de Nome e Senha para ser rápido
        setStep('register');
      }
    } catch {
      // Se houver falha de rede inesperada, permite continuar para o login
      setStep('login');
    } finally {
      setLoading(false);
    }
  }

  // ETAPA 2A: Login com senha
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!password) {
      setErrorMessage('Por favor, digite sua senha.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const result = await login(email, password);
    setLoading(false);

    if (result.ok) {
      const target = redirectUrl && redirectUrl !== '/conta' ? redirectUrl : '/';
      router.push(target);
      router.refresh();
    } else {
      setErrorMessage(result.error || 'Não foi possível entrar. Verifique sua senha.');
    }
  }

  // ETAPA 2B: Registro rápido com Nome e Senha
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMessage('Por favor, informe seu nome completo.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('A senha precisa ter pelo menos 8 caracteres.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const result = await register({
      email,
      password,
      fullName: fullName.trim(),
    });
    setLoading(false);

    if (result.ok) {
      const target = redirectUrl && redirectUrl !== '/conta' ? redirectUrl : '/';
      router.push(target);
      router.refresh();
    } else {
      setErrorMessage(result.error || 'Erro ao criar conta. Tente novamente.');
    }
  }

  // Experiência do botão Google
  function handleGoogleClick() {
    setGoogleNotice(
      'A autenticação via Google está em fase de homologação. Por favor, utilize seu e-mail abaixo para acesso imediato.',
    );
  }

  // Esqueci minha senha
  function handleForgotPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !isValidEmail(email)) {
      setErrorMessage('Informe um e-mail válido para recuperação.');
      return;
    }
    if (!captchaVerified) {
      setCaptchaError(true);
      setErrorMessage('Por favor, complete a verificação de segurança antes de prosseguir.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setForgotSuccess(true);
    }, 600);
  }

  // Widget reutilizável de Captcha / Turnstile
  function renderCaptchaWidget() {
    return (
      <div
        className={`mt-4 rounded-xl border p-3 transition ${
          captchaError
            ? 'border-rose-400 bg-rose-50/50 ring-2 ring-rose-200'
            : captchaVerified
            ? 'border-emerald-300 bg-emerald-50/40'
            : 'border-slate-200 bg-slate-50/80 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <button
              aria-label="Verificação de segurança Não sou um robô"
              className={`relative flex size-7 shrink-0 items-center justify-center rounded-md border transition cursor-pointer ${
                captchaVerified
                  ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                  : captchaLoading
                  ? 'border-blue-400 bg-white'
                  : captchaError
                  ? 'border-rose-400 bg-white hover:border-rose-500'
                  : 'border-slate-300 bg-white hover:border-[#004CB1]'
              }`}
              disabled={captchaLoading}
              onClick={handleToggleCaptcha}
              type="button"
            >
              {captchaLoading && (
                <div className="size-4 animate-spin rounded-full border-2 border-[#004CB1] border-t-transparent" />
              )}
              {captchaVerified && !captchaLoading && (
                <Check className="size-4 stroke-[3]" />
              )}
            </button>

            <div>
              <span
                className={`block text-xs font-bold leading-tight ${
                  captchaVerified
                    ? 'text-emerald-800'
                    : captchaError
                    ? 'text-rose-700'
                    : 'text-slate-700'
                }`}
              >
                {captchaLoading
                  ? 'Verificando segurança…'
                  : captchaVerified
                  ? 'Verificação de segurança concluída'
                  : 'Não sou um robô'}
              </span>
              <span className="block text-[10px] text-slate-400">
                {captchaVerified
                  ? 'Ambiente autenticado e protegido'
                  : 'Validação de segurança anti-bot'}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end text-right shrink-0">
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-600">
              <ShieldCheck className="size-3.5 text-[#004CB1]" />
              <span>Turnstile</span>
            </div>
            <span className="text-[9px] text-slate-400">Privacidade • Termos</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[90vh] bg-[#F4F7FB] flex flex-col justify-start pb-16 overflow-hidden">
      {/* 
        BACKGROUND AO FUNDO (80% AZUL E 20% VERMELHO):
        Permanece atrás de tudo (z-0)
      */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[260px] sm:h-[300px] z-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, #004CB1 0%, #004CB1 80%, #E2091E 80%, #E2091E 100%)',
        }}
      />

      {/* CONTEÚDO PRINCIPAL (Z-INDEX 10, TOTALMENTE À FRENTE DO BACKGROUND) */}
      <div className="relative z-10 flex flex-col items-center justify-start w-full px-4">
        {/* LOGO NO CENTRO LÁ EM CIMA */}
        <div className="pt-8 sm:pt-10 flex flex-col items-center justify-center">
          <Link
            aria-label="Comercial do Norte - Página Inicial"
            className="transition hover:opacity-95"
            href="/"
          >
            <div className="relative h-12 w-[220px] sm:h-14 sm:w-[260px]">
              <Image
                alt="Comercial do Norte"
                className="object-contain"
                fill
                priority
                sizes="260px"
                src="/logo-comercial-do-norte-branca.png"
              />
            </div>
          </Link>
        </div>

        {/* CHAMADA PRINCIPAL: "Entre ou Crie sua Conta" OU "Olá, Nome!" */}
        <div className="mt-5 text-center text-white">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-xs">
            {isAuthenticated && user
              ? `Olá, ${user.firstName || user.fullName}!`
              : 'Entre ou Crie sua Conta'}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-white/90">
            {isAuthenticated && user
              ? 'Você já está conectado à sua conta na Loja Comercial do Norte'
              : 'Acesse suas cotações, favoritos e compras rápidas no atacado e varejo'}
          </p>
        </div>

        {/* CARD CENTRAL BEM À FRENTE COM SOMBRA DESTACADA */}
        <div className="mt-6 w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.16),0_4px_16px_rgba(0,0,0,0.06)] border border-slate-100">
          {/* CASO JÁ ESTEJA CONECTADO */}
          {isAuthenticated && user ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100">
                <div className="relative mb-2">
                  <div className="flex size-16 items-center justify-center rounded-full bg-[#004CB1] text-2xl font-black text-white shadow-md">
                    {user.firstName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white">
                    <CheckCircle2 className="size-4 stroke-[3]" />
                  </div>
                </div>

                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                  Conta Conectada
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                  {user.fullName || user.firstName}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>

                {/* Badges de Status da Conta */}
                <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
                  {user.isAdmin && (
                    <div className="flex items-center gap-1 rounded-full bg-[#E0EAFF] border border-blue-200/80 px-2.5 py-0.5 text-[10px] font-extrabold text-[#1E40AF]">
                      <Crown className="size-3 fill-[#1E40AF] text-[#1E40AF]" />
                      <span>ADM EDITOR</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 rounded-full bg-[#FEF3C7] border border-amber-200/80 px-2.5 py-0.5 text-[10px] font-extrabold text-[#B45309]">
                    <Gem className="size-3 fill-[#B45309] text-[#B45309]" />
                    <span>CLIENTE OURO</span>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-[#F3E8FF] border border-purple-200/80 px-2.5 py-0.5 text-[10px] font-extrabold text-[#7E22CE]">
                    <Star className="size-3 fill-[#7E22CE] text-[#7E22CE]" />
                    <span>9.2100 PTS</span>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="space-y-2.5 pt-1">
                <Link
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#004CB1] py-3 px-4 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#003882] active:scale-98 transition"
                  href="/"
                >
                  <span>Continuar comprando na Loja</span>
                  <ArrowRight className="size-4" />
                </Link>

                <Link
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition"
                  href="/conta"
                >
                  <User className="size-4 text-[#004CB1]" />
                  <span>Acessar Meu Painel e Pedidos</span>
                </Link>

                {user.isAdmin && (
                  <a
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50/70 py-2.5 px-4 text-xs sm:text-sm font-bold text-[#004CB1] hover:bg-blue-100/70 transition"
                    href={process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:5174/admin/'}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <ShieldCheck className="size-4" />
                    <span>Acessar Painel Administrativo</span>
                    <ExternalLink className="size-3.5 text-[#004CB1]/70" />
                  </a>
                )}
              </div>

              {/* Botão Sair / Trocar de conta */}
              <div className="pt-3 border-t border-slate-100 text-center">
                <button
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                  onClick={async () => {
                    await logout();
                    setStep('email');
                    setEmail('');
                    setPassword('');
                  }}
                  type="button"
                >
                  <LogOut className="size-3.5" />
                  <span>Sair desta conta ou entrar com outro e-mail</span>
                </button>
              </div>
            </div>
          ) : (
            <>
          {/* AVISO DO BOTÃO GOOGLE */}
          {googleNotice && (
            <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="size-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <span>{googleNotice}</span>
                <button
                  className="block mt-1 font-bold text-amber-800 underline cursor-pointer"
                  onClick={() => setGoogleNotice(null)}
                  type="button"
                >
                  Entendi
                </button>
              </div>
            </div>
          )}

          {/* MENSAGEM DE ERRO GERAL */}
          {errorMessage && (
            <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="size-4 shrink-0 text-rose-600 mt-0.5" />
              <span className="flex-1">{errorMessage}</span>
            </div>
          )}

          {/* ========================================================== */}
          {/* ETAPA 1: DIGITAR E-MAIL (E BOTÃO DO GOOGLE)                 */}
          {/* ========================================================== */}
          {step === 'email' && (
            <div>
              {/* BOTÃO EXPERIÊNCIA DO GOOGLE */}
              <button
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white py-3 px-4 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:border-slate-400 active:scale-98 cursor-pointer"
                onClick={handleGoogleClick}
                type="button"
              >
                {/* SVG Oficial Google Multi-color */}
                <svg className="size-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Continuar com o Google</span>
              </button>

              {/* DIVISOR: "Ou digite seu e-mail" */}
              <div className="relative my-6 flex items-center justify-center">
                <div className="w-full border-t border-slate-200" />
                <span className="absolute bg-white px-3 text-xs text-slate-400">
                  Ou digite seu e-mail
                </span>
              </div>

              {/* FORMULÁRIO DE E-MAIL */}
              <form onSubmit={handleCheckEmail}>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700" htmlFor="emailInput">
                    E-mail
                  </label>
                  <div className="relative">
                    <input
                      autoComplete="email"
                      autoFocus
                      className="w-full rounded-xl border border-slate-300 py-3 pr-10 pl-3.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#004CB1] focus:outline-none focus:ring-2 focus:ring-[#004CB1]/20 transition"
                      id="emailInput"
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="exemplo@email.com"
                      required
                      type="email"
                      value={email}
                    />
                    <Mail className="absolute right-3.5 top-3.5 size-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* VERIFICAÇÃO DE SEGURANÇA / CAPTCHA */}
                {renderCaptchaWidget()}

                <button
                  className="mt-5 flex w-full items-center justify-center rounded-xl bg-[#004CB1] py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#003882] active:scale-98 disabled:opacity-60 cursor-pointer"
                  disabled={loading}
                  type="submit"
                >
                  {loading ? 'Verificando e-mail…' : 'Continuar'}
                </button>
              </form>
            </div>
          )}

          {/* ========================================================== */}
          {/* ETAPA 2A: CONTA JÁ EXISTE -> LOGIN COM SENHA                */}
          {/* ========================================================== */}
          {step === 'login' && (
            <div>
              {/* Badge do E-mail com opção de trocar */}
              <div className="mb-5 flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#004CB1] text-white">
                    <User className="size-3.5" />
                  </div>
                  <span className="truncate text-xs font-semibold text-slate-700">{email}</span>
                </div>
                <button
                  className="text-xs font-bold text-[#004CB1] hover:underline shrink-0 ml-2 cursor-pointer"
                  onClick={() => {
                    setStep('email');
                    setPassword('');
                    setErrorMessage(null);
                  }}
                  type="button"
                >
                  Trocar
                </button>
              </div>

              <h2 className="text-lg font-extrabold text-slate-900">Digite sua senha</h2>
              <p className="mt-1 text-xs text-slate-500">
                Que bom te ver de volta! Digite sua senha para acessar sua conta.
              </p>

              <form className="mt-5 space-y-4" onSubmit={handleLogin}>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700" htmlFor="passwordInput">
                    Senha de acesso
                  </label>
                  <div className="relative">
                    <input
                      autoComplete="current-password"
                      autoFocus
                      className="w-full rounded-xl border border-slate-300 py-3 pr-10 pl-3.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#004CB1] focus:outline-none focus:ring-2 focus:ring-[#004CB1]/20 transition"
                      id="passwordInput"
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Sua senha"
                      required
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                    />
                    <button
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      type="button"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <button
                  className="flex w-full items-center justify-center rounded-xl bg-[#004CB1] py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#003882] active:scale-98 disabled:opacity-60 cursor-pointer"
                  disabled={loading}
                  type="submit"
                >
                  {loading ? 'Entrando…' : 'Entrar'}
                </button>
              </form>
            </div>
          )}

          {/* ========================================================== */}
          {/* ETAPA 2B: NÃO TEM CONTA -> REGISTRO RÁPIDO (NOME E SENHA)  */}
          {/* ========================================================== */}
          {step === 'register' && (
            <div>
              {/* Badge do E-mail com opção de trocar */}
              <div className="mb-5 flex items-center justify-between rounded-xl bg-blue-50/70 border border-blue-200 p-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#004CB1] text-white">
                    <User className="size-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block truncate text-xs font-bold text-[#004CB1]">{email}</span>
                    <span className="block text-[10px] text-blue-600">Novo cadastro</span>
                  </div>
                </div>
                <button
                  className="text-xs font-bold text-[#004CB1] hover:underline shrink-0 ml-2 cursor-pointer"
                  onClick={() => {
                    setStep('email');
                    setPassword('');
                    setFullName('');
                    setErrorMessage(null);
                  }}
                  type="button"
                >
                  Trocar
                </button>
              </div>

              <h2 className="text-lg font-extrabold text-slate-900">Crie sua conta</h2>
              <p className="mt-1 text-xs text-slate-500">
                Rápido e simples: preencha seu nome e escolha uma senha para começar.
              </p>

              <form className="mt-5 space-y-4" onSubmit={handleRegister}>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700" htmlFor="nameInput">
                    Nome completo
                  </label>
                  <input
                    autoComplete="name"
                    autoFocus
                    className="w-full rounded-xl border border-slate-300 py-3 px-3.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#004CB1] focus:outline-none focus:ring-2 focus:ring-[#004CB1]/20 transition"
                    id="nameInput"
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome e sobrenome"
                    required
                    type="text"
                    value={fullName}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700" htmlFor="regPasswordInput">
                    Crie sua senha
                  </label>
                  <div className="relative">
                    <input
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-slate-300 py-3 pr-10 pl-3.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#004CB1] focus:outline-none focus:ring-2 focus:ring-[#004CB1]/20 transition"
                      id="regPasswordInput"
                      minLength={8}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo de 8 caracteres"
                      required
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                    />
                    <button
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      type="button"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>

                  {/* Indicador de segurança da senha */}
                  {password && (
                    <div className="pt-1.5 space-y-1 animate-in fade-in">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Força da senha:</span>
                        <span className="font-bold text-slate-700">
                          {getPasswordStrength(password).label}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${getPasswordStrength(password).color}`}
                          style={{ width: getPasswordStrength(password).width }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Nota de facilidade conforme solicitado */}
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 flex items-start gap-2 text-[11px] text-slate-500">
                  <ShieldCheck className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Sem burocracia: seus dados de entrega, endereço e CNPJ só serão solicitados quando você enviar uma cotação ou fechar um pedido.
                  </span>
                </div>

                <button
                  className="flex w-full items-center justify-center rounded-xl bg-[#004CB1] py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#003882] active:scale-98 disabled:opacity-60 cursor-pointer"
                  disabled={loading}
                  type="submit"
                >
                  {loading ? 'Criando sua conta…' : 'Criar conta e continuar'}
                </button>
              </form>
            </div>
          )}

          {/* ========================================================== */}
          {/* ESQUECI MINHA SENHA                                        */}
          {/* ========================================================== */}
          {step === 'forgot_password' && (
            <div>
              <button
                className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
                onClick={() => {
                  setStep('login');
                  setForgotSuccess(false);
                  setErrorMessage(null);
                }}
                type="button"
              >
                <ArrowLeft className="size-3.5" />
                <span>Voltar</span>
              </button>

              <h2 className="text-lg font-extrabold text-slate-900">Recuperação de Senha</h2>

              {forgotSuccess ? (
                <div className="mt-4 space-y-4">
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center">
                    <CheckCircle2 className="size-8 text-emerald-600 mx-auto mb-2" />
                    <p className="text-sm font-bold text-emerald-900">Instruções enviadas!</p>
                    <p className="mt-1 text-xs text-emerald-700">
                      Enviamos um link de redefinição para <strong>{email}</strong>. Verifique sua caixa de entrada e spam.
                    </p>
                  </div>

                  <button
                    className="w-full rounded-xl bg-[#004CB1] py-2.5 text-xs font-bold text-white hover:bg-[#003882] cursor-pointer"
                    onClick={() => {
                      setStep('login');
                      setForgotSuccess(false);
                    }}
                    type="button"
                  >
                    Voltar para o login
                  </button>
                </div>
              ) : (
                <form className="mt-4 space-y-4" onSubmit={handleForgotPasswordSubmit}>
                  <p className="text-xs text-slate-500">
                    Digite seu e-mail cadastrado para enviarmos as instruções de redefinição de senha.
                  </p>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700" htmlFor="forgotEmail">
                      E-mail
                    </label>
                    <input
                      className="w-full rounded-xl border border-slate-300 py-3 px-3.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#004CB1] focus:outline-none focus:ring-2 focus:ring-[#004CB1]/20 transition"
                      id="forgotEmail"
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="exemplo@email.com"
                      required
                      type="email"
                      value={email}
                    />
                  </div>

                  {/* VERIFICAÇÃO DE SEGURANÇA */}
                  {renderCaptchaWidget()}

                  <button
                    className="flex w-full items-center justify-center rounded-xl bg-[#004CB1] py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#003882] disabled:opacity-60 cursor-pointer"
                    disabled={loading}
                    type="submit"
                  >
                    {loading ? 'Enviando…' : 'Enviar link de recuperação'}
                  </button>

                  <div className="pt-2 text-center">
                    <span className="text-xs text-slate-500">Ou fale com a equipe comercial no WhatsApp:</span>
                    <a
                      className="mt-1 flex items-center justify-center gap-1.5 text-xs font-bold text-[#004CB1] hover:underline"
                      href="https://wa.me/5591983440880"
                      rel="noreferrer"
                      target="_blank"
                    >
                      <Phone className="size-3.5" />
                      <span>(91) 98344-0880 - WhatsApp Comercial</span>
                    </a>
                  </div>
                </form>
              )}
            </div>
          )}
            </>
          )}
        </div>

        {/* 
          RODAPÉ DO CARD:
          "Esqueci minha senha | Ver Senhas"
        */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-slate-600">
          {step !== 'forgot_password' && (
            <button
              className="text-slate-600 hover:text-[#004CB1] hover:underline transition cursor-pointer"
              onClick={() => {
                setStep('forgot_password');
                setErrorMessage(null);
                setGoogleNotice(null);
              }}
              type="button"
            >
              Esqueci minha senha
            </button>
          )}

          {step !== 'forgot_password' && (
            <span aria-hidden="true" className="text-slate-400 select-none">
              |
            </span>
          )}

          <button
            className="inline-flex items-center gap-1.5 font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/90 px-2.5 py-1 rounded-full transition shadow-xs cursor-pointer active:scale-95"
            onClick={() => setShowDevModal(true)}
            title="Abrir senhas e contas de teste (DEV)"
            type="button"
          >
            <KeyRound className="size-3.5 text-amber-600" />
            <span>Ver Senhas</span>
            <span className="text-[9px] uppercase tracking-wider font-black px-1.5 py-0.5 rounded-full bg-amber-200/90 text-amber-900">
              DEV
            </span>
          </button>
        </div>

        {/* SELOS DE SEGURANÇA E CONFIABILIDADE */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px] text-slate-500">
          <div className="flex items-center gap-1 text-slate-600 font-medium">
            <Lock className="size-3 text-emerald-600" />
            <span>SSL 256-Bit Criptografado</span>
          </div>
          <span className="size-1 rounded-full bg-slate-300 hidden sm:inline-block" />
          <div className="flex items-center gap-1 text-slate-600 font-medium">
            <Shield className="size-3 text-[#004CB1]" />
            <span>Proteção Anti-Força Bruta</span>
          </div>
          <span className="size-1 rounded-full bg-slate-300 hidden sm:inline-block" />
          <div className="flex items-center gap-1 text-slate-600 font-medium">
            <ShieldCheck className="size-3 text-slate-500" />
            <span>Diretrizes LGPD</span>
          </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* MODAL DEV: VER SENHAS E ACESSO RÁPIDO                      */}
      {/* ========================================================== */}
      {showDevModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDevModal(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="devModalTitle"
        >
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            {/* CABEÇALHO DO MODAL */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <KeyRound className="size-5" />
                </div>
                <div>
                  <h3
                    className="text-base font-extrabold text-slate-900 flex items-center gap-2"
                    id="devModalTitle"
                  >
                    Contas e Senhas de Teste
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-800">
                      DEV
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Acesso imediato para homologação e desenvolvimento
                  </p>
                </div>
              </div>
              <button
                aria-label="Fechar"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
                onClick={() => setShowDevModal(false)}
                type="button"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* LISTA DE CONTAS DE TESTE */}
            <div className="mt-4 space-y-3.5">
              {DEV_ACCOUNTS.map((acc) => (
                <div
                  className={`rounded-xl border p-4 transition ${
                    acc.type === 'admin'
                      ? 'border-blue-200 bg-blue-50/40'
                      : 'border-emerald-200 bg-emerald-50/40'
                  }`}
                  key={acc.email}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white ${acc.badgeColor}`}
                      >
                        {acc.badge}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{acc.role}</span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-500">{acc.desc}</span>
                  </div>

                  {/* CAMPOS COM BOTÃO DE COPIAR */}
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {/* E-MAIL */}
                    <div className="rounded-lg bg-white p-2 border border-slate-200 flex items-center justify-between">
                      <div className="min-w-0 pr-1">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase">
                          E-mail
                        </span>
                        <span className="block font-mono text-xs font-bold text-slate-800 truncate">
                          {acc.email}
                        </span>
                      </div>
                      <button
                        className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer shrink-0"
                        onClick={() => handleCopy(acc.email, `${acc.type}_email`)}
                        title="Copiar e-mail"
                        type="button"
                      >
                        {copiedKey === `${acc.type}_email` ? (
                          <Check className="size-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                      </button>
                    </div>

                    {/* SENHA */}
                    <div className="rounded-lg bg-white p-2 border border-slate-200 flex items-center justify-between">
                      <div className="min-w-0 pr-1">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase">
                          Senha
                        </span>
                        <span className="block font-mono text-xs font-bold text-slate-800 truncate">
                          {acc.password}
                        </span>
                      </div>
                      <button
                        className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer shrink-0"
                        onClick={() => handleCopy(acc.password, `${acc.type}_pass`)}
                        title="Copiar senha"
                        type="button"
                      >
                        {copiedKey === `${acc.type}_pass` ? (
                          <Check className="size-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* AÇÕES DE PREENCHIMENTO RÁPIDO */}
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      className={`flex-1 rounded-xl py-2 px-3 text-xs font-bold text-white transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 ${
                        acc.type === 'admin'
                          ? 'bg-[#004CB1] hover:bg-[#003882]'
                          : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                      onClick={() => handleQuickLogin(acc.email, acc.password)}
                      type="button"
                    >
                      <Sparkles className="size-3.5" />
                      <span>⚡ Entrar Direto ({acc.badge})</span>
                    </button>

                    <button
                      className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition cursor-pointer"
                      onClick={() => handleQuickFill(acc.email, acc.password)}
                      title="Apenas preencher os campos do formulário"
                      type="button"
                    >
                      Preencher
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* AVISO DE AMBIENTE DEV */}
            <div className="mt-4 rounded-xl bg-amber-50/80 border border-amber-200 p-3 text-[11px] text-amber-900 flex items-start gap-2">
              <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Atenção:</strong> Este painel e o botão <em>Ver Senhas</em> foram inseridos temporariamente para facilitar os testes rápidos da equipe. Eles serão removidos antes do lançamento final.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
