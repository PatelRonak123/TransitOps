import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Lock,
  Shield,
  CheckCircle,
  Eye,
  EyeOff,
  Sliders,
  Info
} from "lucide-react";
import MainLayout from "../../../components/layout/MainLayout";
import { useAuth } from "../../auth/context/AuthContext";
import authService from "../../auth/service/authService";
import { showHttpToast } from "../../../lib/httpToast";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  // Profile Form States
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email] = useState(user?.email || "");
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    try {
      const response = await authService.updatePassword({
        currentPassword,
        newPassword,
      });

      if (response?.success) {
        setPasswordSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        showHttpToast(200, response?.message || "Password updated successfully");
        setTimeout(() => setPasswordSuccess(false), 3000);
      }
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to update password";
      setPasswordError(message);
      showHttpToast(err?.response?.status || 500, message);
    }
  };

  return (
    <MainLayout>
      <motion.div
        className="space-y-6 pb-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Title */}
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">System Settings</h1>
          <p className="mt-2 text-slate-500">Manage your profile, change passwords, and inspect security rules.</p>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-4 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-sm transition-all duration-300 ${
              activeTab === "profile"
                ? "border-orange-500 text-orange-500"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <User className="h-4.5 w-4.5" />
            My Profile
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-sm transition-all duration-300 ${
              activeTab === "password"
                ? "border-orange-500 text-orange-500"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Lock className="h-4.5 w-4.5" />
            Security & Password
          </button>
          <button
            onClick={() => setActiveTab("policy")}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-sm transition-all duration-300 ${
              activeTab === "policy"
                ? "border-orange-500 text-orange-500"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Shield className="h-4.5 w-4.5" />
            Lockout Policies
          </button>
        </div>

        {/* Tab Contents */}
        <div className="max-w-4xl">
          <AnimatePresence mode="wait">
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6"
              >
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-bold text-slate-800">Profile Information</h3>
                  <p className="text-slate-400 text-xs mt-1">Update your name and view account configuration.</p>
                </div>

                {profileSuccess && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                    Profile changes saved successfully! (Simulation)
                  </div>
                )}

                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-bold text-slate-500 uppercase">First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-400/20 focus:border-orange-500 transition"
                      />
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-bold text-slate-500 uppercase">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-400/20 focus:border-orange-500 transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-slate-500 uppercase">Email Address (Read Only)</label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none text-slate-400"
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-slate-500 uppercase">System Role</label>
                    <div>
                      <span className="inline-block rounded-full bg-orange-50 border border-orange-200 px-3 py-1 text-xs font-bold text-orange-600">
                        {user?.role || "Fleet Manager"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-orange-600 transition"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === "password" && (
              <motion.div
                key="password"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6"
              >
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-bold text-slate-800">Security Credentials</h3>
                  <p className="text-slate-400 text-xs mt-1">Change your login password regularly to protect your account.</p>
                </div>

                {passwordSuccess && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                    Security credentials updated successfully! (Simulation)
                  </div>
                )}

                {passwordError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {passwordError}
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-slate-500 uppercase">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPass.current ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-orange-400/20 focus:border-orange-500 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(prev => ({ ...prev, current: !prev.current }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPass.current ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-slate-500 uppercase">New Password</label>
                    <div className="relative">
                      <input
                        type={showPass.new ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-orange-400/20 focus:border-orange-500 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(prev => ({ ...prev, new: !prev.new }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPass.new ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-slate-500 uppercase">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showPass.confirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-orange-400/20 focus:border-orange-500 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(prev => ({ ...prev, confirm: !prev.confirm }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPass.confirm ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-orange-600 transition"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === "policy" && (
              <motion.div
                key="policy"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6"
              >
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-bold text-slate-800">Account Lockout & Encryption Policies</h3>
                  <p className="text-slate-400 text-xs mt-1">TransitOps security settings configured for compliance with Odoo Hackathon standards.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5 flex items-start gap-4">
                    <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600">
                      <Sliders className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-slate-700 text-sm">Failed Logins Limit</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        If a user enters an incorrect credentials combination <strong>5 consecutive times</strong>, the account is locked.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5 flex items-start gap-4">
                    <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-slate-700 text-sm">Lockout Cool-down</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Locked accounts are automatically unlocked after <strong>15 minutes</strong>. Users can re-attempt credentials input then.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-4 flex gap-3 text-xs text-blue-800">
                  <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <div className="text-left leading-relaxed">
                    <p className="font-semibold">Cryptographic Standards</p>
                    <p className="mt-1 text-slate-500">
                      All system passwords are salted and hashed on the backend using the industrial-grade <strong>bcrypt</strong> algorithm before database storage.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default Settings;
