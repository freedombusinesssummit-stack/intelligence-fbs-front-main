'use client';

import { useState, useEffect, startTransition } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

type Tab = 'profile' | 'integrations' | 'danger';

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


export default function SettingsPage() {
	const { user, profile, formIds, fetchUser } = useUserStore();
	const router = useRouter();

	const [activeTab, setActiveTab] = useState<Tab>('profile');

	// Profile form state
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

	// Integrations state
	const [newFormId, setNewFormId] = useState('');
	const [integrationsLoading, setIntegrationsLoading] = useState(false);
	const [integrationsError, setIntegrationsError] = useState<string | null>(null);

	// Danger zone state
	const [deleteConfirm, setDeleteConfirm] = useState('');
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [deleteError, setDeleteError] = useState<string | null>(null);

	useEffect(() => {
		fetchUser();
	}, []);

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

			const jurs = profile.jurisdictions || [];
			const knownJurs = jurs.filter((j: string) => JURISDICTIONS.includes(j));
			const customJur = jurs.find((j: string) => !JURISDICTIONS.includes(j) && j !== 'Other');
			if (customJur) {
				setSelectedJurisdictions([...knownJurs, 'Other']);
				setOtherJurisdiction(customJur);
			} else {
				setSelectedJurisdictions(knownJurs);
			}
		});
	}, [profile]);

	const toggleItem = (
		item: string,
		list: string[],
		setList: (v: string[]) => void,
	) => {
		setList(
			list.includes(item) ? list.filter(i => i !== item) : [...list, item],
		);
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
		} catch (err: any) {
			setProfileError(err.message || 'Failed to save changes');
		} finally {
			setProfileLoading(false);
		}
	};

	const addFormId = async () => {
		const trimmed = newFormId.trim();
		if (!trimmed || !user?.id) return;
		setIntegrationsLoading(true);
		setIntegrationsError(null);
		try {
			const { error } = await supabase
				.from('partner_forms')
				.insert({ partner_id: user.id, form_id: trimmed });
			if (error) throw error;
			setNewFormId('');
			await fetchUser();
		} catch (err: any) {
			setIntegrationsError(err.message || 'Failed to add form');
		} finally {
			setIntegrationsLoading(false);
		}
	};

	const removeFormId = async (formId: string) => {
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
		} catch (err: any) {
			setIntegrationsError(err.message || 'Failed to remove form');
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
		} catch (err: any) {
			setDeleteError(err.message || 'Failed to delete account');
			setDeleteLoading(false);
		}
	};

	const inputClass =
		'w-full px-4 py-3 border bg-white border-[#E5E5E5] rounded-lg text-sm outline-none focus:border-black placeholder:text-[#bbb] transition-colors';
	const labelClass =
		'text-[12px] font-bold uppercase tracking-wider block mb-2 text-gray-700';
	const selectClass =
		'w-full px-4 py-3 border bg-white border-[#E5E5E5] rounded-lg text-sm outline-none focus:border-black transition-colors appearance-none cursor-pointer';

	const companyName = profile?.company_name || 'Partner Account';
	const initials = companyName
		.split(' ')
		.map((w: string) => w[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();

	return (
		<div className='min-h-screen bg-[#fafafa] px-8 py-8'>
			{/* HEADER */}
			<div className='mb-8'>
				<div className='flex items-center gap-4 mb-6'>
					<div className='w-12 h-12 bg-black text-white flex items-center justify-center rounded-xl text-base font-semibold'>
						{initials}
					</div>
					<div>
						<h1 className='text-xl font-extrabold text-gray-900'>
							{companyName}
						</h1>
						<p className='text-sm text-gray-500'>{user?.email}</p>
					</div>
				</div>

				{/* TABS */}
				<div className='flex gap-1 border-b border-[#E5E5E5]'>
					{(
						[
							{ key: 'profile', label: 'Profile' },
							{ key: 'integrations', label: 'Integrations' },
							{ key: 'danger', label: 'Account' },
						] as { key: Tab; label: string }[]
					).map(tab => (
						<button
							key={tab.key}
							onClick={() => setActiveTab(tab.key)}
							className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
								activeTab === tab.key
									? 'border-black text-black'
									: 'border-transparent text-gray-500 hover:text-gray-700'
							}`}
						>
							{tab.label}
						</button>
					))}
				</div>
			</div>

			{/* ── TAB: PROFILE ───────────────────────────────────────────── */}
			{activeTab === 'profile' && (
				<div className='max-w-2xl space-y-6'>
					<Section title='Company Info'>
						<div className='grid grid-cols-2 gap-4'>
							<Field label='Company Name'>
								<input
									className={inputClass}
									placeholder='Acme Partners'
									value={firmDetails.companyName}
									onChange={e =>
										setFirmDetails(p => ({ ...p, companyName: e.target.value }))
									}
								/>
							</Field>
							<Field label='Website'>
								<input
									className={inputClass}
									placeholder='https://acme.com'
									value={firmDetails.website}
									onChange={e =>
										setFirmDetails(p => ({ ...p, website: e.target.value }))
									}
								/>
							</Field>
						</div>
						<Field label='Bio'>
							<textarea
								className={`${inputClass} resize-none`}
								rows={3}
								placeholder='Brief description of your firm...'
								value={firmDetails.bio}
								onChange={e =>
									setFirmDetails(p => ({ ...p, bio: e.target.value }))
								}
							/>
						</Field>
					</Section>

					<Section title='Personal Details'>
						<div className='grid grid-cols-2 gap-4'>
							<Field label='Full Name'>
								<input
									className={inputClass}
									placeholder='John Smith'
									value={firmDetails.fullName}
									onChange={e =>
										setFirmDetails(p => ({ ...p, fullName: e.target.value }))
									}
								/>
							</Field>
							<Field label='Role'>
								<input
									className={inputClass}
									placeholder='Managing Partner'
									value={firmDetails.role}
									onChange={e =>
										setFirmDetails(p => ({ ...p, role: e.target.value }))
									}
								/>
							</Field>
							<Field label='Country'>
								<input
									className={inputClass}
									placeholder='UAE'
									value={firmDetails.country}
									onChange={e =>
										setFirmDetails(p => ({ ...p, country: e.target.value }))
									}
								/>
							</Field>
							<Field label='Nationality'>
								<input
									className={inputClass}
									placeholder='British'
									value={firmDetails.nationality}
									onChange={e =>
										setFirmDetails(p => ({
											...p,
											nationality: e.target.value,
										}))
									}
								/>
							</Field>
						</div>
					</Section>

					<Section title='Services'>
						<div className='flex flex-wrap gap-2'>
							{SERVICES.map(s => (
								<button
									key={s}
									onClick={() =>
										toggleItem(s, selectedServices, setSelectedServices)
									}
									className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
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
						<div className='flex flex-wrap gap-2'>
							{JURISDICTIONS.map(j => (
								<button
									key={j}
									onClick={() =>
										toggleItem(
											j,
											selectedJurisdictions,
											setSelectedJurisdictions,
										)
									}
									className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
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
								className={`${inputClass} mt-3`}
								placeholder='Enter jurisdiction...'
								value={otherJurisdiction}
								onChange={e => setOtherJurisdiction(e.target.value)}
							/>
						)}
					</Section>

					<Section title='Client Profile'>
						<div className='grid grid-cols-2 gap-4 mb-4'>
							<Field label='Budget Range'>
								<select
									className={selectClass}
									value={firmDetails.budget}
									onChange={e =>
										setFirmDetails(p => ({ ...p, budget: e.target.value }))
									}
								>
									<option value=''>Select budget</option>
									<option>Under $100K</option>
									<option>$100K–$500K</option>
									<option>$500K–$1M</option>
									<option>$1M–$5M</option>
									<option>$5M+</option>
								</select>
							</Field>
							<Field label='Timeline'>
								<select
									className={selectClass}
									value={firmDetails.timeline}
									onChange={e =>
										setFirmDetails(p => ({ ...p, timeline: e.target.value }))
									}
								>
									<option value=''>Select timeline</option>
									<option>Immediately</option>
									<option>1–3 months</option>
									<option>3–6 months</option>
									<option>6–12 months</option>
									<option>12+ months</option>
								</select>
							</Field>
						</div>
						<label className={labelClass}>Client Types</label>
						<div className='flex flex-wrap gap-2'>
							{CLIENT_TYPES.map(t => (
								<button
									key={t}
									onClick={() =>
										toggleItem(t, selectedClientTypes, setSelectedClientTypes)
									}
									className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
										selectedClientTypes.includes(t)
											? 'bg-black text-white border-black'
											: 'bg-white text-gray-600 border-[#E5E5E5] hover:border-gray-400'
									}`}
								>
									{t}
								</button>
							))}
						</div>
					</Section>

					{profileError && (
						<p className='text-sm text-red-500'>{profileError}</p>
					)}

					<button
						onClick={handleSaveProfile}
						disabled={profileLoading}
						className='px-6 py-3 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 cursor-pointer'
					>
						{profileLoading
							? 'Saving...'
							: profileSuccess
								? 'Saved ✓'
								: 'Save Changes'}
					</button>
				</div>
			)}

			{/* ── TAB: INTEGRATIONS ──────────────────────────────────────── */}
			{activeTab === 'integrations' && (
				<div className='max-w-2xl space-y-6'>
					<Section title='Form IDs'>
						<p className='text-sm text-gray-500 mb-4'>
							Add Tally form IDs to connect lead sources to your dashboard.
							Leads submitted through those forms will appear here automatically.
						</p>

						{/* existing form ids */}
						{formIds.length > 0 && (
							<div className='space-y-2 mb-4'>
								{formIds.map(id => (
									<div
										key={id}
										className='flex items-center justify-between px-4 py-2.5 bg-gray-50 border border-[#E5E5E5] rounded-lg'
									>
										<span className='text-sm font-mono text-gray-800'>{id}</span>
										<button
											onClick={() => removeFormId(id)}
											className='text-xs text-red-400 hover:text-red-600 transition-colors cursor-pointer ml-4'
										>
											Remove
										</button>
									</div>
								))}
							</div>
						)}

						{/* add new */}
						<Field label='Add Form ID'>
							<div className='flex gap-3'>
								<input
									className={inputClass}
									placeholder='e.g. tAlLyFoRmId123'
									value={newFormId}
									onChange={e => setNewFormId(e.target.value)}
									onKeyDown={e => e.key === 'Enter' && addFormId()}
								/>
								<button
									onClick={addFormId}
									disabled={integrationsLoading || !newFormId.trim()}
									className='px-4 py-3 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-40 whitespace-nowrap cursor-pointer'
								>
									{integrationsLoading ? '...' : 'Add'}
								</button>
							</div>
						</Field>

						{integrationsError && (
							<p className='text-sm text-red-500 mt-2'>{integrationsError}</p>
						)}
					</Section>
				</div>
			)}

			{/* ── TAB: DANGER ────────────────────────────────────────────── */}
			{activeTab === 'danger' && (
				<div className='max-w-2xl space-y-6'>
					<Section title='Account Information'>
						<div className='space-y-3'>
							<div className='flex justify-between items-center py-3 border-b border-[#E5E5E5]'>
								<span className='text-sm text-gray-500'>Email</span>
								<span className='text-sm font-medium text-gray-900'>
									{user?.email}
								</span>
							</div>
							<div className='flex justify-between items-center py-3 border-b border-[#E5E5E5]'>
								<span className='text-sm text-gray-500'>Plan</span>
								<span className='text-sm font-medium text-gray-900 capitalize'>
									{profile?.plan || 'Free'}
								</span>
							</div>
							<div className='flex justify-between items-center py-3 border-b border-[#E5E5E5]'>
								<span className='text-sm text-gray-500'>Member since</span>
								<span className='text-sm font-medium text-gray-900'>
									{user?.created_at
										? new Date(user.created_at).toLocaleDateString('en-GB', {
												day: 'numeric',
												month: 'long',
												year: 'numeric',
											})
										: '—'}
								</span>
							</div>
						</div>
					</Section>

					<Section title='Danger Zone'>
						<div className='border border-red-200 bg-red-50 rounded-lg p-5'>
							<h3 className='text-sm font-bold text-red-700 mb-1'>
								Delete Account
							</h3>
							<p className='text-sm text-red-600 mb-4'>
								This action is permanent and cannot be undone. Your profile,
								leads history, and all account data will be deleted immediately.
							</p>

							<Field label={`Type your email to confirm: ${user?.email || ''}`}>
								<input
									className='w-full px-4 py-3 border bg-white border-red-200 rounded-lg text-sm outline-none focus:border-red-500 placeholder:text-[#bbb] transition-colors'
									placeholder={user?.email || ''}
									value={deleteConfirm}
									onChange={e => setDeleteConfirm(e.target.value)}
								/>
							</Field>

							{deleteError && (
								<p className='text-sm text-red-500 mt-2'>{deleteError}</p>
							)}

							<button
								onClick={handleDeleteAccount}
								disabled={deleteConfirm !== user?.email || deleteLoading}
								className='mt-4 px-6 py-3 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer'
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

function Section({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div className='bg-white border border-[#E5E5E5] rounded-xl p-6'>
			<h2 className='text-sm font-bold text-gray-900 mb-5 uppercase tracking-wider'>
				{title}
			</h2>
			<div className='space-y-4'>{children}</div>
		</div>
	);
}

function Field({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div>
			<label className='text-[12px] font-bold uppercase tracking-wider block mb-2 text-gray-700'>
				{label}
			</label>
			{children}
		</div>
	);
}
