'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Save, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

export default function DadosPessoaisPage() {
  const { user, updateProfile } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [document, setDocument] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Inicializa o formulário com os dados atuais do usuário
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setDocument(user.document || '');
      setBirthDate(user.birthDate || '');
    }
  }, [user]);

  // Função para aplicar máscara de CPF/CNPJ
  function formatDocument(value: string) {
    const clean = value.replace(/\D/g, '');
    if (clean.length <= 11) {
      // CPF: 000.000.000-00
      return clean
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    // CNPJ: 00.000.000/0000-00
    return clean
      .slice(0, 14)
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();

    if (!trimmedFirst) {
      setErrorMessage('Por favor, informe seu primeiro nome.');
      return;
    }

    setSaving(true);
    try {
      const result = await updateProfile({
        firstName: trimmedFirst,
        lastName: trimmedLast,
        fullName: `${trimmedFirst} ${trimmedLast}`.trim(),
        document: document.trim(),
        birthDate: birthDate.trim(),
      });

      if (!result.ok) {
        setErrorMessage(result.error || 'Erro ao salvar alterações.');
      } else {
        setSuccessMessage('Dados pessoais atualizados com sucesso! Seu nome foi atualizado em todo o site.');
        // Limpa o aviso de sucesso após 5 segundos
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch {
      setErrorMessage('Erro de conexão ao salvar alterações. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  const previewFullName = `${firstName.trim()} ${lastName.trim()}`.trim() || 'Seu Nome';
  const previewFirst = firstName.trim() || 'Você';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* CABEÇALHO DA SEÇÃO */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-[#004CB1]">
            <User className="size-6 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Dados Pessoais</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Altere seu nome de exibição, sobrenome e documentos cadastrais da conta Comercial do Norte.
            </p>
          </div>
        </div>

        {/* PRÉ-VISUALIZAÇÃO EM TEMPO REAL */}
        <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-200/70">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#004CB1] text-base font-black text-white shadow-xs">
              {previewFirst.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <span className="block text-[11px] font-bold text-slate-500">Pré-visualização no site:</span>
              <strong className="block truncate text-sm font-bold text-slate-800">
                Olá, {previewFirst} · ({previewFullName})
              </strong>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center rounded-full bg-blue-100/70 px-2.5 py-1 text-[11px] font-bold text-[#004CB1]">
            Atualização em tempo real
          </span>
        </div>
      </div>

      {/* FEEDBACK DE SUCESSO OU ERRO */}
      {successMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-sm text-emerald-800 animate-in fade-in duration-200">
          <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-sm text-rose-800 animate-in fade-in duration-200">
          <AlertCircle className="size-5 shrink-0 text-rose-600" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* FORMULÁRIO DE EDIÇÃO */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          {/* PRIMEIRO NOME */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700" htmlFor="firstName">
              Primeiro Nome <span className="text-rose-500">*</span>
            </label>
            <input
              id="firstName"
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#004CB1] focus:ring-2 focus:ring-[#004CB1]/20 focus:outline-hidden transition"
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Ex: Victor"
              required
              type="text"
              value={firstName}
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Este é o nome que aparece na saudação do topo (&quot;Olá, {previewFirst}&quot;).
            </p>
          </div>

          {/* SOBRENOME */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700" htmlFor="lastName">
              Sobrenome / Família
            </label>
            <input
              id="lastName"
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#004CB1] focus:ring-2 focus:ring-[#004CB1]/20 focus:outline-hidden transition"
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Ex: Williames"
              type="text"
              value={lastName}
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Utilizado para emissão de notas fiscais e cotações formais.
            </p>
          </div>

          {/* CPF OU CNPJ */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700" htmlFor="document">
              CPF ou CNPJ
            </label>
            <input
              id="document"
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#004CB1] focus:ring-2 focus:ring-[#004CB1]/20 focus:outline-hidden transition"
              onChange={(e) => setDocument(formatDocument(e.target.value))}
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
              type="text"
              value={document}
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Para faturamento corporativo com condições especiais de atacado.
            </p>
          </div>

          {/* DATA DE NASCIMENTO */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700" htmlFor="birthDate">
              Data de Nascimento
            </label>
            <input
              id="birthDate"
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#004CB1] focus:ring-2 focus:ring-[#004CB1]/20 focus:outline-hidden transition"
              onChange={(e) => setBirthDate(e.target.value)}
              type="date"
              value={birthDate}
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Para benefícios exclusivos de aniversário no Clube Comercial do Norte.
            </p>
          </div>
        </div>

        {/* NOTA DE PRIVACIDADE E SEGURANÇA */}
        <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 border border-slate-100 text-xs text-slate-600">
          <ShieldCheck className="size-5 text-[#004CB1] shrink-0 mt-0.5" />
          <span>
            Seus dados são protegidos conforme a LGPD e utilizados exclusivamente para identificação e cotação de produtos na Comercial do Norte.
          </span>
        </div>

        {/* BOTÃO SALVAR */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#004CB1] px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#003882] active:scale-98 transition cursor-pointer disabled:opacity-60"
            disabled={saving}
            type="submit"
          >
            <Save className="size-4" />
            <span>{saving ? 'Salvando alterações…' : 'Salvar alterações'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
