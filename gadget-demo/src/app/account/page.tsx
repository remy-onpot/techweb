"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User, Lock, Package, Save, Loader2, LogOut, Phone, MapPin, Mail } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'orders'>('profile');
  
  // Data States
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);

  // Form States
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // UI States
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    // 1. Get Auth User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setUser(user);

    // 2. Get Public Profile (SAFER WAY)
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    console.log(profile?.email);

    if (profile) {
      setProfile(profile);
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setAddress(profile.shipping_address || '');
    } else {
        // Optional: If no profile exists, maybe create one on the fly?
        // For now, just leaving fields empty is fine.
    }

    // 3. Get Orders
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id) // <--- This will work now that we ran the SQL
      .order('created_at', { ascending: false });

    if (orders) setOrders(orders);
    
    setLoading(false);
  };

  const updateProfile = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone,
          shipping_address: address,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const updatePassword = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setMessage({ type: 'success', text: 'Password updated! Please login again next time.' });
      setNewPassword('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push('/login');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-orange-500"/></div>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-2xl font-bold text-white">
            {fullName ? fullName.charAt(0) : user.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">{fullName || 'User'}</h1>
            <p className="text-slate-500 text-sm">{user.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="text-slate-500 hover:text-red-600 font-bold text-sm flex items-center gap-2 transition">
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-8">
        
        {/* SIDEBAR NAVIGATION */}
        <div className="space-y-2">
          <NavButton 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')} 
            icon={<User size={18} />} 
            label="My Profile" 
          />
          <NavButton 
            active={activeTab === 'orders'} 
            onClick={() => setActiveTab('orders')} 
            icon={<Package size={18} />} 
            label="Order History" 
          />
          <NavButton 
            active={activeTab === 'security'} 
            onClick={() => setActiveTab('security')} 
            icon={<Lock size={18} />} 
            label="Security" 
          />
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="md:col-span-3 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          
          {/* TAB: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Personal Details</h2>
              <div className="grid gap-6">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:border-orange-500" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+233..." className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:border-orange-500" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Shipping Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                    <textarea value={address} onChange={e => setAddress(e.target.value)} rows={3} placeholder="Your delivery location..." className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:border-orange-500" />
                  </div>
                </div>
                
                {/* Save Button */}
                <div className="pt-4">
                  <button onClick={updateProfile} disabled={saving} className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-orange-500 transition disabled:opacity-50">
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Update Profile
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Login & Security</h2>
              
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="text-slate-400" size={20} />
                  <span className="font-bold text-slate-700">Email Address</span>
                </div>
                <p className="text-sm text-slate-500 pl-8">{user.email}</p>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input 
                    type="password" 
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)} 
                    placeholder="Enter new password" 
                    className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:border-orange-500" 
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">Must contain lowercase, uppercase, digits,symbols and be at least 8 characters long.</p>
              </div>

              <div className="pt-4">
                <button onClick={updatePassword} disabled={saving || !newPassword} className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-orange-500 transition disabled:opacity-50">
                   {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Update Password
                </button>
              </div>
            </div>
          )}

          {/* TAB: ORDERS */}
          {activeTab === 'orders' && (
             <div>
                <h2 className="text-xl font-bold text-slate-900 mb-6">Order History</h2>
                {orders.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-xl">
                    <Package size={48} className="mx-auto text-slate-200 mb-2" />
                    <p className="text-slate-400 font-bold">No orders found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-slate-100 rounded-xl p-4 hover:border-orange-200 transition flex justify-between items-center group">
                         <div>
                            <p className="font-bold text-slate-900">Order #{order.id.slice(0,8)}</p>
                            <p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString()}</p>
                         </div>
                         <div className="text-right">
                            <span className={`text-xs font-bold px-2 py-1 rounded capitalize ${
                              order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                              {order.status}
                            </span>
                            <p className="font-bold text-slate-900 mt-1">₵{order.total_amount?.toFixed(2)}</p>
                         </div>
                      </div>
                    ))}
                  </div>
                )}
             </div>
          )}

          {/* FEEDBACK MESSAGES */}
          {message && (
            <div className={`mt-6 p-4 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
               {message.text}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full text-left p-3 rounded-xl font-bold flex items-center gap-3 transition ${
        active 
          ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      {icon} {label}
    </button>
  );
}