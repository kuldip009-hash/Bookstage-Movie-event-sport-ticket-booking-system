import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store'
import { usersApi } from '../services/api'
import { User, Mail, Phone, Lock, Camera, Shield, Bell, CreditCard, Save, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingScreen from '../components/ui/LoadingScreen'

export default function ProfilePage() {
    const { user, updateUser } = useAuthStore()
    const [activeTab, setActiveTab] = useState('profile')
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [loading, setLoading] = useState(true)

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        city: 'Mumbai',
        dob: '1995-06-15',
    })

    const handleSave = async () => {
        setSaving(true)

        // validation: require names and dob, ensure phone digits
        if (!form.firstName.trim() || !form.lastName.trim()) {
            toast.error('First name and last name are required.')
            setSaving(false)
            return
        }
        if (!form.dob) {
            toast.error('Date of birth is required.')
            setSaving(false)
            return
        }
        if (form.phone && !/^\d+$/.test(form.phone)) {
            toast.error('Phone number must contain only digits.')
            setSaving(false)
            return
        }

        try {
            // send combined fullName and phone
            const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`
            const payload = { fullName }
            if (form.phone !== null) payload.phone = form.phone.trim()
            // include new profile fields
            if (form.city) payload.city = form.city
            if (form.dob) payload.dateOfBirth = form.dob
            const res = await usersApi.updateMe(payload)
            const updated = res.data
            // update store
            const userObj = {
                id: updated.id,
                firstName: updated.fullName.split(' ')[0],
                lastName: updated.fullName.split(' ').slice(1).join(' '),
                email: updated.email,
                role: updated.role,
                phone: updated.phone,
                city: updated.city,
                dateOfBirth: updated.dateOfBirth,
            }
            updateUser(userObj)
            setSaved(true)
            toast.success('Profile updated successfully!')
            setTimeout(() => setSaved(false), 3000)
        } catch (err) {
            console.error(err)
            toast.error('Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    const tabs = ['profile']

    // load profile on mount
    useEffect(() => {
        let mounted = true
        const load = async () => {
            try {
                const res = await usersApi.getMe()
                const data = res.data
                if (!mounted) return
                const names = data.fullName.split(' ')
                const userObj = {
                    id: data.id,
                    firstName: names[0] || '',
                    lastName: names.slice(1).join(' ') || '',
                    email: data.email,
                    role: data.role,
                    phone: data.phone,
                    city: data.city,
                    dateOfBirth: data.dateOfBirth,
                }
                setForm({
                    firstName: userObj.firstName,
                    lastName: userObj.lastName,
                    email: data.email,
                    phone: data.phone || '',
                    city: data.city || 'Mumbai',
                    dob: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '1995-06-15',
                })
                updateUser(userObj)
            } catch (err) {
                console.error('failed to load profile', err)
            } finally {
                setLoading(false)
            }
        }
        load()
        return () => { mounted = false }
    }, [])

    if (loading) {
        return <LoadingScreen />
    }

    return (
        <div className="min-h-screen py-10 px-4" style={{ background: 'var(--bg-primary)' }}>
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-black text-primary-color font-display mb-8">Account Settings</h1>

                <div className="flex flex-col sm:flex-row gap-6">
                    {/* Sidebar */}
                    <div className="sm:w-52 flex-shrink-0">
                        {/* Avatar */}
                        <div className="rounded-2xl p-6 border border-default text-center mb-4" style={{ background: 'var(--card-bg)' }}>
                            <div className="relative inline-block">
                                <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-black mx-auto"
                                    style={{ background: 'linear-gradient(135deg, #FF2D55, #FF6B35)' }}>
                                    {form.firstName?.[0] || 'J'}
                                </div>
        
                            </div>
                            <p className="font-bold text-sm text-primary-color mt-3">{form.firstName} {form.lastName}</p>
                            <p className="text-xs text-muted-color mt-0.5 truncate">{form.email}</p>
                            <span className="badge-green text-xs mt-2 inline-block">Verified Member</span>
                        </div>

                        <div className="space-y-1">
                            {tabs.map(t => (
                                <button key={t} onClick={() => setActiveTab(t)}
                                    className={`sidebar-link w-full capitalize ${activeTab === t ? 'active' : ''}`}>
                                    {t === 'profile' && <User className="w-4 h-4" />}
                                    {t === 'security' && <Shield className="w-4 h-4" />}
                                    {t === 'notifications' && <Bell className="w-4 h-4" />}
                                    {t === 'payment' && <CreditCard className="w-4 h-4" />}
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        {activeTab === 'profile' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-default overflow-hidden" style={{ background: 'var(--card-bg)' }}>
                                <div className="p-6 border-b border-default">
                                    <h2 className="font-bold text-primary-color">Personal Information</h2>
                                    <p className="text-xs text-muted-color mt-1">Update your profile details</p>
                                </div>
                                <div className="p-6 space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-primary-color mb-2">First Name</label>
                                            <input value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                                                className="input-field" id="profile-firstname" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-primary-color mb-2">Last Name</label>
                                            <input value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                                                className="input-field" id="profile-lastname" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-primary-color mb-2">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-color" />
                                            <input value={form.email}
                                                disabled
                                                readOnly
                                                className="input-field pl-11" type="email" id="profile-email" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-primary-color mb-2">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-color" />
                                            <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                                                className="input-field pl-11" id="profile-phone" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-primary-color mb-2">City</label>
                                            <select value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                                                className="input-field" style={{ background: 'var(--glass-bg)' }}>
                                                {['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai', 'Hyderabad'].map(c => (
                                                    <option key={c} value={c} style={{ background: 'var(--card-bg)' }}>{c}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-primary-color mb-2">Date of Birth</label>
                                            <input type="date" value={form.dob} onChange={e => setForm(p => ({ ...p, dob: e.target.value }))}
                                                className="input-field" id="profile-dob" />
                                        </div>
                                    </div>
                                    <button id="profile-save" onClick={handleSave} disabled={saving}
                                        className={`btn-primary py-3 px-8 ${saved ? 'opacity-80' : ''}`}>
                                        {saving ? (
                                            <span className="flex items-center gap-2">
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Saving...
                                            </span>
                                        ) : saved ? (
                                            <><Check className="w-4 h-4" /> Saved!</>
                                        ) : (
                                            <><Save className="w-4 h-4" /> Save Changes</>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    )
}
