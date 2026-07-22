import { useClerk, useUser } from "@clerk/expo";
import { Pressable, Text, View, StyleSheet } from "react-native";

export default function Index() {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Welcome{user?.firstName ? `, ${user.firstName}` : ""}
      </Text>
      <Text style={styles.subtitle}>{user?.primaryEmailAddress?.emailAddress}</Text>
      <Pressable style={styles.button} onPress={() => signOut()}>
        <Text style={styles.buttonText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  button: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#208AEF",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
