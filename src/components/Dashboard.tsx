import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Crown, 
  Calendar, 
  Send, 
  MessageCircle, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

interface DashboardProps {
  userData: any;
  onBack: () => void;
  onSubscribe: () => void;
}

const PLAN_NAMES: Record<string, string> = {
  'monthly': 'Monthly Elite',
  'six-monthly': 'Pro Trader',
  'yearly': 'The Guru Masterclass'
};

export default function Dashboard({ userData, onBack, onSubscribe }: DashboardProps) {
  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="w-8 h-8 border-4 border-fintech-neon border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isActive = userData.subscriptionStatus === 'active';
  const expiryDate = userData.subscriptionExpiry 
    ? new Date(userData.subscriptionExpiry).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric'
      })
    : 'N/A';

  const planName = userData.subscriptionPlan ? PLAN_NAMES[userData.subscriptionPlan] || userData.subscriptionPlan : 'No Active Plan';

  return (
    <div className="min-h-screen pt-28 pb-20 px-6 max-w-7xl mx-auto">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-fintech-muted hover:text-white transition-colors mb-8"
      >
        <ArrowLeft size={20} />
        <span>Back to Home</span>
      </button>

      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
          Welcome back, <span className="text-fintech-neon">{userData.name.split(' ')[0]}</span>
        </h1>
        <p className="text-fintech-muted">Manage your subscription and access your VIP benefits.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Subscription Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-fintech-card border border-fintech-border rounded-2xl p-6 md:p-8 shadow-lg relative overflow-hidden"
        >
          {isActive && (
            <div className="absolute top-0 right-0 w-32 h-32 bg-fintech-neon/10 blur-[50px] rounded-full pointer-events-none"></div>
          )}
          
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Crown className={isActive ? "text-fintech-neon" : "text-fintech-muted"} size={24} />
              Subscription Details
            </h2>
            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isActive ? 'bg-fintech-neon/10 text-fintech-neon border border-fintech-neon/30' : 'bg-red-500/10 text-red-500 border border-red-500/30'
            }`}>
              {isActive ? 'Active' : 'Inactive'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-fintech-bg rounded-xl p-5 border border-fintech-border">
              <div className="text-sm text-fintech-muted mb-1">Current Plan</div>
              <div className="text-lg font-bold text-white">{planName}</div>
            </div>
            <div className="bg-fintech-bg rounded-xl p-5 border border-fintech-border">
              <div className="text-sm text-fintech-muted mb-1 flex items-center gap-2">
                <Calendar size={14} /> Expiry Date
              </div>
              <div className="text-lg font-bold text-white">{expiryDate}</div>
            </div>
          </div>

          {!isActive ? (
            <div className="bg-fintech-bg border border-fintech-border rounded-xl p-6 text-center">
              <AlertTriangle className="text-yellow-500 mx-auto mb-3" size={32} />
              <h3 className="text-lg font-bold mb-2">No Active Subscription</h3>
              <p className="text-fintech-muted text-sm mb-6">Subscribe to a VIP plan to get daily high-probability signals and exclusive market analysis.</p>
              <button 
                onClick={onSubscribe}
                className="bg-fintech-neon text-fintech-bg px-8 py-3 rounded-lg font-bold hover:bg-[#00e65c] transition-all shadow-[0_0_15px_rgba(0,255,102,0.2)]"
              >
                View Plans
              </button>
            </div>
          ) : (
            <div className="bg-fintech-neon/5 border border-fintech-neon/20 rounded-xl p-6 flex items-start gap-4">
              <CheckCircle2 className="text-fintech-neon shrink-0 mt-1" size={24} />
              <div>
                <h3 className="text-lg font-bold text-white mb-1">You're all set!</h3>
                <p className="text-fintech-muted text-sm">Your subscription is active. Make sure you have joined the VIP Telegram channel to receive your daily signals.</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Quick Links & Profile */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-fintech-card border border-fintech-border rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-lg font-bold mb-6">Quick Actions</h2>
            <div className="space-y-4">
              <a 
                href={isActive ? "https://t.me/placeholder_vip_link" : "#"} 
                target={isActive ? "_blank" : "_self"}
                rel="noreferrer"
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                  isActive 
                    ? 'bg-[#0088cc]/10 border-[#0088cc]/30 hover:bg-[#0088cc]/20 text-white' 
                    : 'bg-fintech-bg border-fintech-border text-fintech-muted cursor-not-allowed opacity-70'
                }`}
                onClick={(e) => {
                  if (!isActive) {
                    e.preventDefault();
                    alert("Please subscribe to a plan to access the VIP Telegram channel.");
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <Send size={20} className={isActive ? "text-[#0088cc]" : ""} />
                  <span className="font-medium">Join VIP Channel</span>
                </div>
                {isActive && <div className="w-2 h-2 rounded-full bg-fintech-neon animate-pulse"></div>}
              </a>

              <a 
                href="https://t.me/TheCapitalGuruSupport?text=I%20want%20to%20join%20Capital%20Guru%20VIP" 
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-between p-4 rounded-xl border border-fintech-border bg-fintech-bg hover:border-[#0088cc] hover:bg-[#0088cc]/10 text-white transition-all"
              >
                <div className="flex items-center gap-3">
                  <Send size={20} className="text-[#0088cc]" />
                  <span className="font-medium">Contact Support</span>
                </div>
              </a>
            </div>
          </motion.div>

          {/* Profile Details */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-fintech-card border border-fintech-border rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <User size={20} className="text-fintech-neon" />
              Profile Details
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-fintech-muted mt-1 shrink-0" />
                <div>
                  <div className="text-xs text-fintech-muted uppercase tracking-wider font-bold mb-0.5">Email</div>
                  <div className="text-sm text-white break-all">{userData.email}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={16} className="text-fintech-muted mt-1 shrink-0" />
                <div>
                  <div className="text-xs text-fintech-muted uppercase tracking-wider font-bold mb-0.5">Mobile</div>
                  <div className="text-sm text-white">{userData.mobileNumber}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Send size={16} className="text-fintech-muted mt-1 shrink-0" />
                <div>
                  <div className="text-xs text-fintech-muted uppercase tracking-wider font-bold mb-0.5">Telegram</div>
                  <div className="text-sm text-white">{userData.telegramUsername}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-fintech-muted mt-1 shrink-0" />
                <div>
                  <div className="text-xs text-fintech-muted uppercase tracking-wider font-bold mb-0.5">Address</div>
                  <div className="text-sm text-white">{userData.address}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
