import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';

const API_URL = 'http://127.0.0.1:5000';
const USER_ID = 'demo-user-001';

type Reward = {
  position: string;
  amount: number;
};

type Winner = {
  name: string;
  position: string;
  initials: string;
};

type Competition = {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  totalSpots: number;
  availableSpots: number;
  status: string;

  prizePool?: number;
  entryFee?: number;
  category?: string;
  type?: string;
  certificate?: boolean;

  judgeName?: string;
  judgeTitle?: string;
  judgeExperience?: string;
  introVideo?: string;

  registrationDeadline?: string;
  submissionStartTime?: string;
  submissionEndTime?: string;
  resultDate?: string;

  aboutCompetition?: string;
  judgingParameters?: string[];
  rules?: string[];
  rewards?: Reward[];
  previousWinners?: Winner[];

  refundPolicy?: string;
  paymentProvider?: string;
  referralReward?: number;
};

type Registration = {
  competitionId: string;
  userId: string;
};

const fallbackWinners: Winner[] = [
  { name: 'Riya Shah', position: '1st Winner', initials: 'RS' },
  { name: 'Aarav Mehta', position: '1st Winner', initials: 'AM' },
  { name: 'Neha Verma', position: '2nd Winner', initials: 'NV' },
  { name: 'Ishita Chopra', position: '3rd Winner', initials: 'IC' },
];

const winnerImages = [
  'https://i.pravatar.cc/120?img=47',
  'https://i.pravatar.cc/120?img=12',
  'https://i.pravatar.cc/120?img=32',
  'https://i.pravatar.cc/120?img=49',
];

const fallbackRewards: Reward[] = [
  { position: '1st Winner', amount: 550 },
  { position: '2nd Winner', amount: 300 },
  { position: '3rd Winner', amount: 240 },
  { position: '4th Winner', amount: 200 },
  { position: '5th Winner', amount: 130 },
  { position: '6th Winner', amount: 80 },
];

