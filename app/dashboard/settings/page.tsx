'use client';

import { useState, useEffect, startTransition } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const errMsg = (err: unknown, fallback: string) => {
	if (err instanceof Error) return err.message;
	if (err && typeof err === 'object' && 'message' in err) return String((err as { message: unknown }).message);
	return fallback;
};

type Tab = 'profile' | 'company' | 'security' | 'notifications' | 'integrations' | 'account';

const SERVICES = [
	'Immigration Law',
	'Investment Advisory',
	'Tax Planning',
	'Real Estate',
	'Corporate Law',
	'Wealth Management',
	'Banking',
	'Education Consulting',
	'Relocation Services',
	'Insurance',
];

const JURISDICTIONS = [
	'UAE',
	'Singapore',
	'Malta',
	'Cyprus',
	'Portugal',
	'Caribbean',
	'UK',
	'Switzerland',
	'Cayman Islands',
	'Other',
];

const CLIENT_TYPES = [
	'HNWIs',
	'Ultra-HNWIs',
	'Families',
	'Business Owners',
	'Executives',
	'Entrepreneurs',
];

const TABS: { key: Tab; label: string }[] = [
	{ key: 'profile', label: 'Profile' },
	{ key: 'company', label: 'Company' },
	{ key: 'security', label: 'Security' },
	// { key: 'notifications', label: 'Notifications' },
	{ key: 'integrations', label: 'Integrations' },
	{ key: 'account', label: 'Account' },
];

