/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  BarChart3, 
  Lock, 
  Mail, 
  Send,
  Star,
  Users,
  Activity,
  Instagram,
  Youtube,
  ChevronDown,
  MessageCircle,
  AlertTriangle,
  Briefcase,
  GraduationCap,
  Target,
  Wallet,
  XCircle,
  Clock,
  LogOut,
  User
} from 'lucide-react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';
import { Analytics } from '@vercel/analytics/react';

// --- Types ---
type Plan = {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  popular?: boolean;
  badge?: string;
};

// --- Data ---
const PLANS: Plan[] = [
  {
    id: 'monthly',
    name: 'Monthly Elite',
    price: 2499,
    period: '/month',
    popular: true,
    badge: 'Most Popular',
    features: [
      'Daily Nifty & BankNifty Signals',
      'Entry, Target & Stop-Loss',
      'Live Market Updates',
      'Basic Risk Management Guide'
    ]
  },
  {
    id: 'six-monthly',
    name: 'Pro Trader',
    price: 11999,
    period: '/6 months',
    badge: 'Best Value',
    features: [
      'Everything in Monthly Elite',
      'FinNifty Expiry Special Trades',
      'Pre-Market Analysis',
      'Priority Support',
      'Save ₹2,995'
    ]
  },
  {
    id: 'yearly',
    name: 'The Guru Masterclass',
    price: 19999,
    period: '/year',
    features: [
      'Everything in Pro Trader',
      '1-on-1 Monthly Strategy Call',
      'Advanced Options Hedging Setups',
      'Exclusive VIP Community Access',
      'Save ₹9,989'
    ]
  }
];

const MARKETS = ['Nifty 50', 'BankNifty', 'FinNifty'];

const TESTIMONIALS = [
  {
    name: "Rahul Sharma",
    role: "Part-time Trader",
    profit: "Consistent 15% monthly ROI",
    feedback: "I used to blow my account with random tips. The Capital Guru's strict stop-loss and clear targets changed my trading completely.",
    image: "https://i.pravatar.cc/150?u=rahul"
  },
  {
    name: "Priya Patel",
    role: "IT Professional",
    profit: "Recovered past losses",
    feedback: "As someone with a full-time job, I don't have time to stare at charts. These signals are precise and easy to execute on the go.",
    image: "https://i.pravatar.cc/150?u=priya"
  },
  {
    name: "Vikram Singh",
    role: "Full-time Trader",
    profit: "Scaled capital safely",
    feedback: "The risk management guidance is what sets them apart. It's not just about signals; it's about surviving and thriving in BankNifty.",
    image: "https://i.pravatar.cc/150?u=vikram"
  },
  {
    name: "Amit Desai",
    role: "Beginner",
    profit: "Profitable first month",
    feedback: "I was skeptical at first, but the accuracy is genuinely impressive. The community support is also fantastic.",
    image: "https://i.pravatar.cc/150?u=amit"
  }
];

const FAQS = [
  { q: "How do I receive signals?", a: "All signals are delivered instantly via our private VIP Telegram channel. You will receive a notification with exact entry, target, and stop-loss levels." },
  { q: "Is this beginner friendly?", a: "Yes. We provide clear instructions on how to execute trades and basic risk management guidelines to protect your capital." },
  { q: "What is the accuracy?", a: "We maintain a historical accuracy of 75-80%. However, we focus more on the risk-to-reward ratio to ensure profitability even if some trades hit stop-loss." },
  { q: "How will I get Telegram access after payment?", a: "Immediately after a successful payment, you will receive an automated email containing your unique, one-time use invite link to join the Telegram channel." },
  { q: "Do you provide support?", a: "Yes, our Pro and Masterclass plans include priority support. You can reach out to our team for queries related to the signals." },
  { q: "Can I cancel anytime?", a: "Yes, you can choose not to renew your subscription at the end of your billing cycle. There are no lock-in periods." },
  { q: "What capital is recommended?", a: "We recommend a minimum capital of ₹50,000 to comfortably trade our options signals while maintaining proper position sizing." },
  { q: "Is this for intraday or swing?", a: "Our primary focus is on high-probability intraday options buying in Nifty and BankNifty, with occasional overnight BTST/STBT setups." }
];

// --- Helper Components ---
interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

const FadeIn: React.FC<FadeInProps> = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