export default function CompetitionScreen() {
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [loading, setLoading] = useState(true);
  const [registered, setRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'judging' | 'rules'>('about');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchCompetition = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/competition`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load competition');
      }

      setCompetition(data);

      try {
        const registrationResponse = await fetch(
          `${API_URL}/api/registrations/${USER_ID}`
        );

        if (registrationResponse.ok) {
          const registrations: Registration[] = await registrationResponse.json();
          setRegistered(
            registrations.some((item) => item.competitionId === data._id)
          );
        }
      } catch {
        setRegistered(false);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Unable to load competition');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetition();
  }, []);

  const handleRegister = async () => {
    if (
      !competition ||
      registered ||
      registering ||
      competition.availableSpots <= 0
    ) {
      return;
    }

    try {
      setRegistering(true);

      const response = await fetch(
        `${API_URL}/api/competition/${competition._id}/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: USER_ID }),
        }
      );

      const data = await response.json();

      if (response.status === 409) {
        setRegistered(true);
        Alert.alert('Already Registered', data.message || 'You are already registered.');
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setRegistered(true);

      if (data.competition) {
        setCompetition(data.competition);
      }

      Alert.alert('Registered', 'You have successfully registered for this competition.');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Something went wrong.');
    } finally {
      setRegistering(false);
    }
  };

  const bookedSpots = competition
    ? competition.totalSpots - competition.availableSpots
    : 0;

  const countdown = useMemo(() => {
    if (!competition) {
      return { days: '00', hours: '00', minutes: '00', seconds: '00' };
    }

    const target = competition.registrationDeadline
      ? new Date(competition.registrationDeadline).getTime()
      : new Date(`${competition.startDate}T23:59:59`).getTime();

    const difference = Math.max(target - now, 0);

    return {
      days: String(Math.floor(difference / 86400000)).padStart(2, '0'),
      hours: String(Math.floor((difference / 3600000) % 24)).padStart(2, '0'),
      minutes: String(Math.floor((difference / 60000) % 60)).padStart(2, '0'),
      seconds: String(Math.floor((difference / 1000) % 60)).padStart(2, '0'),
    };
  }, [competition, now]);

  const formatDate = (value?: string) => {
    if (!value) return '--';
    const date = new Date(value.includes('T') ? value : `${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
    });
  };

  const formatTime = (value?: string, fallback = '--') => {
    if (!value) return fallback;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return fallback;

    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="small" color="#078a96" />
        <Text style={styles.loadingText}>Loading competition...</Text>
      </View>
    );
  }

  if (!competition) {
    return (
      <View style={styles.loadingScreen}>
        <Text style={styles.errorTitle}>Unable to Load Competition</Text>
        <Pressable style={styles.retryButton} onPress={fetchCompetition}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const prizePool = competition.prizePool ?? 1500;
  const entryFee = competition.entryFee ?? 99;
  const category = competition.category ?? 'Dance';
  const type = competition.type ?? 'Multi-Win';
  const judgeName = competition.judgeName ?? 'Manju Dubey';
  const judgeTitle = competition.judgeTitle ?? 'Professional Kathak Dancer';
  const judgeExperience = competition.judgeExperience ?? '12+ Years of Experience';

  const winners = competition.previousWinners?.length
    ? competition.previousWinners
    : fallbackWinners;

  const rewards = competition.rewards?.length
    ? competition.rewards
    : fallbackRewards;

  const judgingParameters = competition.judgingParameters ?? [
    'Creativity',
    'Performance',
    'Presentation',
    'Technique',
    'Overall Impact',
  ];

  const rules = competition.rules ?? [
    'Submit original work.',
    'Follow the competition guidelines.',
    'Only valid registered participants can submit.',
    'Entries must be submitted before the deadline.',
  ];

  const progressPercent = competition.totalSpots
    ? Math.min(100, (bookedSpots / competition.totalSpots) * 100)
    : 0;

  return (
    <View style={styles.screen}>
      <View style={styles.pageShell}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* TOP BAR */}
          <View style={styles.topBar}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backIcon}>‹</Text>
              <Text style={styles.backText}>Go back</Text>
            </Pressable>

            <View style={styles.languageToggle}>
              <View style={styles.activeLanguage}>
                <Text style={styles.activeLanguageText}>ENG</Text>
              </View>
              <Text style={styles.inactiveLanguage}>हिंदी</Text>
            </View>
          </View>

          {/* MAIN HEADER */}
          <View style={styles.mainCard}>
            <View style={styles.titleRow}>
              <View style={styles.titleWrap}>
                <Text style={styles.mainTitle}>
                  {competition.name || 'Feedants Classical Dance'}
                </Text>

                <View style={styles.tagsRow}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{category}</Text>
                  </View>

                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{type}</Text>
                  </View>

                  {competition.certificate !== false && (
                    <Text style={styles.certificateText}>🏆 Winners get certificate</Text>
                  )}
                </View>
              </View>

              <Pressable
                style={styles.registeredBadge}
                onPress={handleRegister}
                disabled={registered || registering}
              >
                <Text style={styles.badgeCheck}>{registered ? '✓' : '+'}</Text>
                <Text style={styles.registeredText}>
                  {registering ? '...' : registered ? 'Registered' : 'Register'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.headerStats}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Prize Pool</Text>
                <Text style={styles.prizeValue}>₹ {prizePool.toLocaleString()}</Text>
              </View>

              <View style={styles.statBoxSmall}>
                <Text style={styles.statLabel}>Entry Fee</Text>
                <Text style={styles.entryValue}>₹ {entryFee}</Text>
              </View>

              <View style={styles.spotsBox}>
                <Text style={styles.spotsTitle}>👥 Only {competition.availableSpots} spots left</Text>
                <View style={styles.progressBackground}>
                  <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                </View>
                <Text style={styles.bookedText}>
                  {bookedSpots} / {competition.totalSpots} Booked
                </Text>
              </View>
            </View>
          </View>

          {/* JUDGE */}
          <View style={styles.card}>
            <View style={styles.judgeRow}>
              <Image
                source={{ uri: 'https://i.pravatar.cc/160?img=47' }}
                style={styles.judgePhoto}
              />

              <View style={styles.judgeInfo}>
                <Text style={styles.judgeLabel}>Judge</Text>
                <Text style={styles.judgeName}>{judgeName}</Text>
                <Text style={styles.judgeDetails}>{judgeTitle}</Text>
                <Text style={styles.judgeDetails}>{judgeExperience}</Text>
              </View>

              <Pressable
                style={styles.videoButton}
                onPress={() =>
                  Alert.alert(
                    'Intro Video',
                    competition.introVideo
                      ? competition.introVideo
                      : 'Judge introduction video.'
                  )
                }
              >
                <View style={styles.videoCircle}>
                  <Text style={styles.playIcon}>▶</Text>
                </View>
                <Text style={styles.videoText}>Intro Video</Text>
              </Pressable>
            </View>
          </View>

          {/* COUNTDOWN */}
          <View style={styles.countdownCard}>
            <Text style={styles.countdownIcon}>⌛</Text>
            <Text style={styles.countdownLabel}>Registration closes in</Text>
            <Text style={styles.countdownValue}>
              {countdown.days}d : {countdown.hours}h : {countdown.minutes}m : {countdown.seconds}s
            </Text>
            <Text style={styles.hurryText}>⏱ Hurry up!</Text>
          </View>

          {/* IMPORTANT DATES */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Important Dates</Text>

            <View style={styles.datesGrid}>
              <DateItem
                icon="▣"
                title="Register Before"
                date={formatDate(competition.startDate)}
                time={formatTime(competition.registrationDeadline, '11:59 PM')}
              />

              <DateItem
                icon="➤"
                title="Submission Starts"
                date={formatDate(competition.submissionStartTime ?? competition.startDate)}
                time={formatTime(competition.submissionStartTime, '04:00 AM')}
              />

              <DateItem
                icon="↥"
                title="Submission Ends"
                date={formatDate(competition.submissionEndTime ?? competition.endDate)}
                time={formatTime(competition.submissionEndTime, '11:55 PM')}
              />

              <DateItem
                icon="🏆"
                title="Result Date"
                date={formatDate(competition.resultDate ?? competition.endDate)}
                time={formatTime(competition.resultDate, '11:50 PM')}
              />
            </View>
          </View>

          {/* PREVIOUS WINNERS */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Previous Winners</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.winnersRow}
            >
              {winners.map((winner, index) => (
                <View key={`${winner.name}-${winner.position}`} style={styles.winnerCard}>
                  <View style={styles.winnerPhotoWrap}>
                    <Image
                      source={{ uri: winnerImages[index % winnerImages.length] }}
                      style={styles.winnerPhoto}
                    />
                    <View style={styles.smallPlay}>
                      <Text style={styles.smallPlayText}>▶</Text>
                    </View>
                  </View>

                  <Text style={styles.winnerName} numberOfLines={1}>
                    {winner.name}
                  </Text>
                  <Text style={styles.winnerPosition} numberOfLines={1}>
                    {winner.position}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* TABS */}
          <View style={styles.card}>
            <View style={styles.tabRow}>
              <TabButton
                label="About Competition"
                active={activeTab === 'about'}
                onPress={() => setActiveTab('about')}
              />
              <TabButton
                label="Judging Parameters"
                active={activeTab === 'judging'}
                onPress={() => setActiveTab('judging')}
              />
              <TabButton
                label="Rules & Eligibility"
                active={activeTab === 'rules'}
                onPress={() => setActiveTab('rules')}
              />
            </View>

            {activeTab === 'about' && (
              <View>
                <Text style={styles.bodyText}>
                  {competition.aboutCompetition || competition.description}
                </Text>
                <Text style={styles.bodyText}>
                  Participate from anywhere and showcase your talent.
                </Text>
                <Text style={styles.bodyText}>
                  Express your passion through traditional dance.
                </Text>
                <Text style={styles.viewMore}>View more⌄</Text>
              </View>
            )}

            {activeTab === 'judging' && (
              <View>
                {judgingParameters.map((item) => (
                  <View key={item} style={styles.bulletRow}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.bodyText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}

            {activeTab === 'rules' && (
              <View>
                {rules.map((item) => (
                  <View key={item} style={styles.bulletRow}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.bodyText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* REWARDS */}
          <View style={styles.card}>
            <View style={styles.rewardsTitleRow}>
              <Text style={styles.sectionTitle}>Rewards</Text>
              <Text style={styles.allPositions}>(All Positions)</Text>
            </View>

            {rewards.map((reward, index) => (
              <View key={reward.position} style={styles.rewardRow}>
                <Text style={styles.rewardIcon}>
                  {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : '☆'}
                </Text>
                <Text style={styles.rewardTitle}>{reward.position}</Text>
                <Text style={styles.rewardAmount}>₹ {reward.amount}</Text>
              </View>
            ))}
          </View>

          {/* DISCLAIMER */}
          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerIcon}>ⓘ</Text>
            <Text style={styles.disclaimerText}>
              Disclaimer: Only contributions from paid participants will be considered for judging.
            </Text>
          </View>

          {/* PAYMENT */}
          <View style={styles.paymentRow}>
            <Pressable
              style={styles.paymentCard}
              onPress={() => Alert.alert('Prize Money', 'Watch video to know more.')}
            >
              <View style={styles.mintPlay}>
                <Text style={styles.mintPlayText}>▶</Text>
              </View>
              <Text style={styles.paymentTitle}>How will you receive{'\n'}prize money?</Text>
              <Text style={styles.paymentSubtitle}>Watch video to know more</Text>
            </Pressable>

            <View style={styles.paymentCard}>
              <Text style={styles.policyRow}>▱ Refund policy</Text>
              <Text style={styles.policyRow}>
                ▱ Secure payments powered by {competition.paymentProvider ?? 'Razorpay'}
              </Text>
            </View>
          </View>

          {/* REFER */}
          <View style={styles.referCard}>
            <Text style={styles.referTitle}>📣 Refer & Earn more discount</Text>

            <View style={styles.referRow}>
              <View style={styles.referLinkBox}>
                <Text style={styles.referLinkText} numberOfLines={1}>
                  https://feedants.com/r/referral123
                </Text>

                <Pressable
                  style={styles.copyButton}
                  onPress={() => Alert.alert('Copied', 'Referral link copied.')}
                >
                  <Text style={styles.copyText}>Copy Link</Text>
                </Pressable>
              </View>

              <Pressable
                style={styles.referButton}
                onPress={() =>
                  Alert.alert('Refer Now', 'Referral sharing will be available soon.')
                }
              >
                <Text style={styles.referButtonText}>Refer Now</Text>
              </Pressable>
            </View>

            <Text style={styles.earnText}>
              You earn ₹{competition.referralReward ?? 10} for every signup
            </Text>
          </View>

          {/* USER FEEDBACK */}
          <Pressable
            style={styles.userFeedbackCard}
            onPress={() =>
              Alert.alert('User Reviews', 'Participant reviews will appear here.')
            }
          >
            <View>
              <Text style={styles.feedbackTitle}>💬 Hear From Our Users</Text>
              <Text style={styles.feedbackSubtitle}>
                See what participants say about Feedants
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </Pressable>

          {/* AD */}
          <View style={styles.adCard}>
            <Text style={styles.adIcon}>📣</Text>
            <Text style={styles.adText}>Ad Here</Text>
          </View>

          {/* UPLOAD */}
          <Pressable
            style={[
              styles.submitButton,
              !registered && styles.submitButtonDisabled,
            ]}
            onPress={() => {
              if (!registered) {
                Alert.alert(
                  'Registration Required',
                  'Please register before uploading your submission.'
                );
                return;
              }

              Alert.alert(
                'Upload Submission',
                'Submission upload screen will open here.'
              );
            }}
          >
            <Text style={styles.submitTitle}>Upload Submission</Text>
            <Text style={styles.submitSubtitle}>
              {registered ? 'Registered' : 'Registration Required'}
            </Text>
          </Pressable>

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNavOuter}>
        <View style={styles.bottomNav}>
          <NavItem icon="⌂" label="Home" onPress={() => router.push('/')} />
          <NavItem icon="⌕" label="Explore" onPress={() => router.push('/explore')} />

          <Pressable
            style={styles.plusButton}
            onPress={() => Alert.alert('Create', 'Create action coming soon.')}
          >
            <Text style={styles.plusText}>+</Text>
          </Pressable>

          <NavItem icon="🏆" label="Competitions" active onPress={() => {}} />
          <NavItem icon="●" label="Profile" onPress={() => router.push('/profile')} />
        </View>
      </View>
    </View>
  );
}

function DateItem({
  icon,
  title,
  date,
  time,
}: {
  icon: string;
  title: string;
  date: string;
  time: string;
}) {
  return (
    <View style={styles.dateItem}>
      <Text style={styles.dateIcon}>{icon}</Text>
      <View style={styles.dateTextWrap}>
        <Text style={styles.dateLabel}>{title}</Text>
        <Text style={styles.dateValue}>{date}</Text>
        <Text style={styles.timeValue}>{time}</Text>
      </View>
    </View>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.tabButton}>
      <Text style={[styles.tabText, active && styles.activeTabText]} numberOfLines={1}>
        {label}
      </Text>
      {active && <View style={styles.activeTabLine} />}
    </Pressable>
  );
}

function NavItem({
  icon,
  label,
  active,
  onPress,
}: {
  icon: string;
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.navItem} onPress={onPress}>
      <Text style={[styles.navIcon, active && styles.activeNavIcon]}>{icon}</Text>
      <Text style={[styles.navLabel, active && styles.activeNavLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f3f6f8',
    alignItems: 'center',
  },

  pageShell: {
    flex: 1,
    width: '100%',
    maxWidth: 390,
    backgroundColor: '#f3f6f8',
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 10,
    paddingTop: Platform.OS === 'web' ? 5 : 8,
    paddingBottom: 12,
  },

  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f6f8',
  },

  loadingText: {
    marginTop: 8,
    color: '#66748e',
    fontSize: 12,
  },

  errorTitle: {
    color: '#10264a',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },

  retryButton: {
    backgroundColor: '#0a8792',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 8,
  },

  retryText: {
    color: '#fff',
    fontWeight: '800',
  },

  topBar: {
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backIcon: {
    fontSize: 21,
    color: '#182d52',
    marginRight: 3,
    lineHeight: 21,
  },

  backText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#182d52',
  },

  languageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ebeff3',
    borderRadius: 13,
    padding: 2,
  },

  activeLanguage: {
    backgroundColor: '#0b8792',
    borderRadius: 11,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },

  activeLanguageText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 8,
  },

  inactiveLanguage: {
    color: '#223557',
    paddingHorizontal: 6,
    fontSize: 8,
    fontWeight: '600',
  },

  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5eaf0',
    padding: 9,
    marginBottom: 6,
  },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  titleWrap: {
    flex: 1,
    paddingRight: 5,
  },

  mainTitle: {
    color: '#10264a',
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '900',
  },

  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    flexWrap: 'wrap',
  },

  tag: {
    backgroundColor: '#f0f3f7',
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 4,
    marginRight: 4,
  },

  tagText: {
    color: '#233659',
    fontSize: 8,
    fontWeight: '700',
  },

  certificateText: {
    color: '#0a8791',
    fontSize: 8,
    fontWeight: '700',
    marginLeft: 2,
  },

  registeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#edf9f8',
    borderWidth: 1,
    borderColor: '#bde4e4',
    borderRadius: 11,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },

  badgeCheck: {
    color: '#0a8791',
    fontSize: 10,
    fontWeight: '900',
    marginRight: 3,
  },

  registeredText: {
    color: '#0a8791',
    fontSize: 8,
    fontWeight: '800',
  },

  headerStats: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 9,
  },

  statBox: {
    width: 82,
  },

  statBoxSmall: {
    width: 70,
  },

  statLabel: {
    color: '#77839a',
    fontSize: 7,
    marginBottom: 1,
  },

  prizeValue: {
    color: '#078998',
    fontSize: 21,
    lineHeight: 23,
    fontWeight: '900',
  },

  entryValue: {
    color: '#142a50',
    fontSize: 17,
    lineHeight: 20,
    fontWeight: '900',
  },

  spotsBox: {
    flex: 1,
    paddingLeft: 3,
  },

  spotsTitle: {
    color: '#008794',
    fontSize: 8,
    fontWeight: '800',
    marginBottom: 4,
  },

  progressBackground: {
    height: 4,
    borderRadius: 6,
    backgroundColor: '#dcebed',
    overflow: 'hidden',
  },

  progressFill: {
    height: 4,
    borderRadius: 6,
    backgroundColor: '#0a8791',
  },

  bookedText: {
    color: '#7a879c',
    fontSize: 7,
    marginTop: 3,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5eaf0',
    padding: 8,
    marginBottom: 6,
  },

  judgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  judgePhoto: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 8,
  },

  judgeInfo: {
    flex: 1,
  },

  judgeLabel: {
    color: '#758198',
    fontSize: 7,
  },

  judgeName: {
    color: '#142a50',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 1,
  },

  judgeDetails: {
    color: '#758198',
    fontSize: 7,
    marginTop: 1,
  },

  videoButton: {
    width: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },

  videoCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#eaf7f8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  playIcon: {
    color: '#0a8791',
    fontSize: 10,
  },

  videoText: {
    color: '#718099',
    fontSize: 6,
    marginTop: 2,
  },

  countdownCard: {
    backgroundColor: '#e7f6f7',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 7,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },

  countdownIcon: {
    fontSize: 10,
    marginRight: 4,
  },

  countdownLabel: {
    color: '#1c3152',
    fontSize: 7,
    fontWeight: '800',
    marginRight: 4,
  },

  countdownValue: {
    flex: 1,
    color: '#058695',
    fontSize: 8,
    fontWeight: '900',
  },

  hurryText: {
    color: '#058695',
    fontSize: 7,
    fontWeight: '800',
  },

  sectionTitle: {
    color: '#11264a',
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 5,
  },

  datesGrid: {
    borderWidth: 1,
    borderColor: '#e6ebef',
    borderRadius: 7,
    overflow: 'hidden',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  dateItem: {
    width: '50%',
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#edf1f4',
  },

  dateIcon: {
    color: '#078998',
    fontSize: 11,
    marginRight: 6,
    width: 12,
    textAlign: 'center',
  },

  dateTextWrap: {
    flex: 1,
  },

  dateLabel: {
    color: '#7b879b',
    fontSize: 6,
  },

  dateValue: {
    color: '#078998',
    fontSize: 8,
    fontWeight: '900',
    marginTop: 1,
  },

  timeValue: {
    color: '#203553',
    fontSize: 7,
    fontWeight: '700',
    marginTop: 1,
  },

  winnersRow: {
    gap: 5,
    paddingRight: 2,
  },

  winnerCard: {
    width: 76,
  },

  winnerPhotoWrap: {
    width: 72,
    height: 52,
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#ead0bf',
  },

  winnerPhoto: {
    width: '100%',
    height: '100%',
  },

  smallPlay: {
    position: 'absolute',
    right: 3,
    bottom: 3,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  smallPlayText: {
    color: '#078998',
    fontSize: 6,
  },

  winnerName: {
    color: '#172d50',
    fontSize: 6,
    fontWeight: '900',
    marginTop: 3,
  },

  winnerPosition: {
    color: '#078998',
    fontSize: 5.5,
    marginTop: 1,
  },

  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#e8edf1',
    marginBottom: 5,
  },

  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    position: 'relative',
  },

  tabText: {
    color: '#748096',
    fontSize: 6.5,
    fontWeight: '800',
  },

  activeTabText: {
    color: '#078998',
  },

  activeTabLine: {
    position: 'absolute',
    left: 3,
    right: 3,
    bottom: -1,
    height: 2,
    backgroundColor: '#078998',
    borderRadius: 2,
  },

  bodyText: {
    color: '#697791',
    fontSize: 7,
    lineHeight: 10,
    marginBottom: 2,
  },

  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  bullet: {
    color: '#078998',
    fontSize: 10,
    lineHeight: 10,
    marginRight: 4,
  },

  viewMore: {
    color: '#078998',
    fontSize: 7,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 2,
  },

  rewardsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  allPositions: {
    color: '#79859a',
    fontSize: 6,
    marginLeft: 3,
    marginTop: -4,
  },

  rewardRow: {
    height: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#eef2f5',
  },

  rewardIcon: {
    width: 18,
    fontSize: 9,
  },

  rewardTitle: {
    flex: 1,
    color: '#203553',
    fontSize: 7,
    fontWeight: '800',
  },

  rewardAmount: {
    color: '#078998',
    fontSize: 8,
    fontWeight: '900',
  },

  disclaimer: {
    backgroundColor: '#e9f7f8',
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  disclaimerIcon: {
    color: '#0a8791',
    fontSize: 10,
    marginRight: 5,
  },

  disclaimerText: {
    flex: 1,
    color: '#324764',
    fontSize: 6.5,
    lineHeight: 9,
  },

  paymentRow: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 6,
  },

  paymentCard: {
    flex: 1,
    minHeight: 82,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5eaf0',
    padding: 8,
  },

  mintPlay: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#d9f5f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },

  mintPlayText: {
    color: '#0a8791',
    fontSize: 10,
  },

  paymentTitle: {
    color: '#142b4f',
    fontSize: 7.5,
    lineHeight: 10,
    fontWeight: '900',
  },

  paymentSubtitle: {
    color: '#758198',
    fontSize: 6,
    marginTop: 3,
  },

  policyRow: {
    color: '#213653',
    fontSize: 7,
    lineHeight: 11,
    fontWeight: '800',
    marginBottom: 8,
  },

  referCard: {
    backgroundColor: '#e8fbef',
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
  },

  referTitle: {
    color: '#172c4e',
    fontSize: 8.5,
    fontWeight: '900',
    marginBottom: 6,
  },

  referRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  referLinkBox: {
    flex: 1,
    height: 28,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#badbdc',
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },

  referLinkText: {
    flex: 1,
    color: '#738197',
    fontSize: 6,
    paddingHorizontal: 5,
  },

  copyButton: {
    height: '100%',
    paddingHorizontal: 6,
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderColor: '#badbdc',
  },

  copyText: {
    color: '#078998',
    fontSize: 6.5,
    fontWeight: '800',
  },

  referButton: {
    backgroundColor: '#0a8791',
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 5,
    justifyContent: 'center',
  },

  referButtonText: {
    color: '#fff',
    fontSize: 7,
    fontWeight: '900',
  },

  earnText: {
    color: '#078998',
    fontSize: 6,
    marginTop: 4,
    textAlign: 'right',
  },

  userFeedbackCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5eaf0',
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  feedbackTitle: {
    color: '#172d50',
    fontSize: 8,
    fontWeight: '900',
  },

  feedbackSubtitle: {
    color: '#77839a',
    fontSize: 6,
    marginTop: 2,
  },

  arrow: {
    color: '#203553',
    fontSize: 18,
    lineHeight: 18,
  },

  adCard: {
    height: 30,
    borderRadius: 7,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#c6d0d9',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 6,
  },

  adIcon: {
    fontSize: 8,
    marginRight: 4,
  },

  adText: {
    color: '#768398',
    fontSize: 7,
    fontWeight: '800',
  },

  submitButton: {
    backgroundColor: '#078998',
    borderRadius: 7,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 6,
  },

  submitButtonDisabled: {
    backgroundColor: '#91adb0',
  },

  submitTitle: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
  },

  submitSubtitle: {
    color: '#e8fbfb',
    fontSize: 6.5,
    marginTop: 1,
  },

  bottomNavOuter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 56,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#e3e9ee',
    alignItems: 'center',
  },

  bottomNav: {
    width: '100%',
    maxWidth: 390,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  navItem: {
    width: 58,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  navIcon: {
    fontSize: 13,
    color: '#9aa5b5',
  },

  activeNavIcon: {
    color: '#078998',
  },

  navLabel: {
    color: '#98a3b3',
    fontSize: 5.5,
    marginTop: 2,
  },

  activeNavLabel: {
    color: '#078998',
    fontWeight: '900',
  },

  plusButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#078998',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -17,
    borderWidth: 3,
    borderColor: '#fff',
  },

  plusText: {
    color: '#fff',
    fontSize: 23,
    lineHeight: 25,
  },
});
