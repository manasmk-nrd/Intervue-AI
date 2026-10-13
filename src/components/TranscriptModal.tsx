import React from 'react';
import { X, Clock, User, Bot, FileText } from 'lucide-react';
import { InterviewSession } from '../types/interview';

interface TranscriptModalProps {
  session: InterviewSession;
  onClose: () => void;
}

export const TranscriptModal: React.FC<TranscriptModalProps> = ({ session, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="flex flex-col h-[85vh] w-full max-w-3xl rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4 bg-neutral-950">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-400" />
              <span>Full Interview Transcript</span>
            </h3>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span className="text-white font-medium">{session.config.subject}</span>
              <span aria-hidden="true">·</span>
              <span>{new Date(session.startedAt).toLocaleDateString()}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Conversation stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-neutral-950/70">
          {session.messages.map((msg) => {
            const isAI = msg.sender === 'interviewer';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 sm:gap-4 ${isAI ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 space-y-2 text-xs sm:text-sm leading-relaxed ${
                    isAI
                      ? 'border border-neutral-800 bg-neutral-900 text-neutral-100'
                      : 'border border-indigo-500/40 bg-indigo-950/40 text-neutral-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-[11px] text-neutral-400 border-b border-neutral-850 pb-2">
                    <span className="font-semibold text-neutral-300">
                      {isAI ? 'Interviewer' : 'Candidate'}
                    </span>
                    <span className="font-mono tabular-nums">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="whitespace-pre-wrap leading-relaxed text-[13px] sm:text-sm">
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-800 px-6 py-3 bg-neutral-950 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-neutral-800 hover:bg-neutral-750 px-4 py-2 text-xs font-semibold text-neutral-200"
          >
            Close Transcript
          </button>
        </div>
      </div>
    </div>
  );
};
