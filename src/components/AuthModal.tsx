import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Phone, Send, MapPin, AlertCircle } from 'lucide-react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, User as FirebaseUser, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [resetSent, setResetSent] = useState(false);

  // Form states
  const [email, setEmail] = useState('xenfxeliteofficial@gmail.com');
  const [password, setPassword] = useState('Iftekhar@18');
  const [name, setName] = useState('iftekhar sheikh');
  const [mobileNumber, setMobileNumber] = useState('+919106713107');
  const [telegramUsername, setTelegramUsername] = useState('@themoneymadness');
  const [address, setAddress] = useState('gnsjdidosnbdkdodmbn');

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setError('Password reset email sent! Please check your inbox.');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        onSuccess();
      } else {
        setGoogleUser(user);
        setName(user.displayName || '');
        setEmail(user.email || '');
        setNeedsProfileCompletion(true);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (needsProfileCompletion && googleUser) {
        if (!name || !mobileNumber || !telegramUsername || !address) {
          throw new Error('Please fill in all fields.');
        }
        await setDoc(doc(db, 'users', googleUser.uid), {
          uid: googleUser.uid,
          name,
          email: googleUser.email || email,
          mobileNumber,
          telegramUsername,
          address,
          createdAt: new Date().toISOString()
        });
        onSuccess();
        return;
      }

      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        onSuccess();
      } else {
        // Validate fields
        if (!name || !mobileNumber || !telegramUsername || !address) {
          throw new Error('Please fill in all fields.');
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save extra user info to Firestore
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          name,
          email,
          mobileNumber,
          telegramUsername,
          address,
          createdAt: new Date().toISOString()
        });

        onSuccess();
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. If you haven\'t created an account yet, please switch to "Register".');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please switch to "Sign In".');
      } else {
        setError(err.message || 'An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-fintech-card border border-fintech-neon/30 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-[0_0_50px_rgba(0,255,102,0.1)] relative overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-fintech-muted hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-display font-bold mb-2">
                {needsProfileCompletion ? 'Complete Your Profile' : (isLogin ? 'Welcome Back' : 'Create Account')}
              </h2>
              <p className="text-sm text-fintech-muted">
                {needsProfileCompletion 
                  ? 'We need a few more details to set up your VIP access.'
                  : (isLogin 
                    ? 'Sign in to manage your subscription.' 
                    : 'Join The Capital Guru VIP community.')}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2 text-red-500 text-sm">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {(!isLogin || needsProfileCompletion) && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-fintech-muted mb-1 uppercase tracking-wider">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-fintech-muted" size={18} />
                      <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-fintech-bg border border-fintech-border rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-fintech-neon transition-colors"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-fintech-muted mb-1 uppercase tracking-wider">Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-fintech-muted" size={18} />
                      <input 
                        type="tel" 
                        required
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className="w-full bg-fintech-bg border border-fintech-border rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-fintech-neon transition-colors"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-fintech-muted mb-1 uppercase tracking-wider">Telegram Username</label>
                    <div className="relative">
                      <Send className="absolute left-3 top-1/2 -translate-y-1/2 text-fintech-muted" size={18} />
                      <input 
                        type="text" 
                        required
                        value={telegramUsername}
                        onChange={(e) => setTelegramUsername(e.target.value)}
                        className="w-full bg-fintech-bg border border-fintech-border rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-fintech-neon transition-colors"
                        placeholder="@username"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-fintech-muted mb-1 uppercase tracking-wider">Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-fintech-muted" size={18} />
                      <textarea 
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-fintech-bg border border-fintech-border rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-fintech-neon transition-colors resize-none h-20"
                        placeholder="Your full address"
                      />
                    </div>
                  </div>
                </>
              )}

              {!needsProfileCompletion && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-fintech-muted mb-1 uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-fintech-muted" size={18} />
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-fintech-bg border border-fintech-border rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-fintech-neon transition-colors"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-medium text-fintech-muted uppercase tracking-wider">Password</label>
                      {isLogin && (
                        <button 
                          type="button"
                          onClick={handleResetPassword}
                          className="text-xs text-fintech-neon hover:underline"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-fintech-muted" size={18} />
                      <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-fintech-bg border border-fintech-border rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-fintech-neon transition-colors"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-fintech-neon text-fintech-bg font-bold py-3 rounded-lg hover:bg-[#00e65c] transition-all shadow-[0_0_15px_rgba(0,255,102,0.2)] hover:shadow-[0_0_25px_rgba(0,255,102,0.4)] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-fintech-bg border-t-transparent rounded-full animate-spin mx-auto block" />
                ) : (
                  needsProfileCompletion ? 'Complete Profile' : (isLogin ? 'Sign In' : 'Create Account')
                )}
              </button>
            </form>

            {!needsProfileCompletion && (
              <>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex-1 h-px bg-fintech-border"></div>
                  <span className="text-xs text-fintech-muted uppercase tracking-wider font-medium">Or continue with</span>
                  <div className="flex-1 h-px bg-fintech-border"></div>
                </div>

                <button 
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="mt-6 w-full bg-fintech-bg border border-fintech-border text-white font-medium py-3 rounded-lg hover:border-fintech-neon/50 hover:bg-fintech-card transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>

                <div className="mt-6 text-center text-sm text-fintech-muted">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button 
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError(null);
                    }}
                    className="text-fintech-neon hover:underline font-medium"
                  >
                    {isLogin ? 'Register' : 'Sign In'}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
