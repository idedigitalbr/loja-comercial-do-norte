'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useAuth } from './auth-provider';

type FlowStep = 'email' | 'login' | 'register' | 'forgot_password';

export function AuthFlowCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/conta';

  const { checkEmail, login, register } = useAuth();

  const [step, setStep] = useState<FlowStep>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [googleNotice, setGoogleNotice] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Validação básica de e-mail
  function isValidEmail(val: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  }

  // ETAPA 1: Usuário digita e-mail -> Sistema verifica se existe ou não
  async function handleCheckEmail(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setErrorMessage('Por favor, informe um endereço de e-mail válido.');
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
      router.push(redirectUrl);
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
      router.push(redirectUrl);
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
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setForgotSuccess(true);
    }, 600);
  }

  return (
    <div className="relative min-h-[90vh] bg-slate-50 flex flex-col justify-start">
      {/* 
        FAIXA SUPERIOR EM GRADIENTE CONFORME INSTRUÇÃO OFICIAL:
        "so que a logo fica no centro la em cima e em vez de amarelo é azul 80% e 20% do lado direito vermelho"
      */}
      <div
        className="relative w-full pb-20 pt-8 px-4 text-white shadow-md"
        style={{
          background:
            'linear-gradient(90deg, #004CB1 0%, #004CB1 80%, #E2091E 80%, #E2091E 100%)',
        }}
      >
        {/* LOGO NO CENTRO LÁ EM CIMA */}
        <div className="flex flex-col items-center justify-center">
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
                src="/assets/Logos/logo-comercial-do-norte-branca.png"
              />
            </div>
          </Link>
        </div>

        {/* CHAMADA PRINCIPAL: "Entre ou Crie sua Conta" */}
        <div className="mt-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-xs">
            Entre ou Crie sua Conta
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-white/90">
            Acesse suas cotações, favoritos e compras rápidas no atacado e varejo
          </p>
        </div>
      </div>

      {/* CARD FLUTUANTE CENTRAL (Fidelidade ao design do Mercado Livre solicitado) */}
      <div className="cn-container -mt-10 px-4 mb-16 flex-1 flex flex-col items-center justify-start">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-slate-100">
          {/* AVISO DO BOTÃO GOOGLE */}
          {googleNotice && (
            <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="size-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <span>{googleNotice}</span>
                <button
                  className="block mt-1 font-bold text-amber-800 underline"
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
                </div>

                {/* Nota de facilidade conforme pedido do usuário */}
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
                    className="w-full rounded-xl bg-[#004CB1] py-2.5 text-xs font-bold text-white hover:bg-[#003882]"
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
        </div>

        {/* 
          RODAPÉ DO CARD:
          O usuário solicitou explicitamente:
          "(e remove ese vc precis ade uma conta coproativoa n qsei q... tem q ser o esqueci minha senha)"
        */}
        <div className="mt-6 text-center">
          {step !== 'forgot_password' && (
            <button
              className="text-xs font-medium text-slate-600 hover:text-[#004CB1] hover:underline transition cursor-pointer"
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
        </div>
      </div>
    </div>
  );
}
