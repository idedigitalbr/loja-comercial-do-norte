'use client';

import { useState, useEffect } from 'react';
import {
  AlertCircle,
  AtSign,
  CheckCircle2,
  KeyRound,
  Lock,
  Phone,
  Save,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

export default function ContatoSegurancaPage() {
  const { user, updateProfile, changePassword } = useAuth();

  // Estados de Contato (E-mail e Telefone)
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [savingContact, setSavingContact] = useState(false);
  const [contactSuccess, setContactSuccess] = useState<string | null>(null);
  const [contactError, setContactError] = useState<string | null>(null);

  // Estados de Senha
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  // Aplica máscara de telefone (91) 98344-0880
  function formatPhone(value: string) {
    const clean = value.replace(/\D/g, '').slice(0, 11);
    if (clean.length <= 10) {
      return clean
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return clean
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  }

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    setContactSuccess(null);
    setContactError(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setContactError('Por favor, informe um endereço de e-mail válido.');
      return;
    }

    setSavingContact(true);
    try {
      const result = await updateProfile({
        email: trimmedEmail,
        phone: trimmedPhone,
      });

      if (!result.ok) {
        setContactError(result.error || 'Não foi possível atualizar o contato.');
      } else {
        setContactSuccess('E-mail e telefone atualizados com sucesso!');
        setTimeout(() => setContactSuccess(null), 5000);
      }
    } catch {
      setContactError('Erro de conexão ao salvar contato. Tente novamente.');
    } finally {
      setSavingContact(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError('Informe sua senha atual.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('A nova senha deve possuir no mínimo 8 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('A confirmação da nova senha não confere.');
      return;
    }

    setSavingPassword(true);
    try {
      const result = await changePassword(currentPassword, newPassword);
      if (!result.ok) {
        setPasswordError(result.error || 'Não foi possível alterar a senha.');
      } else {
        setPasswordSuccess('Sua senha foi alterada com sucesso!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(null), 5000);
      }
    } catch {
      setPasswordError('Erro de conexão ao alterar a senha. Tente novamente.');
    } finally {
      setSavingPassword(false);
    }
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* CARD 01: E-MAIL E TELEFONE */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <AtSign className="size-6 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Alterar E-mail ou Telefone</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Dados para recebimento de orçamentos, propostas de cotação e acesso à sua conta.
            </p>
          </div>
        </div>

        {contactSuccess && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-sm text-emerald-800 animate-in fade-in duration-200">
            <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
            <span className="font-semibold">{contactSuccess}</span>
          </div>
        )}

        {contactError && (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-sm text-rose-800 animate-in fade-in duration-200">
            <AlertCircle className="size-5 shrink-0 text-rose-600" />
            <span className="font-semibold">{contactError}</span>
          </div>
        )}

        <form onSubmit={handleContactSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            {/* E-MAIL */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700" htmlFor="email">
                E-mail de Acesso <span className="text-rose-500">*</span>
              </label>
              <div className="relative mt-1.5">
                <input
                  id="email"
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#004CB1] focus:ring-2 focus:ring-[#004CB1]/20 focus:outline-hidden transition"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@empresa.com.br"
                  required
                  type="email"
                  value={email}
                />
                <AtSign className="absolute left-3.5 top-3 size-4 text-slate-400" />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Usado para login e envio de resumos de cotações.
              </p>
            </div>

            {/* TELEFONE / WHATSAPP */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700" htmlFor="phone">
                WhatsApp Principal <span className="text-rose-500">*</span>
              </label>
              <div className="relative mt-1.5">
                <input
                  id="phone"
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#004CB1] focus:ring-2 focus:ring-[#004CB1]/20 focus:outline-hidden transition"
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="(91) 98344-0880"
                  type="tel"
                  value={phone}
                />
                <Phone className="absolute left-3.5 top-3 size-4 text-slate-400" />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                O time comercial da Comercial do Norte responde sua cotação por aqui.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#004CB1] px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#003882] active:scale-98 transition cursor-pointer disabled:opacity-60"
              disabled={savingContact}
              type="submit"
            >
              <Save className="size-4" />
              <span>{savingContact ? 'Salvando contato…' : 'Salvar contato'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* CARD 02: SEGURANÇA E ALTERAÇÃO DE SENHA */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-[#004CB1]">
            <Lock className="size-6 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Alterar Senha de Acesso</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Mantenha sua conta protegida atualizando sua senha periodicamente.
            </p>
          </div>
        </div>

        {passwordSuccess && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-sm text-emerald-800 animate-in fade-in duration-200">
            <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
            <span className="font-semibold">{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-sm text-rose-800 animate-in fade-in duration-200">
            <AlertCircle className="size-5 shrink-0 text-rose-600" />
            <span className="font-semibold">{passwordError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700" htmlFor="currentPassword">
              Senha Atual
            </label>
            <div className="relative mt-1.5">
              <input
                id="currentPassword"
                className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#004CB1] focus:ring-2 focus:ring-[#004CB1]/20 focus:outline-hidden transition"
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Digite sua senha atual"
                type="password"
                value={currentPassword}
              />
              <KeyRound className="absolute left-3.5 top-3 size-4 text-slate-400" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700" htmlFor="newPassword">
                Nova Senha (mínimo 8 caracteres)
              </label>
              <div className="relative mt-1.5">
                <input
                  id="newPassword"
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#004CB1] focus:ring-2 focus:ring-[#004CB1]/20 focus:outline-hidden transition"
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nova senha segura"
                  type="password"
                  value={newPassword}
                />
                <Lock className="absolute left-3.5 top-3 size-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700" htmlFor="confirmPassword">
                Confirmar Nova Senha
              </label>
              <div className="relative mt-1.5">
                <input
                  id="confirmPassword"
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#004CB1] focus:ring-2 focus:ring-[#004CB1]/20 focus:outline-hidden transition"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  type="password"
                  value={confirmPassword}
                />
                <Lock className="absolute left-3.5 top-3 size-4 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-100 px-6 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200 active:scale-98 transition cursor-pointer disabled:opacity-60"
              disabled={savingPassword}
              type="submit"
            >
              <KeyRound className="size-4" />
              <span>{savingPassword ? 'Atualizando senha…' : 'Atualizar senha'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
