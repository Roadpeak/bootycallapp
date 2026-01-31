// lib/hooks/butical-api-hooks.ts
import { useState, useEffect, useCallback } from 'react';
import ButicalAPI, {
    TokenService,
    User,
    Escort,
    DatingProfile,
    HookupProfile,
    Review,
    WalletSummary,
    WalletTransaction,
    WithdrawResponse,
    PaymentResponse,
    AuthResponse,
    DatingUserRegistration,
    EscortRegistration,
    HookupUserRegistration,
    LoginCredentials,
    ReferralApplyResponse,
    ReferredUser,
    AccessTokenResponse,
    DatingSearchParams as ApiDatingSearchParams,
    Subscription,
} from '../../services/butical-api-service';

type RegisterData = DatingUserRegistration | EscortRegistration | HookupUserRegistration;

// ==================== TYPES ====================

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: any;
}

interface EscortFilters {
    location?: string;
    minAge?: number;
    maxAge?: number;
    minRate?: number;
    maxRate?: number;
    page?: number;
    limit?: number;
}

interface DatingSearchParams {
    gender?: string;
    minAge?: number;
    maxAge?: number;
    location?: string;
    interests?: string[];
    page?: number;
    limit?: number;
}

interface TransactionParams {
    page?: number;
    limit?: number;
    type?: 'credit' | 'debit';
}

// ==================== AUTH HOOKS ====================

interface UseAuthReturn {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (credentials: LoginCredentials) => Promise<ApiResponse<AuthResponse>>;
    register: (userData: RegisterData) => Promise<ApiResponse<AuthResponse>>;
    logout: () => void;
}

export const useAuth = (): UseAuthReturn => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                if (TokenService.getAccessToken()) {
                    const response = await ButicalAPI.users.getMe();
                    // Unwrap API response if needed (API may wrap in { status, data })
                    const userData = (response.data as any)?.data || response.data;
                    setUser(userData);
                }
            } catch (err) {
                console.error('Auth check failed:', err);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
        try {
            setLoading(true);
            setError(null);
            const response = await ButicalAPI.auth.login(credentials);
            // Unwrap API response (API wraps in { status, data })
            const authData = (response.data as any)?.data || response.data;
            const { accessToken, refreshToken, user: userData } = authData;

            TokenService.setAccessToken(accessToken);
            if (refreshToken) {
                TokenService.setRefreshToken(refreshToken);
            }
            setUser(userData);

            return { success: true, data: authData };
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
            return { success: false, error: err.response?.data };
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData: RegisterData): Promise<ApiResponse<AuthResponse>> => {
        try {
            setLoading(true);
            setError(null);
            const response = await ButicalAPI.auth.register(userData);
            // Unwrap API response (API wraps in { status, data })
            const authData = (response.data as any)?.data || response.data;
            const { accessToken, refreshToken, user: newUser } = authData;

            TokenService.setAccessToken(accessToken);
            if (refreshToken) {
                TokenService.setRefreshToken(refreshToken);
            }
            setUser(newUser);

            return { success: true, data: authData };
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
            return { success: false, error: err.response?.data };
        } finally {
            setLoading(false);
        }
    };

    const logout = (): void => {
        TokenService.clearTokens();
        setUser(null);
    };

    return { user, loading, error, login, register, logout };
};

// ==================== ESCORTS HOOKS ====================