export default function SettingsPage() {
	const { user, profile, forms, fetchUser } = useUserStore();
	const router = useRouter();

	const [activeTab, setActiveTab] = useState<Tab>('profile');

	const [firmDetails, setFirmDetails] = useState({
		companyName: '',
		website: '',
		fullName: '',
		role: '',
		country: '',
		bio: '',
		nationality: '',
		budget: '',
		timeline: '',
	});
	const [selectedServices, setSelectedServices] = useState<string[]>([]);
	const [selectedJurisdictions, setSelectedJurisdictions] = useState<string[]>([]);
	const [selectedClientTypes, setSelectedClientTypes] = useState<string[]>([]);
	const [otherJurisdiction, setOtherJurisdiction] = useState('');
	const [profileLoading, setProfileLoading] = useState(false);
	const [profileSuccess, setProfileSuccess] = useState(false);
	const [profileError, setProfileError] = useState<string | null>(null);

	const [newFormId, setNewFormId] = useState('');
	const [newUtmContent, setNewUtmContent] = useState('');
	const [integrationsLoading, setIntegrationsLoading] = useState(false);
	const [integrationsError, setIntegrationsError] = useState<string | null>(null);

	const [deleteConfirm, setDeleteConfirm] = useState('');
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [deleteError, setDeleteError] = useState<string | null>(null);

	const [notifyDaily, setNotifyDaily] = useState(false);
	const [notifySaving, setNotifySaving] = useState(false);

	useEffect(() => {
		fetchUser();
	}, [fetchUser]);

	useEffect(() => {
		if (!profile) return;
		startTransition(() => {
			setFirmDetails({
				companyName: profile.company_name || '',
				website: profile.website || '',
				fullName: profile.full_name || '',
				role: profile.role || '',
				country: profile.country || '',
				bio: profile.bio || '',
				nationality: profile.nationality || '',
				budget: profile.budget || '',
				timeline: profile.timeline || '',
			});
			setSelectedServices(profile.services || []);
			setSelectedClientTypes(profile.client_types || []);
			setNotifyDaily(profile.notify_daily ?? false);

			const jurs = profile.jurisdictions || [];
			const knownJurs = jurs.filter((j: string) => JURISDICTIONS.includes(j));
			const customJur = jurs.find(
				(j: string) => !JURISDICTIONS.includes(j) && j !== 'Other',
			);
			if (customJur) {
				setSelectedJurisdictions([...knownJurs, 'Other']);
				setOtherJurisdiction(customJur);
			} else {
				setSelectedJurisdictions(knownJurs);
			}
		});
	}, [profile]);

	const toggleItem = (item: string, list: string[], setList: (v: string[]) => void) => {
		setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
	};

	const handleSaveProfile = async () => {
		setProfileLoading(true);
		setProfileSuccess(false);
		setProfileError(null);
		try {
			const finalJurisdictions = selectedJurisdictions.includes('Other')
				? [
						...selectedJurisdictions.filter(j => j !== 'Other'),
						otherJurisdiction.trim(),
					].filter(Boolean)
				: selectedJurisdictions;

			const { error } = await supabase.from('partner_profiles').upsert({
				id: user?.id,
				company_name: firmDetails.companyName,
				website: firmDetails.website,
				full_name: firmDetails.fullName,
				role: firmDetails.role,
				country: firmDetails.country,
				bio: firmDetails.bio,
				services: selectedServices,
				jurisdictions: finalJurisdictions,
				nationality: firmDetails.nationality,
				budget: firmDetails.budget,
				timeline: firmDetails.timeline,
				client_types: selectedClientTypes,
			});
			if (error) throw error;
			await fetchUser();
			setProfileSuccess(true);
			setTimeout(() => setProfileSuccess(false), 3000);
		} catch (err) {
			setProfileError(errMsg(err, 'Failed to save changes'));
		} finally {
			setProfileLoading(false);
		}
	};

	const handleToggleNotify = async (value: boolean) => {
		setNotifyDaily(value);
		setNotifySaving(true);
		try {
			await supabase
				.from('partner_profiles')
				.update({ notify_daily: value })
				.eq('id', user?.id);
		} finally {
			setNotifySaving(false);
		}
	};

	const addForm = async () => {
		const trimmedId = newFormId.trim();
		const trimmedUtm = newUtmContent.trim();
		if (!trimmedId || !trimmedUtm || !user?.id) return;
		setIntegrationsLoading(true);
		setIntegrationsError(null);
		try {
			const { error } = await supabase
				.from('partner_forms')
				.insert({ partner_id: user.id, form_id: trimmedId, utm_content: trimmedUtm });
			if (error) throw error;
			setNewFormId('');
			setNewUtmContent('');
			await fetchUser();
		} catch (err) {
			setIntegrationsError(errMsg(err, 'Failed to add integration'));
		} finally {
			setIntegrationsLoading(false);
		}
	};

	const removeForm = async (formId: string) => {
		if (!user?.id) return;
		setIntegrationsError(null);
		try {
			const { error } = await supabase
				.from('partner_forms')
				.delete()
				.eq('partner_id', user.id)
				.eq('form_id', formId);
			if (error) throw error;
			await fetchUser();
		} catch (err) {
			setIntegrationsError(errMsg(err, 'Failed to remove integration'));
		}
	};

	const handleDeleteAccount = async () => {
		if (deleteConfirm !== user?.email) return;
		setDeleteLoading(true);
		setDeleteError(null);
		try {
			const { error: profileError } = await supabase
				.from('partner_profiles')
				.delete()
				.eq('id', user?.id);
			if (profileError) throw profileError;
			await supabase.auth.signOut();
			router.push('/login');
		} catch (err) {
			setDeleteError(errMsg(err, 'Failed to delete account'));
			setDeleteLoading(false);
		}
	};

	const inp =
		'w-full px-3 py-2 border bg-white border-[#E5E5E5] rounded-lg text-sm outline-none focus:border-black placeholder:text-[#ccc] transition-colors';
	const sel =
		'w-full px-3 py-2 border bg-white border-[#E5E5E5] rounded-lg text-sm outline-none focus:border-black transition-colors appearance-none cursor-pointer';

	const companyName = profile?.company_name || 'Partner Account';
	const initials = companyName
		.split(' ')
		.map((w: string) => w[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();

	const saveRow = (
		<div className='flex items-center gap-3 pt-2'>
			<button
				onClick={handleSaveProfile}
				disabled={profileLoading}
				className='px-5 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 cursor-pointer'
			>
				{profileLoading ? 'Saving...' : profileSuccess ? 'Saved ✓' : 'Save Changes'}
			</button>
			{profileError && <p className='text-sm text-red-500'>{profileError}</p>}
		</div>
	);

	return (
		<div className='min-h-screen bg-[#fafafa] px-8 py-7'>
			{/* HEADER */}
			<div className='mb-6'>
				<div className='flex items-center gap-3 mb-5'>
					<div className='w-10 h-10 bg-black text-white flex items-center justify-center rounded-xl text-sm font-semibold'>
						{initials}
					</div>
					<div>
						<h1 className='text-base font-extrabold text-gray-900 leading-tight'>
							{companyName}
						</h1>
						<p className='text-xs text-gray-500'>{user?.email}</p>
					</div>
				</div>

				{/* TABS */}
				<div className='flex gap-0.5 border-b border-[#E5E5E5]'>
					{TABS.map(tab => (
						<button
							key={tab.key}
							onClick={() => setActiveTab(tab.key)}
							className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
								activeTab === tab.key
									? 'border-black text-black'
									: 'border-transparent text-gray-400 hover:text-gray-700'
							}`}
						>
							{tab.label}
						</button>
					))}
				</div>
			</div>

			{/* ── PROFILE ─────────────────────────────────────────────────────── */}
			{activeTab === 'profile' && (
				<div className='max-w-xl space-y-5'>
					<Section title='Personal Details'>
						<div className='grid grid-cols-2 gap-3'>
							<F label='Full Name'>
								<input
									className={inp}
									placeholder='John Smith'
									value={firmDetails.fullName}
									onChange={e => setFirmDetails(p => ({ ...p, fullName: e.target.value }))}
								/>
							</F>
							<F label='Role'>
								<input
									className={inp}
									placeholder='Managing Partner'
									value={firmDetails.role}
									onChange={e => setFirmDetails(p => ({ ...p, role: e.target.value }))}
								/>
							</F>
							<F label='Country'>
								<input
									className={inp}
									placeholder='UAE'
									value={firmDetails.country}
									onChange={e => setFirmDetails(p => ({ ...p, country: e.target.value }))}
								/>
							</F>
							<F label='Nationality'>
								<input
									className={inp}
									placeholder='British'
									value={firmDetails.nationality}
									onChange={e =>
										setFirmDetails(p => ({ ...p, nationality: e.target.value }))
									}
								/>
							</F>
						</div>
					</Section>

					<Section title='Client Preferences'>
						<div className='grid grid-cols-2 gap-3 mb-3'>
							<F label='Budget Range'>
								<select
									className={sel}
									value={firmDetails.budget}
									onChange={e => setFirmDetails(p => ({ ...p, budget: e.target.value }))}
								>
									<option value=''>Select budget</option>
									<option>Under $100K</option>
									<option>$100K–$500K</option>
									<option>$500K–$1M</option>
									<option>$1M–$5M</option>
									<option>$5M+</option>
								</select>
							</F>
							<F label='Timeline'>
								<select
									className={sel}
									value={firmDetails.timeline}
									onChange={e => setFirmDetails(p => ({ ...p, timeline: e.target.value }))}
								>
									<option value=''>Select timeline</option>
									<option>Immediately</option>
									<option>1–3 months</option>
									<option>3–6 months</option>
									<option>6–12 months</option>
									<option>12+ months</option>
								</select>
							</F>
						</div>
						<F label='Client Types'>
							<div className='flex flex-wrap gap-1.5 mt-0.5'>
								{CLIENT_TYPES.map(t => (
									<button
										key={t}
										onClick={() => toggleItem(t, selectedClientTypes, setSelectedClientTypes)}
										className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
											selectedClientTypes.includes(t)
												? 'bg-black text-white border-black'
												: 'bg-white text-gray-600 border-[#E5E5E5] hover:border-gray-400'
										}`}
									>
										{t}
									</button>
								))}
							</div>
						</F>
					</Section>

					{saveRow}
				</div>
			)}

			{/* ── COMPANY ─────────────────────────────────────────────────────── */}
			{activeTab === 'company' && (
				<div className='max-w-xl space-y-5'>
					<Section title='Company Info'>
						<div className='grid grid-cols-2 gap-3'>
							<F label='Company Name'>
								<input
									className={inp}
									placeholder='Acme Partners'
									value={firmDetails.companyName}
									onChange={e =>
										setFirmDetails(p => ({ ...p, companyName: e.target.value }))
									}
								/>
							</F>
							<F label='Website'>
								<input
									className={inp}
									placeholder='https://acme.com'
									value={firmDetails.website}
									onChange={e => setFirmDetails(p => ({ ...p, website: e.target.value }))}
								/>
							</F>
						</div>
						<F label='Bio'>
							<textarea
								className={`${inp} resize-none`}
								rows={3}
								placeholder='Brief description of your firm...'
								value={firmDetails.bio}
								onChange={e => setFirmDetails(p => ({ ...p, bio: e.target.value }))}
							/>
						</F>
					</Section>

					<Section title='Services'>
						<div className='flex flex-wrap gap-1.5'>
							{SERVICES.map(s => (
								<button
									key={s}
									onClick={() => toggleItem(s, selectedServices, setSelectedServices)}
									className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
										selectedServices.includes(s)
											? 'bg-black text-white border-black'
											: 'bg-white text-gray-600 border-[#E5E5E5] hover:border-gray-400'
									}`}
								>
									{s}
								</button>
							))}
						</div>
					</Section>

					<Section title='Jurisdictions'>
						<div className='flex flex-wrap gap-1.5'>
							{JURISDICTIONS.map(j => (
								<button
									key={j}
									onClick={() =>
										toggleItem(j, selectedJurisdictions, setSelectedJurisdictions)
									}
									className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
										selectedJurisdictions.includes(j)
											? 'bg-black text-white border-black'
											: 'bg-white text-gray-600 border-[#E5E5E5] hover:border-gray-400'
									}`}
								>
									{j}
								</button>
							))}
						</div>
						{selectedJurisdictions.includes('Other') && (
							<input
								className={`${inp} mt-3`}
								placeholder='Enter jurisdiction...'
								value={otherJurisdiction}
								onChange={e => setOtherJurisdiction(e.target.value)}
							/>
						)}
					</Section>

					{saveRow}
				</div>
			)}

			{/* ── SECURITY ────────────────────────────────────────────────────── */}
			{activeTab === 'security' && (
				<div className='max-w-xl space-y-5'>
					<Section title='Change Password'>
						<div className='space-y-3'>
							<F label='Current Password'>
								<input
									type='password'
									className={inp}
									placeholder='••••••••'
									disabled
								/>
							</F>
							<F label='New Password'>
								<input
									type='password'
									className={inp}
									placeholder='••••••••'
									disabled
								/>
							</F>
							<F label='Confirm New Password'>
								<input
									type='password'
									className={inp}
									placeholder='••••••••'
									disabled
								/>
							</F>
						</div>
						<div className='pt-2'>
							<button
								disabled
								className='px-5 py-2 bg-black text-white text-sm font-semibold rounded-lg opacity-40 cursor-not-allowed'
							>
								Update Password
							</button>
							<p className='text-xs text-gray-400 mt-2'>
								Password change is not yet available.
							</p>
						</div>
					</Section>
				</div>
			)}

			{/* ── NOTIFICATIONS ───────────────────────────────────────────────── */}
			{activeTab === 'notifications' && (
				<div className='max-w-xl space-y-5'>
					<Section title='Email Notifications'>
						<div className='flex items-center justify-between py-1'>
							<div>
								<p className='text-sm font-medium text-gray-900'>Daily digest</p>
								<p className='text-xs text-gray-500 mt-0.5'>
									Receive a daily summary of new leads to {user?.email}
								</p>
							</div>
							<button
								role='switch'
								aria-checked={notifyDaily}
								onClick={() => handleToggleNotify(!notifyDaily)}
								disabled={notifySaving}
								className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
									notifyDaily ? 'bg-black' : 'bg-gray-200'
								}`}
							>
								<span
									className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
										notifyDaily ? 'translate-x-5' : 'translate-x-0'
									}`}
								/>
							</button>
						</div>
					</Section>
				</div>
			)}

			{/* ── INTEGRATIONS ────────────────────────────────────────────────── */}
			{activeTab === 'integrations' && (
				<div className='max-w-xl space-y-5'>
					<Section title='Integrations'>
						<p className='text-xs text-gray-500 mb-4'>
							Each integration links a form to a UTM content label. Leads submitted through
							the form will be automatically tagged with the corresponding UTM.
						</p>

						{forms.length > 0 && (
							<div className='space-y-2 mb-4'>
								{forms.map(f => (
									<div key={f.form_id} className='rounded-lg border border-[#E5E5E5] bg-gray-50 px-3 py-2.5'>
										<div className='flex items-center justify-between'>
											<code className='text-[11px] text-gray-500 break-all'>
												GET /api/leads/form/<span className='text-gray-900 font-semibold'>{f.form_id}</span>{f.utm_content ? <><span>?utm_content=</span><span className='text-gray-900 font-semibold'>{f.utm_content}</span></> : null}
											</code>
											<button
												onClick={() => removeForm(f.form_id)}
												className='text-xs text-red-400 hover:text-red-600 transition-colors cursor-pointer ml-4 shrink-0'
											>
												Remove
											</button>
										</div>
									</div>
								))}
							</div>
						)}

						<div className='grid grid-cols-2 gap-2'>
							<F label='Form ID'>
								<input
									className={inp}
									placeholder='e.g. xX4jrr'
									value={newFormId}
									onChange={e => setNewFormId(e.target.value)}
								/>
							</F>
							<F label='utm_content'>
								<input
									className={inp}
									placeholder='e.g. facebook_ad'
									value={newUtmContent}
									onChange={e => setNewUtmContent(e.target.value)}
									onKeyDown={e => e.key === 'Enter' && addForm()}
								/>
							</F>
						</div>

						{newFormId.trim() && newUtmContent.trim() && (
							<p className='text-[11px] text-gray-400 mt-1.5 font-mono'>
								→ GET /api/leads/form/{newFormId.trim()}?utm_content={newUtmContent.trim()}
							</p>
						)}

						<div className='mt-3'>
							<button
								onClick={addForm}
								disabled={integrationsLoading || !newFormId.trim() || !newUtmContent.trim()}
								className='px-4 py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-40 cursor-pointer'
							>
								{integrationsLoading ? '...' : 'Add Integration'}
							</button>
						</div>

						{integrationsError && (
							<p className='text-sm text-red-500 mt-2'>{integrationsError}</p>
						)}
					</Section>
				</div>
			)}

			{/* ── ACCOUNT ─────────────────────────────────────────────────────── */}
			{activeTab === 'account' && (
				<div className='max-w-xl space-y-5'>
					<Section title='Account Information'>
						<div className='divide-y divide-[#F0F0F0]'>
							<Row label='Email' value={user?.email ?? '—'} />
							<Row label='Plan' value={profile?.plan || 'Free'} capitalize />
							<Row
								label='Member since'
								value={
									user?.created_at
										? new Date(user.created_at).toLocaleDateString('en-GB', {
												day: 'numeric',
												month: 'long',
												year: 'numeric',
											})
										: '—'
								}
							/>
						</div>
					</Section>

					<Section title='Platform Tour'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm font-medium text-gray-900'>Replay onboarding</p>
								<p className='text-xs text-gray-500 mt-0.5'>
									Walk through the platform guide again at any time
								</p>
							</div>
							<Link
								href='/welcome'
								className='px-4 py-2 bg-black text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition-colors'
							>
								Start tour →
							</Link>
						</div>
					</Section>

					<Section title='Danger Zone'>
						<div className='border border-red-200 bg-red-50 rounded-lg p-4'>
							<h3 className='text-sm font-bold text-red-700 mb-1'>Delete Account</h3>
							<p className='text-xs text-red-600 mb-3'>
								This action is permanent and cannot be undone. Your profile, leads
								history, and all account data will be deleted immediately.
							</p>
							<F label={`Type your email to confirm: ${user?.email || ''}`}>
								<input
									className='w-full px-3 py-2 border bg-white border-red-200 rounded-lg text-sm outline-none focus:border-red-500 placeholder:text-[#ccc] transition-colors'
									placeholder={user?.email || ''}
									value={deleteConfirm}
									onChange={e => setDeleteConfirm(e.target.value)}
								/>
							</F>
							{deleteError && (
								<p className='text-sm text-red-500 mt-2'>{deleteError}</p>
							)}
							<button
								onClick={handleDeleteAccount}
								disabled={deleteConfirm !== user?.email || deleteLoading}
								className='mt-3 px-5 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer'
							>
								{deleteLoading ? 'Deleting...' : 'Delete My Account'}
							</button>
						</div>
					</Section>
				</div>
			)}
		</div>
	);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div className='bg-white border border-[#E5E5E5] rounded-xl p-5'>
			<h2 className='text-[11px] font-bold text-gray-400 mb-4 uppercase tracking-wider'>
				{title}
			</h2>
			<div className='space-y-3'>{children}</div>
		</div>
	);
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div>
			<label className='text-[11px] font-bold uppercase tracking-wider block mb-1.5 text-gray-500'>
				{label}
			</label>
			{children}
		</div>
	);
}

function Row({
	label,
	value,
	capitalize,
}: {
	label: string;
	value: string;
	capitalize?: boolean;
}) {
	return (
		<div className='flex justify-between items-center py-2.5'>
			<span className='text-xs text-gray-500'>{label}</span>
			<span className={`text-sm font-medium text-gray-900 ${capitalize ? 'capitalize' : ''}`}>
				{value}
			</span>
		</div>
	);
}