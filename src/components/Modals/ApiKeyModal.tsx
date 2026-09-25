import React, { useState } from 'react';
import { Key, X, CheckCircle2, AlertCircle, Shield, ExternalLink, Sparkles } from 'lucide-react';
import { api } from '../../services/api';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  isDemoMode,
  onToggleDemoMode,
}) => {
  const [inputKey, setInputKey] = useState(apiKey);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    valid?: boolean;
    message?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleVerify = async () => {
    if (!inputKey.trim()) {
      setVerificationResult({ valid: false, message: 'Please enter an API key to verify.' });
      return;
    }
    setIsVerifying(true);
    setVerificationResult(null);
    try {
      const res = await api.verifyApiKey(inputKey.trim());
      setVerificationResult({ valid: res.valid, message: res.message });
      if (res.valid) {
        onSaveApiKey(inputKey.trim());
      }
    } catch (e: any) {
      setVerificationResult({ valid: false, message: e.message || 'Verification failed.' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSave = () => {
    onSaveApiKey(inputKey.trim());
    onClose();
  };

  const handleClear = () => {
    setInputKey('');
    onSaveApiKey('');
    setVerificationResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Key className="w-5 h-5 text-amber-400" />
            </span>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">
                Google Gemini API Setup
              </h3>
              <p className="text-xs text-slate-400">
                Configure your API key or use full-fidelity Demo Mode.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Google Gemini API Key:
            </label>
            <input
              type="password"
              value={inputKey}
              onChange={(e) => {
                setInputKey(e.target.value);
                setVerificationResult(null);
              }}
              placeholder="AIzaSy..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          {/* Verification feedback */}
          {verificationResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                verificationResult.valid
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {verificationResult.valid ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              )}
              <span>{verificationResult.message}</span>
            </div>
          )}

          {/* Get Key Link */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>Don't have a Gemini API key?</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
            >
              <span>Get Free Key in AI Studio</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Demo Mode Toggle Banner */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4">
            <div>
              <div className="font-heading font-semibold text-xs text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Demo Mode</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Explore the complete UI without an API key using the Carlyle Library sample mystery.
              </p>
            </div>
            <button
              type="button"
              onClick={onToggleDemoMode}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                isDemoMode
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              {isDemoMode ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {/* Security Notice */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-[11px] text-indigo-300">
            <Shield className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
            <span>
              <strong>Security Guarantee:</strong> Your API key is never exposed publicly. It is processed securely by the FastAPI backend to interact with Google Gemini.
            </span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-rose-400 hover:text-rose-300 font-medium"
          >
            Clear Key
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isVerifying || !inputKey.trim()}
              onClick={handleVerify}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-50"
            >
              {isVerifying ? 'Verifying...' : 'Test Connection'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-indigo"
            >
              Save Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