interface UseEscortsReturn {
    escorts: Escort[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export const useEscorts = (filters: EscortFilters = {}): UseEscortsReturn => {
    const [escorts, setEscorts] = useState<Escort[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEscorts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await ButicalAPI.escorts.list(filters);
            console.log('Escorts API response:', response);
            console.log('Escorts API response.data:', response.data);

            // Unwrap API response: { status, data: { escorts: [...], pagination: {...} } }
            // or { status, data: [...] }
            const responseData = (response.data as any)?.data || response.data;
            console.log('Unwrapped response data:', responseData);
            console.log('Response data type:', typeof responseData, 'Is array:', Array.isArray(responseData));

            // Handle different response structures
            let escortsArray: any[] = [];
            if (Array.isArray(responseData)) {
                escortsArray = responseData;
                console.log('Response is direct array');
            } else if (responseData?.escorts && Array.isArray(responseData.escorts)) {
                escortsArray = responseData.escorts;
                console.log('Response has escorts property');
            } else if (responseData?.data && Array.isArray(responseData.data)) {
                escortsArray = responseData.data;
                console.log('Response has data.data array');
            } else if (typeof responseData === 'object' && responseData !== null) {
                // Check if it's a single escort object or paginated result
                escortsArray = Object.values(responseData).filter(v => typeof v === 'object' && v !== null && 'id' in (v as any));
                console.log('Extracted from object values');
            }

            console.log('Final escorts array:', escortsArray);
            console.log('Escorts count:', escortsArray.length);
            setEscorts(escortsArray);
            setError(null);
        } catch (err: any) {
            console.error('Failed to fetch escorts:', err);
            console.error('Error response:', err.response);
            console.error('Error message:', err.message);
            setError(err.response?.data?.message || err.message || 'Failed to fetch escorts');
            setEscorts([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    }, [JSON.stringify(filters)]);

    useEffect(() => {
        fetchEscorts();
    }, [fetchEscorts]);

    return { escorts, loading, error, refetch: fetchEscorts };
};

interface UseEscortReturn {
    escort: Escort | null;
    loading: boolean;
    error: string | null;
}

export const useEscort = (id: string | undefined): UseEscortReturn => {
    const [escort, setEscort] = useState<Escort | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEscort = async () => {
            if (!id) return;

            try {
                setLoading(true);
                const response = await ButicalAPI.escorts.getById(id);
                // Unwrap API response: { status, data: { ...escort } }
                const escortData = (response.data as any)?.data || response.data;
                setEscort(escortData);
                setError(null);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to fetch escort');
            } finally {
                setLoading(false);
            }
        };

        fetchEscort();
    }, [id]);

    return { escort, loading, error };
};

interface UseMyEscortProfileReturn {
    profile: Escort | null;
    loading: boolean;
    error: string | null;
    updateProfile: (data: Partial<Escort>) => Promise<ApiResponse<Escort>>;
    refetch: () => Promise<void>;
}

export const useMyEscortProfile = (): UseMyEscortProfileReturn => {
    const [profile, setProfile] = useState<Escort | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await ButicalAPI.escorts.getMe();
            // Unwrap API response: { status, data: { ...escort } }
            const escortData = (response.data as any)?.data || response.data;
            setProfile(escortData);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch profile');
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (data: Partial<Escort>): Promise<ApiResponse<Escort>> => {
        try {
            setLoading(true);
            const response = await ButicalAPI.escorts.updateMe(data);
            // Unwrap API response
            const escortData = (response.data as any)?.data || response.data;
            setProfile(escortData);
            return { success: true, data: escortData };
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update profile');
            return { success: false, error: err.response?.data };
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    return { profile, loading, error, updateProfile, refetch: fetchProfile };
};

// ==================== DATING PROFILES HOOKS ====================

interface UseDatingProfilesReturn {
    profiles: DatingProfile[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export const useDatingProfiles = (searchParams: DatingSearchParams = {}): UseDatingProfilesReturn => {
    const [profiles, setProfiles] = useState<DatingProfile[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const search = useCallback(async () => {
        try {
            setLoading(true);
            // Convert local DatingSearchParams to API format (interests as comma-separated string)
            const apiParams: ApiDatingSearchParams = {
                ...searchParams,
                city: searchParams.location, // API uses 'city' instead of 'location'
                interests: searchParams.interests?.join(','), // Convert array to comma-separated string
            };
            delete (apiParams as any).location; // Remove location as we use city

            console.log('Dating search params:', apiParams);
            const response = await ButicalAPI.datingProfiles.search(apiParams);
            console.log('Dating profiles API response:', response);
            console.log('Dating profiles API response.data:', response.data);

            // Unwrap API response: { status, data: { profiles: [...], pagination: {...} } }
            // or { status, data: [...] }
            const responseData = (response.data as any)?.data || response.data;
            console.log('Unwrapped dating profiles data:', responseData);
            console.log('Response data type:', typeof responseData, 'Is array:', Array.isArray(responseData));

            // Handle different response structures
            let profilesArray: DatingProfile[] = [];
            if (Array.isArray(responseData)) {
                profilesArray = responseData;
                console.log('Response is direct array');
            } else if (responseData?.profiles && Array.isArray(responseData.profiles)) {
                profilesArray = responseData.profiles;
                console.log('Response has profiles property');
            } else if (responseData?.data && Array.isArray(responseData.data)) {
                profilesArray = responseData.data;
                console.log('Response has data.data array');
            }

            console.log('Final profiles array:', profilesArray);
            console.log('Profiles count:', profilesArray.length);
            setProfiles(profilesArray);
            setError(null);
        } catch (err: any) {
            console.error('Failed to fetch dating profiles:', err);
            console.error('Error response:', err.response);
            console.error('Error message:', err.message);
            setError(err.response?.data?.message || err.message || 'Failed to search profiles');
            setProfiles([]);
        } finally {
            setLoading(false);
        }
    }, [JSON.stringify(searchParams)]);

    useEffect(() => {
        search();
    }, [search]);

    return { profiles, loading, error, refetch: search };
};

interface UseMyDatingProfileReturn {
    profile: DatingProfile | null;
    loading: boolean;
    error: string | null;
    updateProfile: (data: Partial<DatingProfile>) => Promise<ApiResponse<DatingProfile>>;
    refetch: () => Promise<void>;
}

export const useMyDatingProfile = (): UseMyDatingProfileReturn => {
    const [profile, setProfile] = useState<DatingProfile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await ButicalAPI.datingProfiles.getMe();
            // Unwrap API response: { status, data: { ...profile } }
            const profileData = (response.data as any)?.data || response.data;
            setProfile(profileData);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch profile');
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (data: Partial<DatingProfile>): Promise<ApiResponse<DatingProfile>> => {
        try {
            setLoading(true);
            const response = await ButicalAPI.datingProfiles.updateMe(data as any);
            // Unwrap API response
            const profileData = (response.data as any)?.data || response.data;
            setProfile(profileData);
            return { success: true, data: profileData };
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update profile');
            return { success: false, error: err.response?.data };
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    return { profile, loading, error, updateProfile, refetch: fetchProfile };
};

interface UseDatingMatchesReturn {
    matches: DatingProfile[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export const useDatingMatches = (): UseDatingMatchesReturn => {
    const [matches, setMatches] = useState<DatingProfile[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMatches = async () => {
        try {
            setLoading(true);
            const response = await ButicalAPI.datingProfiles.getMatches();
            // Handle both { data: [...] } and { data: { profiles: [...] } } and { profiles: [...] }
            const matchesData = (response.data as any)?.data?.profiles ||
                               (response.data as any)?.profiles ||
                               (response.data as any)?.data ||
                               response.data;
            console.log('Matches response:', response);
            console.log('Matches data:', matchesData);
            setMatches(Array.isArray(matchesData) ? matchesData : []);
            setError(null);
        } catch (err: any) {
            console.error('Failed to fetch matches:', err);
            // Don't set error for 503 or 404 - these mean endpoint not implemented yet
            const status = err.response?.status;
            if (status !== 503 && status !== 404) {
                setError(err.response?.data?.message || err.message || 'Failed to fetch matches');
            }
            setMatches([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMatches();
    }, []);

    return { matches, loading, error, refetch: fetchMatches };
};

interface UseDatingLikesReturn {
    likes: DatingProfile[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export const useDatingLikes = (): UseDatingLikesReturn => {
    const [likes, setLikes] = useState<DatingProfile[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLikes = async () => {
        try {
            setLoading(true);
            const response = await ButicalAPI.datingProfiles.getLikes();
            // Handle both { data: [...] } and { data: { profiles: [...] } } and { profiles: [...] }
            const likesData = (response.data as any)?.data?.profiles ||
                             (response.data as any)?.profiles ||
                             (response.data as any)?.data ||
                             response.data;
            console.log('Likes response:', response);
            console.log('Likes data:', likesData);
            setLikes(Array.isArray(likesData) ? likesData : []);
            setError(null);
        } catch (err: any) {
            console.error('Failed to fetch likes:', err);
            // Don't set error for 503 or 404 - these mean endpoint not implemented yet
            const status = err.response?.status;
            if (status !== 503 && status !== 404) {
                setError(err.response?.data?.message || err.message || 'Failed to fetch likes');
            }
            setLikes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLikes();
    }, []);

    return { likes, loading, error, refetch: fetchLikes };
};

interface UseDatingLikedByReturn {
    likedBy: DatingProfile[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export const useDatingLikedBy = (): UseDatingLikedByReturn => {
    const [likedBy, setLikedBy] = useState<DatingProfile[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLikedBy = async () => {
        try {
            setLoading(true);
            const response = await ButicalAPI.datingProfiles.getLikedBy();
            // Handle both { data: [...] } and { data: { profiles: [...] } } and { profiles: [...] }
            const likedByData = (response.data as any)?.data?.profiles ||
                               (response.data as any)?.profiles ||
                               (response.data as any)?.data ||
                               response.data;
            console.log('Liked By response:', response);
            console.log('Liked By data:', likedByData);
            setLikedBy(Array.isArray(likedByData) ? likedByData : []);
            setError(null);
        } catch (err: any) {
            console.error('Failed to fetch liked by:', err);
            // Don't set error for 503 or 404 - these mean endpoint not implemented yet
            const status = err.response?.status;
            if (status !== 503 && status !== 404) {
                setError(err.response?.data?.message || err.message || 'Failed to fetch liked by');
            }
            setLikedBy([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLikedBy();
    }, []);

    return { likedBy, loading, error, refetch: fetchLikedBy };
};

interface UseDatingSuggestedReturn {
    suggested: DatingProfile[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export const useDatingSuggested = (limit: number = 20): UseDatingSuggestedReturn => {
    const [suggested, setSuggested] = useState<DatingProfile[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSuggested = async () => {
        try {
            setLoading(true);
            const response = await ButicalAPI.datingProfiles.getSuggested({ limit });
            const suggestedData = (response.data as any)?.data || response.data;
            setSuggested(Array.isArray(suggestedData) ? suggestedData : []);
            setError(null);
        } catch (err: any) {
            console.error('Failed to fetch suggested profiles:', err);
            // Don't set error for 503 or 404 - these mean endpoint not implemented yet
            const status = err.response?.status;
            if (status !== 503 && status !== 404) {
                setError(err.response?.data?.message || err.message || 'Failed to fetch suggestions');
            }
            setSuggested([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuggested();
    }, [limit]);

    return { suggested, loading, error, refetch: fetchSuggested };
};

// ==================== PAYMENTS HOOKS ====================

interface UsePaymentReturn {
    loading: boolean;
    error: string | null;
    subscribeDating: (phone: string) => Promise<ApiResponse<PaymentResponse>>;
    unlockEscort: (escortId: string, phone: string) => Promise<ApiResponse<PaymentResponse>>;
    subscribeVIP: (phone: string) => Promise<ApiResponse<PaymentResponse>>;
    checkPaymentStatus: (paymentId: string) => Promise<ApiResponse<any>>;
}

export const usePayment = (): UsePaymentReturn => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const subscribeDating = async (phone: string): Promise<ApiResponse<PaymentResponse>> => {
        try {
            setLoading(true);
            setError(null);
            const response = await ButicalAPI.payments.subscribeDating(phone);
            // Unwrap API response: { status, data: { paymentId, checkoutRequestId, message } }
            const paymentData = (response.data as any)?.data || response.data;
            return { success: true, data: paymentData };
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Payment failed';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    const unlockEscort = async (escortId: string, phone: string): Promise<ApiResponse<PaymentResponse>> => {
        try {
            setLoading(true);
            setError(null);
            const response = await ButicalAPI.payments.unlockEscort(escortId, phone);
            // Unwrap API response
            const paymentData = (response.data as any)?.data || response.data;
            return { success: true, data: paymentData };
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Payment failed';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    const subscribeVIP = async (phone: string): Promise<ApiResponse<PaymentResponse>> => {
        try {
            setLoading(true);
            setError(null);
            const response = await ButicalAPI.payments.subscribeVIP(phone);
            // Unwrap API response
            const paymentData = (response.data as any)?.data || response.data;
            return { success: true, data: paymentData };
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Payment failed';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    const checkPaymentStatus = async (paymentId: string): Promise<ApiResponse<any>> => {
        try {
            const response = await ButicalAPI.payments.getPaymentStatus(paymentId);
            // Unwrap API response
            const statusData = (response.data as any)?.data || response.data;
            return { success: true, data: statusData };
        } catch (err: any) {
            return { success: false, error: err.response?.data };
        }
    };

    return {
        loading,
        error,
        subscribeDating,
        unlockEscort,
        subscribeVIP,
        checkPaymentStatus,
    };
};

// ==================== WALLET HOOKS ====================

interface UseWalletReturn {
    wallet: WalletSummary | null;
    transactions: WalletTransaction[];
    loading: boolean;
    error: string | null;
    withdraw: (amount: number, phone: string) => Promise<ApiResponse<WithdrawResponse>>;
    refetch: () => Promise<void>;
    refetchTransactions: (params?: TransactionParams) => Promise<void>;
}

export const useWallet = (): UseWalletReturn => {
    const [wallet, setWallet] = useState<WalletSummary | null>(null);
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWallet = async () => {
        try {
            setLoading(true);
            const response = await ButicalAPI.wallet.getSummary();
            // Unwrap API response: { status, data: { ...wallet } }
            const walletData = (response.data as any)?.data || response.data;
            setWallet(walletData);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch wallet');
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactions = async (params: TransactionParams = {}) => {
        try {
            const response = await ButicalAPI.wallet.getTransactions(params);
            // Unwrap API response: { status, data: { transactions: [...] } }
            const txData = (response.data as any)?.data || response.data;
            const txList = txData?.transactions || (Array.isArray(txData) ? txData : []);
            setTransactions(txList);
        } catch (err) {
            console.error('Failed to fetch transactions:', err);
            setTransactions([]);
        }
    };

    const withdraw = async (amount: number, phone: string): Promise<ApiResponse<WithdrawResponse>> => {
        try {
            setLoading(true);
            const response = await ButicalAPI.wallet.withdraw({ amount, phone });
            // Unwrap API response
            const withdrawData = (response.data as any)?.data || response.data;
            await fetchWallet(); // Refresh wallet after withdrawal
            return { success: true, data: withdrawData };
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Withdrawal failed';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWallet();
        fetchTransactions();
    }, []);

    return {
        wallet,
        transactions,
        loading,
        error,
        withdraw,
        refetch: fetchWallet,
        refetchTransactions: fetchTransactions,
    };
};

// ==================== REFERRALS HOOKS ====================

interface UseReferralsReturn {
    referralCode: string | null;
    myReferrals: ReferredUser[];
    totalEarnings: number;
    loading: boolean;
    error: string | null;
    applyCode: (code: string) => Promise<ApiResponse<ReferralApplyResponse>>;
    refetch: () => Promise<void>;
}

export const useReferrals = (): UseReferralsReturn => {
    const [referralCode, setReferralCode] = useState<string | null>(null);
    const [myReferrals, setMyReferrals] = useState<ReferredUser[]>([]);
    const [totalEarnings, setTotalEarnings] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchReferralData = async () => {
        try {
            setLoading(true);
            const [codeRes, referralsRes] = await Promise.all([
                ButicalAPI.referrals.getMyCode(),
                ButicalAPI.referrals.getMyReferrals(),
            ]);

            // Unwrap API response: { status, data: { referralCode: "ABC123" } }
            const codeData = (codeRes.data as any)?.data || codeRes.data;
            setReferralCode(codeData?.referralCode || codeData?.code || null);

            // Unwrap API response: { status, data: { referrals: [...], totalEarnings } }
            const referralsData = (referralsRes.data as any)?.data || referralsRes.data;
            setMyReferrals(referralsData?.referrals || []);
            setTotalEarnings(referralsData?.totalEarnings || 0);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch referral data');
            setMyReferrals([]);
        } finally {
            setLoading(false);
        }
    };

    const applyCode = async (code: string): Promise<ApiResponse<ReferralApplyResponse>> => {
        try {
            setLoading(true);
            const response = await ButicalAPI.referrals.applyCode(code);
            // Unwrap API response
            const applyData = (response.data as any)?.data || response.data;
            return { success: true, data: applyData };
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Failed to apply code';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReferralData();
    }, []);

    return {
        referralCode,
        myReferrals,
        totalEarnings,
        loading,
        error,
        applyCode,
        refetch: fetchReferralData,
    };
};

// ==================== ACCESS HOOKS ====================

interface UseAccessTokenReturn {
    accessData: AccessTokenResponse | null;
    loading: boolean;
    error: string | null;
    fetchAccess: (token: string) => Promise<void>;
}

export const useAccessToken = (token?: string): UseAccessTokenReturn => {
    const [accessData, setAccessData] = useState<AccessTokenResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAccess = async (accessToken: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await ButicalAPI.access.getEscortByToken(accessToken);
            // Unwrap API response: { status, data: { escortId, displayName, contactPhone, expiresAt } }
            const accessInfo = (response.data as any)?.data || response.data;
            setAccessData(accessInfo);
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Failed to fetch access data';
            setError(errorMsg);
            setAccessData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchAccess(token);
        }
    }, [token]);

    return {
        accessData,
        loading,
        error,
        fetchAccess,
    };
};

// ==================== REVIEWS HOOKS ====================

interface CreateReviewData {
    rating: number;
    comment: string;
}

interface UseReviewsReturn {
    reviews: Review[];
    loading: boolean;
    error: string | null;
    createReview: (reviewData: CreateReviewData) => Promise<ApiResponse<Review>>;
    refetch: () => Promise<void>;
}

export const useReviews = (type: 'escort' | 'dating', id: string | undefined): UseReviewsReturn => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchReviews = useCallback(async () => {
        if (!id) return;

        try {
            setLoading(true);
            const response = type === 'escort'
                ? await ButicalAPI.reviews.getEscortReviews(id)
                : await ButicalAPI.reviews.getDatingReviews(id);

            setReviews(Array.isArray(response.data) ? response.data : []);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch reviews');
            setReviews([]);
        } finally {
            setLoading(false);
        }
    }, [type, id]);

    const createReview = async (reviewData: CreateReviewData): Promise<ApiResponse<Review>> => {
        if (!id) {
            return { success: false, error: 'No ID provided' };
        }

        try {
            const response = type === 'escort'
                ? await ButicalAPI.reviews.createEscortReview(id, reviewData)
                : await ButicalAPI.reviews.createDatingReview(id, reviewData);

            await fetchReviews(); // Refresh reviews
            return { success: true, data: response.data };
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Failed to create review';
            return { success: false, error: errorMsg };
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    return { reviews, loading, error, createReview, refetch: fetchReviews };
};

// ==================== SUBSCRIPTION HOOKS ====================

interface UseSubscriptionReturn {
    subscription: Subscription | null;
    loading: boolean;
    error: string | null;
    hasDatingAccess: boolean;
    refetch: () => Promise<void>;
}

export const useSubscription = (): UseSubscriptionReturn => {
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [hasDatingAccess, setHasDatingAccess] = useState<boolean>(false);

    const fetchSubscription = useCallback(async () => {
        try {
            setLoading(true);
            const response = await ButicalAPI.users.getSubscription();
            // Unwrap API response: { status, data: { ...subscription } }
            const subscriptionData = (response.data as any)?.data || response.data;
            setSubscription(subscriptionData);
            setError(null);

            // Check if user has dating access based on subscription status
            // The subscription endpoint returns isSubscribed and role
            const isSubscribed = subscriptionData?.isSubscribed === true;
            const role = subscriptionData?.role;
            setHasDatingAccess(role === 'DATING_USER' || isSubscribed);
        } catch (err: any) {
            // If user doesn't have a subscription, that's not really an error
            setError(null);
            setSubscription(null);
            setHasDatingAccess(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Only fetch if we have a token
        if (TokenService.getAccessToken()) {
            fetchSubscription();
        } else {
            setLoading(false);
        }
    }, [fetchSubscription]);

    return {
        subscription,
        loading,
        error,
        hasDatingAccess,
        refetch: fetchSubscription,
    };
};