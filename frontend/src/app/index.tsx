import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';

const API_URL = 'http://127.0.0.1:5000';
type Competition = {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  totalSpots: number;
  availableSpots: number;
  status: string;
};

export default function HomeScreen() {
  const [competition, setCompetition] =
    useState<Competition | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCompetition = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/competition`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to load competition'
        );
      }

      setCompetition(data);
    } catch (error: any) {
      console.error(
        'Home competition error:',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetition();
  }, []);

  const openCompetition = () => {
    router.push('/competition');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>Feedants</Text>

        <Text style={styles.welcome}>
          Welcome back!
        </Text>

        <Text style={styles.headerText}>
          Discover competitions and showcase your creativity.
        </Text>
      </View>

      {/* Main Welcome Card */}
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>
          Ready to participate?
        </Text>

        <Text style={styles.welcomeDescription}>
          Join exciting competitions, submit your work,
          and showcase your talent.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={openCompetition}
        >
          <Text style={styles.primaryButtonText}>
            View Competition
          </Text>
        </TouchableOpacity>
      </View>

      {/* Current Competition */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Current Competition
        </Text>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator
              size="large"
              color="#4f46e5"
            />

            <Text style={styles.loadingText}>
              Loading competition...
            </Text>
          </View>
        ) : competition ? (
          <View style={styles.competitionCard}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {competition.status}
              </Text>
            </View>

            <Text style={styles.competitionName}>
              {competition.name}
            </Text>

            <Text style={styles.competitionDescription}>
              {competition.description}
            </Text>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>
                  Start Date
                </Text>

                <Text style={styles.infoValue}>
                  {competition.startDate}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>
                  End Date
                </Text>

                <Text style={styles.infoValue}>
                  {competition.endDate}
                </Text>
              </View>
            </View>

            <View style={styles.spotBox}>
              <Text style={styles.spotLabel}>
                Available Spots
              </Text>

              <Text style={styles.spotValue}>
                {competition.availableSpots} /{' '}
                {competition.totalSpots}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={openCompetition}
            >
              <Text style={styles.secondaryButtonText}>
                View Details
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              Competition could not be loaded.
            </Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchCompetition}
            >
              <Text style={styles.retryText}>
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Quick Actions
        </Text>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={openCompetition}
          >
            <Text style={styles.actionTitle}>
              Competitions
            </Text>

            <Text style={styles.actionDescription}>
              Explore available competitions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() =>
              Alert.alert(
                'Coming Soon',
                'My Registrations will be available soon.'
              )
            }
          >
            <Text style={styles.actionTitle}>
              My Registrations
            </Text>

            <Text style={styles.actionDescription}>
              View your registered competitions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() =>
              Alert.alert(
                'Coming Soon',
                'Profile section will be available soon.'
              )
            }
          >
            <Text style={styles.actionTitle}>
              Profile
            </Text>

            <Text style={styles.actionDescription}>
              Manage your Feedants profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Feedants - Participate. Create. Grow.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },

  contentContainer: {
    paddingBottom: 40,
  },

  header: {
    backgroundColor: '#4f46e5',
    paddingTop: 55,
    paddingBottom: 35,
    paddingHorizontal: 24,
  },

  logo: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  welcome: {
    color: '#ffffff',
    fontSize: 25,
    fontWeight: 'bold',
  },

  headerText: {
    color: '#e0e7ff',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },

  welcomeCard: {
    backgroundColor: '#ffffff',
    margin: 20,
    padding: 22,
    borderRadius: 18,
    elevation: 4,
  },

  welcomeTitle: {
    color: '#111827',
    fontSize: 22,
    fontWeight: 'bold',
  },

  welcomeDescription: {
    color: '#6b7280',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 20,
  },

  primaryButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  section: {
    marginHorizontal: 20,
    marginBottom: 22,
  },

  sectionTitle: {
    color: '#111827',
    fontSize: 21,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  competitionCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    elevation: 3,
  },

  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },

  statusText: {
    color: '#15803d',
    fontSize: 13,
    fontWeight: '600',
  },

  competitionName: {
    color: '#111827',
    fontSize: 22,
    fontWeight: 'bold',
  },

  competitionDescription: {
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 18,
  },

  infoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },

  infoItem: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 10,
  },

  infoLabel: {
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 5,
  },

  infoValue: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
  },

  spotBox: {
    backgroundColor: '#eef2ff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
  },

  spotLabel: {
    color: '#6366f1',
    fontSize: 13,
  },

  spotValue: {
    color: '#312e81',
    fontSize: 21,
    fontWeight: 'bold',
    marginTop: 3,
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: '#4f46e5',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },

  secondaryButtonText: {
    color: '#4f46e5',
    fontSize: 15,
    fontWeight: 'bold',
  },

  actionsContainer: {
    gap: 12,
  },

  actionCard: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 14,
    elevation: 2,
  },

  actionTitle: {
    color: '#111827',
    fontSize: 17,
    fontWeight: 'bold',
  },

  actionDescription: {
    color: '#6b7280',
    fontSize: 13,
    marginTop: 5,
  },

  loadingBox: {
    backgroundColor: '#ffffff',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
  },

  loadingText: {
    color: '#6b7280',
    marginTop: 10,
  },

  errorBox: {
    backgroundColor: '#ffffff',
    padding: 25,
    borderRadius: 16,
    alignItems: 'center',
  },

  errorText: {
    color: '#dc2626',
    fontSize: 15,
    marginBottom: 15,
  },

  retryButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 25,
    paddingVertical: 11,
    borderRadius: 9,
  },

  retryText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },

  footer: {
    alignItems: 'center',
    paddingTop: 8,
  },

  footerText: {
    color: '#9ca3af',
    fontSize: 13,
  },
});