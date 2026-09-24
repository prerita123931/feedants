import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';

export default function CompetitionScreen() {
  return (
    <ScrollView style={styles.container}>
      
      <View style={styles.header}>
        <Text style={styles.title}>Competition Details</Text>
        <Text style={styles.subtitle}>Feedants Competition</Text>
      </View>

      <View style={styles.card}>

        <Text style={styles.competitionTitle}>
          Creative Content Challenge
        </Text>

        <Text style={styles.description}>
          Participate in the competition and showcase your creativity.
          Register before all available spots are filled.
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.label}>📅 Start Date</Text>
          <Text style={styles.value}>25 September 2026</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.label}>📅 End Date</Text>
          <Text style={styles.value}>30 September 2026</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.label}>👥 Available Spots</Text>
          <Text style={styles.value}>15 / 50</Text>
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.status}>● Registration Open</Text>
        </View>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Register / Participate</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },

  header: {
    backgroundColor: '#4f46e5',
    paddingTop: 60,
    paddingBottom: 25,
    paddingHorizontal: 20,
  },

  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
  },

  subtitle: {
    color: '#e0e7ff',
    fontSize: 15,
    marginTop: 5,
  },

  card: {
    backgroundColor: '#ffffff',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
  },

  competitionTitle: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },

  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6b7280',
    marginBottom: 20,
  },

  infoBox: {
    backgroundColor: '#f9fafb',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },

  label: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },

  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },

  statusContainer: {
    marginTop: 8,
    marginBottom: 20,
  },

  status: {
    color: '#16a34a',
    fontSize: 15,
    fontWeight: '600',
  },

  button: {
    backgroundColor: '#4f46e5',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },

  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});