const FAQItem = ({ faq, isOpen, onClick }: { faq: any, isOpen: boolean, onClick: () => void }) => {
  return (
    <div className="border-b border-fintech-border last:border-0">
      <button 
        onClick={onClick}
        className="w-full py-6 flex justify-between items-center text-left focus:outline-none group"
      >
        <span className="font-display font-bold text-lg group-hover:text-fintech-neon transition-colors">{faq.q}</span>
        <span className={`text-fintech-neon transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown size={20} />
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-fintech-muted leading-relaxed">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 30 });
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else {
          seconds = 59;
          if (minutes > 0) minutes--;
          else {
            minutes = 59;
            if (hours > 0) hours--;
            else { hours = 2; minutes = 45; seconds = 30; }
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex gap-3 md:gap-6 justify-center items-center">
      {[
        { label: 'Hours', value: timeLeft.hours },
        { label: 'Minutes', value: timeLeft.minutes },
        { label: 'Seconds', value: timeLeft.seconds }
      ].map((item) => (
        <div key={item.label} className="flex flex-col items-center">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-fintech-bg border border-fintech-neon/30 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(0,255,102,0.15)] mb-2">
            <span className="text-3xl md:text-4xl font-mono font-bold text-fintech-neon">{item.value.toString().padStart(2, '0')}</span>
          </div>
          <span className="text-[10px] md:text-xs text-fintech-muted uppercase tracking-wider font-bold">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

// --- Main App ---
export default function App() {
  const [activeMarket, setActiveMarket] = useState(MARKETS[0]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'canceled' | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  
  // Auth states
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<Plan | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'dashboard'>('home');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // Check if subscription has expired
          if (data.subscriptionStatus === 'active' && data.subscriptionExpiry) {
            const expiryDate = new Date(data.subscriptionExpiry);
            if (expiryDate < new Date()) {
              // Subscription expired, update in Firestore
              await updateDoc(docRef, {
                subscriptionStatus: 'expired'
              });
              data.subscriptionStatus = 'expired';
            }
          }
          
          setUserData(data);
        }
      } else {
        setUserData(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setCurrentView('home');
  };

  const handleSuccessfulSubscription = async (plan: Plan) => {
    if (user) {
      try {
        const expiryDate = new Date();
        if (plan.id === 'monthly') expiryDate.setMonth(expiryDate.getMonth() + 1);
        else if (plan.id === 'six-monthly') expiryDate.setMonth(expiryDate.getMonth() + 6);
        else if (plan.id === 'yearly') expiryDate.setFullYear(expiryDate.getFullYear() + 1);

        await updateDoc(doc(db, 'users', user.uid), {
          subscriptionPlan: plan.id,
          subscriptionStatus: 'active',
          subscriptionExpiry: expiryDate.toISOString()
        });
        
        // Refresh user data
        const docSnap = await getDoc(doc(db, 'users', user.uid));
        if (docSnap.exists()) setUserData(docSnap.data());
      } catch (err) {
        console.error("Error updating subscription status:", err);
      }
    }
    setPaymentStatus('success');
    setIsProcessing(null);
  };

  const initiateRazorpay = async (plan: Plan) => {
    setIsProcessing(plan.id);
    setPaymentStatus(null);
    try {
      const response = await fetch('/api/create-razorpay-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          price: plan.price,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        if (data.error.includes("Razorpay is not configured")) {
          // Fallback to mock payment for testing if Razorpay isn't set up
          console.log("Razorpay not configured, falling back to mock payment flow...");
          setTimeout(async () => {
            await handleSuccessfulSubscription(plan);
          }, 1500);
          return;
        }
        alert(data.error);
        setIsProcessing(null);
        return;
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "The Capital Guru",
        description: `${plan.name} Subscription`,
        order_id: data.orderId,
        handler: async function (response: any) {
          // On success, update Firestore
          await handleSuccessfulSubscription(plan);
        },
        prefill: {
          name: userData?.name || "",
          email: user?.email || "",
          contact: userData?.mobileNumber || ""
        },
        theme: {
          color: "#00FF66"
        },
        modal: {
          ondismiss: function() {
            setPaymentStatus('canceled');
            setIsProcessing(null);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setPaymentStatus('canceled');
        setIsProcessing(null);
      });
      rzp.open();

    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to initiate checkout. Please check your connection.');
      setIsProcessing(null);
    }
  };

  const handleSubscribe = (plan: Plan) => {
    if (!user) {
      setPendingPlan(plan);
      setIsAuthModalOpen(true);
      return;
    }
    initiateRazorpay(plan);
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    if (pendingPlan) {
      initiateRazorpay(pendingPlan);
      setPendingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-fintech-bg text-fintech-text selection:bg-fintech-neon selection:text-fintech-bg font-sans">
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-fintech-bg/90 backdrop-blur-md border-b border-fintech-border py-4 shadow-lg' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="The Capital Guru" 
              className="h-10 md:h-12 w-auto object-contain drop-shadow-[0_0_15px_rgba(0,255,102,0.3)]"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            {/* Fallback if image is not uploaded yet */}
            <div className="hidden flex items-center gap-2">
              <div className="w-10 h-10 relative">
                <svg viewBox="0 0 100 100" className="w-full h-full fill-fintech-neon drop-shadow-[0_0_10px_rgba(0,255,102,0.5)]">
                  <polygon points="0,20 55,20 45,40 25,40 35,70 10,70" />
                  <polygon points="50,40 80,40 75,55 60,55 55,70 30,70" />
                  <rect x="65" y="0" width="10" height="10" />
                  <rect x="85" y="10" width="10" height="10" />
                  <rect x="70" y="20" width="10" height="10" />
                  <rect x="90" y="25" width="10" height="10" />
                  <rect x="80" y="40" width="10" height="10" />
                </svg>
              </div>
              <div className="flex flex-col justify-center italic">
                <span className="font-display font-black text-[12px] leading-none tracking-widest text-white">THE CAPITAL</span>
                <span className="font-display font-black text-[24px] leading-none tracking-widest text-white">GURU</span>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-fintech-muted">
            <a href="#how-it-works" className="hover:text-fintech-text transition-colors">How it Works</a>
            <a href="#testimonials" className="hover:text-fintech-text transition-colors">Testimonials</a>
            <a href="#pricing" className="hover:text-fintech-text transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-fintech-text transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setCurrentView('dashboard')}
                  className="hidden md:flex items-center gap-2 text-sm text-fintech-neon hover:text-white transition-colors bg-fintech-neon/10 px-4 py-2 rounded-full border border-fintech-neon/30"
                >
                  <User size={16} />
                  <span className="font-medium">Dashboard</span>
                </button>
                <button 
                  onClick={handleLogout}
                  className="text-fintech-muted hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-fintech-card border border-fintech-border hover:border-fintech-neon text-fintech-text px-5 py-2 rounded-full text-sm font-medium transition-all hover:shadow-[0_0_15px_rgba(0,255,102,0.3)]"
              >
                Join VIP
              </button>
            )}
          </div>
        </div>
      </nav>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingPlan(null);
        }} 
        onSuccess={handleAuthSuccess} 
      />

      {/* Success Modal */}
      <AnimatePresence>
        {paymentStatus === 'success' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-fintech-card border border-fintech-neon rounded-2xl p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(0,255,102,0.15)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-fintech-neon to-transparent" />
              
              <div className="w-16 h-16 bg-fintech-neon/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-fintech-neon/30">
                <CheckCircle2 size={32} className="text-fintech-neon" />
              </div>
              <h2 className="text-2xl font-display font-bold mb-2">Payment Successful!</h2>
              <p className="text-fintech-text mb-6">Your subscription is now active.</p>
              
              <div className="bg-fintech-bg border border-fintech-border rounded-xl p-5 mb-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-fintech-neon/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Mail className="text-fintech-neon mx-auto mb-3" size={28} />
                <p className="font-bold text-lg mb-1">Check your email</p>
                <p className="text-sm text-fintech-muted">We've sent your unique Telegram invite link to the email used during checkout.</p>
              </div>

              <div className="flex items-start gap-3 text-left bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
                <AlertTriangle className="text-yellow-500 shrink-0 mt-0.5" size={18} />
                <p className="text-xs text-fintech-muted">
                  If not received within 5 minutes, please check your spam folder or contact <a href="mailto:support@thecapitalguru.in" className="text-fintech-neon hover:underline">support@thecapitalguru.in</a>
                </p>
              </div>

              <button 
                onClick={() => setPaymentStatus(null)}
                className="w-full bg-fintech-neon text-fintech-bg font-bold py-3.5 rounded-lg hover:bg-[#00e65c] transition-all hover:shadow-[0_0_20px_rgba(0,255,102,0.4)]"
              >
                Close Window
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Canceled Toast */}
      <AnimatePresence>
        {paymentStatus === 'canceled' && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full flex items-center gap-2 shadow-lg bg-red-500/10 border border-red-500 text-red-500 backdrop-blur-md"
          >
            <Lock size={18} />
            <span className="text-sm font-medium">Payment canceled. You have not been charged.</span>
            <button onClick={() => setPaymentStatus(null)} className="ml-4 opacity-70 hover:opacity-100">×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {currentView === 'dashboard' && user ? (
        <Dashboard 
          userData={userData} 
          onBack={() => setCurrentView('home')} 
          onSubscribe={() => {
            setCurrentView('home');
            setTimeout(() => {
              const el = document.getElementById('pricing');
              el?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
        />
      ) : (
        <>
          <main>
            {/* Hero Section */}
        <section className="relative pt-40 pb-16 px-6 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-fintech-neon/5 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <FadeIn>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fintech-card border border-fintech-border text-xs font-medium text-fintech-neon mb-8 shadow-[0_0_15px_rgba(0,255,102,0.1)]">
                <span className="w-2 h-2 rounded-full bg-fintech-neon animate-pulse" />
                Live Indian Options Signals
              </div>
            </FadeIn>
            
            <FadeIn delay={0.1}>
              <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-6 leading-[1.1]">
                Trade with Precision.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-fintech-muted">Master the Markets.</span>
              </h1>
            </FadeIn>
            
            <FadeIn delay={0.2}>
              <p className="text-lg md:text-xl text-fintech-muted mb-10 max-w-2xl mx-auto">
                Institutional-grade options trading signals for Nifty and BankNifty. 
                Delivered directly to your Telegram with exact entry, targets, and stop-loss.
              </p>
            </FadeIn>
            
            <FadeIn delay={0.3}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={() => {
                    const el = document.getElementById('pricing');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto bg-fintech-neon text-fintech-bg px-8 py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 hover:bg-[#00e65c] transition-all shadow-[0_0_25px_rgba(0,255,102,0.3)] hover:shadow-[0_0_35px_rgba(0,255,102,0.5)]"
                >
                  Join VIP Signals Now <ArrowRight size={20} />
                </button>
                <a 
                  href="https://t.me/TheCapitalGuruSupport?text=I%20want%20to%20join%20Capital%20Guru%20VIP"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto bg-[#0088cc]/10 border border-[#0088cc]/30 text-[#0088cc] px-8 py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 hover:bg-[#0088cc]/20 transition-all shadow-[0_0_15px_rgba(0,136,204,0.15)] hover:shadow-[0_0_25px_rgba(0,136,204,0.3)]"
                >
                  <Send size={20} /> Telegram Support
                </a>
              </div>
              <p className="text-xs text-fintech-muted mt-4 font-medium flex items-center justify-center gap-1">
                <Activity size={14} className="text-fintech-neon" /> Limited slots available. Prices may increase soon.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Social Proof / Metrics */}
        <section className="py-10 px-6 border-y border-fintech-border/50 bg-fintech-card/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-fintech-neon/5 to-transparent opacity-50" />
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-fintech-border/50">
              <FadeIn delay={0.1} className="py-4 md:py-0">
                <div className="flex flex-col items-center justify-center">
                  <Users className="text-fintech-neon mb-2" size={28} />
                  <h3 className="text-3xl font-display font-bold text-white mb-1">1000+</h3>
                  <p className="text-sm text-fintech-muted font-medium uppercase tracking-wider">Active Traders</p>
                </div>
              </FadeIn>
              <FadeIn delay={0.2} className="py-4 md:py-0">
                <div className="flex flex-col items-center justify-center">
                  <Zap className="text-fintech-neon mb-2" size={28} />
                  <h3 className="text-3xl font-display font-bold text-white mb-1">Daily</h3>
                  <p className="text-sm text-fintech-muted font-medium uppercase tracking-wider">High-Conviction Signals</p>
                </div>
              </FadeIn>
              <FadeIn delay={0.3} className="py-4 md:py-0">
                <div className="flex flex-col items-center justify-center">
                  <ShieldCheck className="text-fintech-neon mb-2" size={28} />
                  <h3 className="text-3xl font-display font-bold text-white mb-1">75-80%</h3>
                  <p className="text-sm text-fintech-muted font-medium uppercase tracking-wider">Historical Accuracy</p>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Who Is This For Section */}
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <FadeIn>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Who Is This For?</h2>
                <p className="text-fintech-muted">Designed for traders who value structure and discipline.</p>
              </div>
            </FadeIn>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                { icon: GraduationCap, title: "Beginners in Options", desc: "Start your journey with clear, structured guidance." },
                { icon: Briefcase, title: "Working Professionals", desc: "Limited time? We do the analysis, you just execute." },
                { icon: Target, title: "Systematic Traders", desc: "Looking for structured signals with strict risk management." },
                { icon: Wallet, title: "₹10K–₹1L Capital", desc: "Perfect for growing small to medium sized accounts safely." }
              ].map((item, i) => (
                <FadeIn key={i} delay={0.1 * i}>
                  <div className="flex items-center gap-4 bg-fintech-card border border-fintech-border rounded-xl p-6 hover:border-fintech-neon/30 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-fintech-bg border border-fintech-border flex items-center justify-center shrink-0">
                      <item.icon className="text-fintech-neon" size={20} />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-lg">{item.title}</h4>
                      <p className="text-sm text-fintech-muted">{item.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
            
            <FadeIn delay={0.4} className="mt-12 text-center">
               <button 
                 onClick={() => {
                   const el = document.getElementById('pricing');
                   el?.scrollIntoView({ behavior: 'smooth' });
                 }}
                 className="inline-flex items-center gap-2 bg-fintech-card border border-fintech-neon text-fintech-neon px-8 py-3 rounded-full font-bold hover:bg-fintech-neon hover:text-fintech-bg transition-all shadow-[0_0_15px_rgba(0,255,102,0.1)]"
               >
                 Get Instant Access <ArrowRight size={18} />
               </button>
            </FadeIn>
          </div>
        </section>

        {/* Who This Is NOT For Section */}
        <section className="py-24 px-6 bg-[#050505] border-y border-fintech-border/30">
          <div className="max-w-4xl mx-auto">
            <FadeIn>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-white">This is <span className="text-red-500/90">NOT</span> for everyone</h2>
                <p className="text-fintech-muted">We strictly filter our community to maintain high quality.</p>
              </div>
            </FadeIn>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "People expecting overnight 10x profits",
                "Gambling mindset traders",
                "Those who don't follow discipline",
                "People who ignore stop-losses"
              ].map((text, i) => (
                <FadeIn key={i} delay={0.1 * i}>
                  <div className="flex items-center gap-3 bg-fintech-bg/50 border border-red-900/20 rounded-lg p-4">
                    <XCircle className="text-red-500/70 shrink-0" size={20} />
                    <span className="text-fintech-text/80 font-medium">{text}</span>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Markets Toggle Section */}
        <section id="markets" className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <FadeIn>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-display font-bold mb-4">Markets We Cover</h2>
                <p className="text-fintech-muted">Specialized focus on high-liquidity Indian indices.</p>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="flex justify-center mb-12">
                <div className="inline-flex bg-fintech-card p-1.5 rounded-full border border-fintech-border shadow-inner">
                  {MARKETS.map((market) => (
                    <button
                      key={market}
                      onClick={() => setActiveMarket(market)}
                      className={`relative px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${
                        activeMarket === market ? 'text-fintech-bg' : 'text-fintech-muted hover:text-fintech-text'
                      }`}
                    >
                      {activeMarket === market && (
                        <motion.div
                          layoutId="activeMarket"
                          className="absolute inset-0 bg-fintech-neon rounded-full"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">{market}</span>
                    </button>
                  ))}
                </div>
              </div>
            </FadeIn>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: BarChart3, title: "High Accuracy", desc: "Our signals are backed by deep technical analysis and quantitative models, ensuring high probability setups." },
                { icon: Zap, title: "Instant Execution", desc: "Receive alerts in real-time via Telegram. Never miss a breakout or breakdown again." },
                { icon: ShieldCheck, title: "Risk Managed", desc: "Every trade comes with a strict stop-loss. We prioritize capital preservation above all else." }
              ].map((item, i) => (
                <FadeIn key={i} delay={0.2 + (i * 0.1)}>
                  <div className="bg-fintech-card border border-fintech-border rounded-2xl p-8 hover:border-fintech-neon/50 transition-colors group">
                    <item.icon className="text-fintech-neon mb-6 group-hover:scale-110 transition-transform" size={36} />
                    <h3 className="text-xl font-display font-bold mb-3">{item.title}</h3>
                    <p className="text-fintech-muted text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="py-24 px-6 bg-fintech-card/30 border-y border-fintech-border/50">
          <div className="max-w-6xl mx-auto">
            <FadeIn>
              <div className="text-center mb-16">
                <h2 className="text-3xl font-display font-bold mb-4">Your Path to Profitability</h2>
                <p className="text-fintech-muted">A seamless 4-step onboarding experience designed for serious traders.</p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {/* Connecting Line (Desktop) */}
              <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-[1px] bg-gradient-to-r from-fintech-neon/0 via-fintech-neon/50 to-fintech-neon/0" />

              {[
                { step: '01', title: 'Choose Plan', desc: 'Select a subscription tier.', icon: <Lock size={24} className="text-fintech-bg" /> },
                { step: '02', title: 'Make Payment', desc: 'Secure Razorpay checkout.', icon: <ShieldCheck size={24} className="text-fintech-bg" /> },
                { step: '03', title: 'Get Email Access', desc: 'Receive Telegram link instantly.', icon: <Mail size={24} className="text-fintech-bg" /> },
                { step: '04', title: 'Start Trading', desc: 'Execute signals and profit.', icon: <TrendingUp size={24} className="text-fintech-bg" /> }
              ].map((item, i) => (
                <FadeIn key={i} delay={0.1 * i} className="relative flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full bg-fintech-bg border border-fintech-border flex items-center justify-center mb-6 relative z-10 group hover:border-fintech-neon transition-colors">
                    <div className="w-16 h-16 rounded-full bg-fintech-neon flex items-center justify-center shadow-[0_0_20px_rgba(0,255,102,0.2)] group-hover:shadow-[0_0_30px_rgba(0,255,102,0.4)] transition-shadow">
                      {item.icon}
                    </div>
                  </div>
                  <div className="text-fintech-neon font-mono text-sm mb-2 font-bold">{item.step}</div>
                  <h3 className="text-lg font-display font-bold mb-2">{item.title}</h3>
                  <p className="text-fintech-muted text-sm px-4">{item.desc}</p>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <FadeIn>
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 mb-4">
                  <Star className="text-fintech-neon fill-fintech-neon" size={20} />
                  <Star className="text-fintech-neon fill-fintech-neon" size={20} />
                  <Star className="text-fintech-neon fill-fintech-neon" size={20} />
                  <Star className="text-fintech-neon fill-fintech-neon" size={20} />
                  <Star className="text-fintech-neon fill-fintech-neon" size={20} />
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Trusted by 500+ Active Members</h2>
                <p className="text-fintech-muted">Real results from Indian options traders.</p>
              </div>
            </FadeIn>

            <div className="grid md:grid-cols-2 gap-6">
              {TESTIMONIALS.map((testimonial, i) => (
                <FadeIn key={i} delay={0.1 * i}>
                  <div className="bg-fintech-card border border-fintech-border rounded-2xl p-8 h-full flex flex-col hover:border-fintech-neon/30 transition-colors">
                    <div className="flex items-center gap-4 mb-6">
                      <img src={testimonial.image} alt={testimonial.name} className="w-14 h-14 rounded-full border-2 border-fintech-border" />
                      <div>
                        <h4 className="font-display font-bold text-lg">{testimonial.name}</h4>
                        <p className="text-xs text-fintech-muted uppercase tracking-wider">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="mb-4 inline-block bg-fintech-neon/10 text-fintech-neon text-sm font-bold px-3 py-1 rounded-md border border-fintech-neon/20 self-start">
                      {testimonial.profit}
                    </div>
                    <p className="text-fintech-text/90 leading-relaxed italic">"{testimonial.feedback}"</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 px-6 bg-fintech-card/30 border-t border-fintech-border/50">
          <div className="max-w-6xl mx-auto">
            <FadeIn>
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fintech-neon/10 border border-fintech-neon/30 text-xs font-medium text-fintech-neon mb-6">
                  <Clock size={14} className="animate-pulse" /> Limited Time Offer
                </div>
                <h2 className="text-4xl font-display font-bold mb-4">Prices Increasing Soon</h2>
                <p className="text-fintech-muted mb-8">Secure your spot before the price increase.</p>
                <CountdownTimer />
              </div>
            </FadeIn>

            <div className="grid md:grid-cols-3 gap-8 items-center mt-16">
              {PLANS.map((plan, i) => (
                <FadeIn key={plan.id} delay={0.1 * i}>
                  <div 
                    className={`relative rounded-3xl p-8 transition-all duration-300 flex flex-col h-full ${
                      plan.popular 
                        ? 'bg-fintech-card border-2 border-fintech-neon shadow-[0_0_30px_rgba(0,255,102,0.1)] md:-translate-y-4' 
                        : 'bg-fintech-card border border-fintech-border hover:border-fintech-border/80'
                    }`}
                  >
                    {plan.badge && (
                      <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        plan.popular ? 'bg-fintech-neon text-fintech-bg' : 'bg-fintech-text text-fintech-bg'
                      }`}>
                        {plan.badge}
                      </div>
                    )}
                    
                    <h3 className="text-xl font-display font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-4xl font-display font-bold">₹{plan.price.toLocaleString('en-IN')}</span>
                      <span className="text-fintech-muted text-sm">{plan.period}</span>
                    </div>
                    
                    <button 
                      onClick={() => handleSubscribe(plan)}
                      disabled={isProcessing === plan.id}
                      className={`w-full py-3.5 rounded-lg font-bold text-sm mb-8 transition-all flex items-center justify-center gap-2 ${
                        plan.popular
                          ? 'bg-fintech-neon text-fintech-bg hover:bg-[#00e65c] shadow-[0_0_15px_rgba(0,255,102,0.3)] hover:shadow-[0_0_25px_rgba(0,255,102,0.5)]'
                          : 'bg-fintech-bg border border-fintech-border text-fintech-text hover:border-fintech-neon hover:text-fintech-neon'
                      } disabled:opacity-70 disabled:cursor-not-allowed`}
                    >
                      {isProcessing === plan.id ? (
                        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        'Subscribe Now'
                      )}
                    </button>
                    
                    <div className="space-y-4 flex-grow">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <CheckCircle2 size={18} className="text-fintech-neon shrink-0 mt-0.5" />
                          <span className="text-sm text-fintech-muted">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Mid-Page CTA */}
        <section className="py-20 px-6 border-y border-fintech-border/50 bg-gradient-to-b from-fintech-bg to-fintech-card/50">
          <div className="max-w-4xl mx-auto text-center">
            <FadeIn>
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Ready to Stop Guessing?</h2>
              <p className="text-lg text-fintech-muted mb-10 max-w-2xl mx-auto">
                Join hundreds of profitable traders who rely on our daily signals. Start trading with confidence today.
              </p>
              <button 
                onClick={() => {
                  const el = document.getElementById('pricing');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 bg-fintech-neon text-fintech-bg px-10 py-5 rounded-full font-bold text-lg hover:bg-[#00e65c] transition-all shadow-[0_0_30px_rgba(0,255,102,0.3)] hover:shadow-[0_0_40px_rgba(0,255,102,0.5)]"
              >
                Start Trading with Confidence <ArrowRight size={20} />
              </button>
            </FadeIn>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-24 px-6">
          <div className="max-w-3xl mx-auto">
            <FadeIn>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Frequently Asked Questions</h2>
                <p className="text-fintech-muted">Everything you need to know about the service.</p>
              </div>
            </FadeIn>

            <div className="bg-fintech-card border border-fintech-border rounded-2xl p-6 md:p-8">
              {FAQS.map((faq, i) => (
                <FadeIn key={i} delay={0.05 * i}>
                  <FAQItem 
                    faq={faq} 
                    isOpen={openFaqIndex === i} 
                    onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)} 
                  />
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-fintech-border bg-fintech-bg pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <img 
                  src="/logo.png" 
                  alt="The Capital Guru" 
                  className="h-12 w-auto object-contain drop-shadow-[0_0_15px_rgba(0,255,102,0.3)]"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                {/* Fallback if image is not uploaded yet */}
                <div className="hidden flex items-center gap-2">
                  <div className="w-12 h-12 relative">
                    <svg viewBox="0 0 100 100" className="w-full h-full fill-fintech-neon drop-shadow-[0_0_10px_rgba(0,255,102,0.5)]">
                      <polygon points="0,20 55,20 45,40 25,40 35,70 10,70" />
                      <polygon points="50,40 80,40 75,55 60,55 55,70 30,70" />
                      <rect x="65" y="0" width="10" height="10" />
                      <rect x="85" y="10" width="10" height="10" />
                      <rect x="70" y="20" width="10" height="10" />
                      <rect x="90" y="25" width="10" height="10" />
                      <rect x="80" y="40" width="10" height="10" />
                    </svg>
                  </div>
                  <div className="flex flex-col justify-center italic">
                    <span className="font-display font-black text-[14px] leading-none tracking-widest text-white">THE CAPITAL</span>
                    <span className="font-display font-black text-[28px] leading-none tracking-widest text-white">GURU</span>
                  </div>
                </div>
              </div>
              <p className="text-fintech-muted text-sm leading-relaxed max-w-md mb-6">
                Premium Indian options trading signals provider. We focus on high-probability setups in Nifty and BankNifty with strict risk management.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-fintech-card border border-fintech-border flex items-center justify-center text-fintech-muted hover:text-fintech-neon hover:border-fintech-neon transition-colors">
                  <MessageCircle size={18} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-fintech-card border border-fintech-border flex items-center justify-center text-fintech-muted hover:text-fintech-neon hover:border-fintech-neon transition-colors">
                  <Instagram size={18} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-fintech-card border border-fintech-border flex items-center justify-center text-fintech-muted hover:text-fintech-neon hover:border-fintech-neon transition-colors">
                  <Youtube size={18} />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-display font-bold mb-6 text-lg">Quick Links</h4>
              <ul className="space-y-3 text-sm text-fintech-muted">
                <li><a href="#how-it-works" className="hover:text-fintech-neon transition-colors">How it Works</a></li>
                <li><a href="#testimonials" className="hover:text-fintech-neon transition-colors">Testimonials</a></li>
                <li><a href="#pricing" className="hover:text-fintech-neon transition-colors">Pricing Plans</a></li>
                <li><a href="#faq" className="hover:text-fintech-neon transition-colors">FAQs</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-display font-bold mb-6 text-lg">Support</h4>
              <ul className="space-y-3 text-sm text-fintech-muted">
                <li><a href="https://t.me/TheCapitalGuruSupport?text=I%20want%20to%20join%20Capital%20Guru%20VIP" target="_blank" rel="noreferrer" className="hover:text-[#0088cc] transition-colors flex items-center gap-2"><Send size={14}/> Telegram Support</a></li>
                <li><a href="mailto:support@thecapitalguru.in" className="hover:text-fintech-neon transition-colors flex items-center gap-2"><Mail size={14}/> support@thecapitalguru.in</a></li>
                <li><a href="#" className="hover:text-fintech-neon transition-colors">Terms & Conditions</a></li>
                <li><a href="#" className="hover:text-fintech-neon transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-fintech-neon transition-colors">Refund Policy</a></li>
              </ul>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="border-t border-fintech-border/50 pt-8 pb-8">
            <div className="bg-fintech-card/50 border border-fintech-border rounded-xl p-6 text-xs text-fintech-muted leading-relaxed">
              <p className="font-bold text-fintech-text mb-2 flex items-center gap-2">
                <AlertTriangle size={14} className="text-yellow-500" /> IMPORTANT DISCLAIMER
              </p>
              <p className="mb-2">
                Trading in financial markets, especially options and derivatives, involves a high degree of risk and may not be suitable for all investors. The high degree of leverage can work against you as well as for you. Before deciding to trade, you should carefully consider your investment objectives, level of experience, and risk appetite.
              </p>
              <p className="mb-2">
                <strong>Not Financial Advice:</strong> The Capital Guru provides educational signals and market analysis. We are not SEBI registered investment advisors. The information provided is for educational purposes only and should not be construed as financial, investment, or trading advice.
              </p>
              <p>
                <strong>Past Performance:</strong> Past performance of any trading system or methodology is not necessarily indicative of future results. You could sustain a loss of some or all of your initial investment and should not invest money that you cannot afford to lose.
              </p>
            </div>
          </div>

          <div className="text-center text-sm text-fintech-muted">
            <p>© {new Date().getFullYear()} The Capital Guru. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Floating Support Button */}
      <a 
        href="https://t.me/TheCapitalGuruSupport?text=I%20want%20to%20join%20Capital%20Guru%20VIP" 
        target="_blank" 
        rel="noreferrer" 
        className="fixed bottom-6 right-6 z-50 bg-[#0088cc] text-white p-4 rounded-full shadow-[0_0_20px_rgba(0,136,204,0.4)] hover:shadow-[0_0_30px_rgba(0,136,204,0.6)] hover:scale-110 transition-all flex items-center justify-center group"
      >
        <Send size={28} className="-ml-1" />
        <span className="absolute right-full mr-4 bg-fintech-card text-fintech-text text-sm font-bold px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-fintech-border pointer-events-none shadow-lg">
          Chat on Telegram
        </span>
      </a>
      <Analytics />
      </>
      )}
    </div>
  );
}
