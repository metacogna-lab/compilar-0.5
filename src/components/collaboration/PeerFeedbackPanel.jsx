import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Star, ThumbsUp, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export default function PeerFeedbackPanel({ 
  feedbackRequests = [], 
  receivedFeedback = [], 
  currentUser,
  onProvideFeedback,
  onRateFeedback
}) {
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingRequests = feedbackRequests.filter(f => 
    f.provider_email === currentUser?.email && f.status === 'requested'
  );

  const handleSubmit = async (request) => {
    if (!feedbackText.trim()) return;
    setIsSubmitting(true);
    await onProvideFeedback(request.id, feedbackText);
    setFeedbackText('');
    setExpandedRequest(null);
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-4">
      {/* Pending Feedback Requests */}
      {pendingRequests.length > 0 && (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-violet-400" />
            Feedback Requests ({pendingRequests.length})
          </h3>
          <div className="space-y-3">
            {pendingRequests.map((request, i) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-3 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-white capitalize">
                      {request.feedback_type} feedback
                    </p>
                    <p className="text-xs text-zinc-500">
                      from {request.requester_email.split('@')[0]}
                    </p>
                  </div>
                  {request.target_pillar && (
                    <span className={`px-2 py-1 rounded-full bg-violet-500/20 text-violet-400 text-xs capitalize`}>
                      {request.target_pillar}
                    </span>
                  )}
                </div>

                {request.request_message && (
                  <p className="text-sm text-zinc-300 mb-3 italic">"{request.request_message}"</p>
                )}

                {expandedRequest === request.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Provide constructive feedback..."
                      className="bg-white/5 border-white/10 text-white min-h-[100px]"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSubmit(request)}
                        disabled={isSubmitting || !feedbackText.trim()}
                        className="bg-violet-500 hover:bg-violet-600"
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Send
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setExpandedRequest(null)}
                        className="text-zinc-400"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setExpandedRequest(request.id)}
                    className="bg-white/10 hover:bg-white/20 text-white"
                  >
                    Provide Feedback
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Received Feedback */}
      {receivedFeedback.length > 0 && (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            Your Feedback ({receivedFeedback.length})
          </h3>
          <div className="space-y-3">
            {receivedFeedback.map((feedback, i) => (
              <motion.div
                key={feedback.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-3 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {feedback.provider_email.split('@')[0]}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {new Date(feedback.provided_at).toLocaleDateString()}
                    </p>
                  </div>
                  {feedback.target_pillar && (
                    <span className={`px-2 py-1 rounded-full bg-violet-500/20 text-violet-400 text-xs capitalize`}>
                      {feedback.target_pillar}
                    </span>
                  )}
                </div>

                <p className="text-sm text-zinc-300 mb-3">{feedback.feedback_content}</p>

                {feedback.status !== 'acknowledged' && (
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        onClick={() => onRateFeedback(feedback.id, rating)}
                        className="hover:scale-110 transition-transform"
                      >
                        <Star 
                          className={cn(
                            "w-4 h-4",
                            feedback.rating >= rating ? "fill-amber-400 text-amber-400" : "text-zinc-600"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}