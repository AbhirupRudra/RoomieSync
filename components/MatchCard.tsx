
import React, { useState } from 'react';
import { MatchResult, UserProfile, RequestStatus } from '../types';
import { getCompatibilityInsight } from '../services/geminiService';
import { sendRoommateRequest } from '../services/firebaseService';

interface MatchCardProps {
  match: MatchResult;
  currentUser: UserProfile;
  requestStatus?: RequestStatus;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, currentUser, requestStatus }) => {
  const [insight, setInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [localStatus, setLocalStatus] = useState<RequestStatus | undefined>(requestStatus);

  const fetchInsight = async () => {
    setLoadingInsight(true);
    const text = await getCompatibilityInsight(currentUser, match);
    setInsight(text);
    setLoadingInsight(false);
  };

  const handleSendRequest = async () => {
    setSendingRequest(true);
    try {
      await sendRoommateRequest(currentUser.id, match.id);
      setLocalStatus(RequestStatus.PENDING);
    } catch (e) {
      console.error("Failed to send request", e);
    } finally {
      setSendingRequest(false);
    }
  };

  const scoreColor = match.score > 80 ? 'text-emerald-600 bg-emerald-50' : 
                   match.score > 60 ? 'text-amber-600 bg-amber-50' : 
                   'text-rose-600 bg-rose-50';

  const isSent = localStatus === RequestStatus.PENDING;
  const isAccepted = localStatus === RequestStatus.ACCEPTED;

  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all group">
      <div className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-5">
            <img 
              src={match.avatar} 
              alt={match.name} 
              className="w-16 h-16 rounded-full object-cover border-4 border-slate-50 shadow-inner group-hover:scale-105 transition-transform"
            />
            <div>
              <h3 className="text-xl font-bold text-slate-900">{match.name}, {match.age}</h3>
              <p className="text-sm text-slate-400 font-semibold uppercase tracking-wider">{match.occupation}</p>
            </div>
          </div>
          <div className={`px-4 py-3 rounded-2xl flex flex-col items-center min-w-[70px] ${scoreColor}`}>
            <span className="text-2xl font-black leading-none">{match.score}%</span>
            <span className="text-[9px] uppercase font-bold tracking-widest mt-1">Match</span>
          </div>
        </div>

        <p className="text-slate-500 text-sm leading-relaxed mb-8 italic line-clamp-2">
          "{match.bio || 'No bio provided yet.'}"
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 bg-slate-50 px-3 py-2 rounded-xl">
             {match.lifestyle.smoking ? '💨 Smoker' : '🚭 Non-smoker'}
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 bg-slate-50 px-3 py-2 rounded-xl">
             {match.lifestyle.pets ? '🐾 Pet friendly' : '🚫 No pets'}
          </div>
        </div>

        <div className="space-y-3">
          {isAccepted ? (
            <div className="w-full py-4 bg-emerald-500 text-white rounded-[20px] font-bold text-sm text-center shadow-lg shadow-emerald-200">
              🤝 Connected
            </div>
          ) : isSent ? (
            <button disabled className="w-full py-4 bg-slate-100 text-slate-400 rounded-[20px] font-bold text-sm">
              Request Sent
            </button>
          ) : (
            <button 
              onClick={handleSendRequest}
              disabled={sendingRequest}
              className="w-full py-4 bg-[#5246f2] text-white rounded-[20px] font-bold text-sm hover:bg-[#4338ca] transition-all active:scale-[0.98] shadow-lg shadow-indigo-100"
            >
              {sendingRequest ? 'Sending...' : 'Request to Room'}
            </button>
          )}

          {insight ? (
            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-indigo-600 text-xs">✨</span>
                <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">AI Analysis</h4>
              </div>
              <p className="text-xs text-indigo-800 leading-relaxed italic">{insight}</p>
            </div>
          ) : (
            <button 
              onClick={fetchInsight}
              disabled={loadingInsight}
              className="w-full py-3 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors"
            >
              {loadingInsight ? 'Consulting AI...' : 'Why are we a match?'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
