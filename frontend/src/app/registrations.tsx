import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';

const API_URL = 'http://127.0.0.1:5000';
const USER_ID = 'demo-user-001';

type Registration = {
  _id: string;
  competitionId: string;
  userId: string;
  registeredAt: string;
  competition: {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    totalSpots: number;
    availableSpots: number;
    status: string;
  };
};

export default function RegistrationsScreen() {
  const [registrations, setRegistrations] = useState<
    Registration[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        `${API_URL}/api/registrations/${USER_ID}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to fetch registrations'
        );
      }

      setRegistrations(data);
    } catch (err: any) {
      console.error(
        'Registrations error:',
        err
      );

      setError(
        err.message || 'Unable to connect to server'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator
          size="large"
          color="#4f46e5"
        />

        <Text style={styles.loadingText}>
          Loading your registrations...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>
          Unable to Load Registrations
        </Text>

        <Text style={styles.errorText}>
          {error}
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchRegistrations}
        >
          <Text style={styles.retryButtonText}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          My Registrations
        </Text>

        <Text style={styles.headerSubtitle}>
          Your registered competitions
        </Text>
      </View>

      {registrations.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>
            No Registrations Yet
          </Text>

          <Text style={styles.emptyText}>
            You haven't registered for any competition yet.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/competition')}
          >
            <Text style={styles.primaryButtonText}>
              Explore Competition
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        registrations.map((item) => (
          <View
            key={item._id}
            style={styles.registrationCard}
          >
            {/* Status */}
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                REGISTERED
              </Text>
            </View>

            {/* Competition Name */}
            <Text style={styles.competitionName}>
              {item.competition.name}
            </Text>

            {/* Description */}
            <Text style={styles.description}>
              {item.competition.description}
            </Text>

            {/* Dates */}
            <View style={styles.infoRow}>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>
                  Start Date
                </Text>

                <Text style={styles.infoValue}>
                  {item.competition.startDate}
                </Text>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>
                  End Date
                </Text>

                <Text style={styles.infoValue}>
                  {item.competition.endDate}
                </Text>
              </View>
            </View>

            {/* Registration Date */}
            <View style={styles.fullInfoBox}>
              <Text style={styles.infoLabel}>
                Registered On
              </Text>

              <Text style={styles.infoValue}>
                {new Date(
                  item.registeredAt
                ).toLocaleDateString()}
              </Text>
            </View>

            {/* Competition Status */}
            <View style={styles.fullInfoBox}>
              <Text style={styles.infoLabel}>
                Competition Status
              </Text>

              <Text style={styles.activeStatus}>
                {item.competition.status}
              </Text>
            </View>

            {/* Button */}
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() =>
                router.push('/competition')
              }
            >
              <Text style={styles.secondaryButtonText}>
                View Competition
              </Text>
            </TouchableOpacity>
          </View>
        ))
      )}
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
    paddingBottom: 30,
    paddingHorizontal: 22,
  },

  headerTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
  },

  headerSubtitle: {
    color: '#e0e7ff',
    fontSize: 15,
    marginTop: 6,
  },

  registrationCard: {
    backgroundColor: '#ffffff',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
  },

  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },

  statusText: {
    color: '#15803d',
    fontSize: 12,
    fontWeight: 'bold',
  },

  competitionName: {
    color: '#111827',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  description: {
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 18,
  },

  infoRow: {
    flexDirection: 'row',
    gap: 12,
  },

  infoBox: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },

  fullInfoBox: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
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

  activeStatus: {
    color: '#16a34a',
    fontSize: 14,
    fontWeight: '600',
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: '#4f46e5',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 5,
  },

  secondaryButtonText: {
    color: '#4f46e5',
    fontSize: 15,
    fontWeight: 'bold',
  },

  emptyCard: {
    backgroundColor: '#ffffff',
    margin: 20,
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 3,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },

  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 20,
  },

  primaryButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 25,
    paddingVertical: 13,
    borderRadius: 10,
  },

  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
    backgroundColor: '#f5f7fb',
  },

  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 15,
  },

  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },

  errorText: {
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 18,
  },

  retryButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 10,
  },

  retryButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});