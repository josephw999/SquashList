import * as React from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    try {
      await signUp.create({
        emailAddress,
        password,
        username,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/");
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <View style={styles.container}>
      {pendingVerification ? (
        <>
          <Text style={styles.title}>Verify Your Email</Text>
          <TextInput
            style={styles.input}
            value={code}
            placeholder="Verification code"
            onChangeText={setCode}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.button} onPress={onVerifyPress}>
            <Text style={styles.buttonText}>Verify</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.title}>Create Account</Text>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            value={emailAddress}
            placeholder="Email address"
            onChangeText={setEmailAddress}
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            value={username}
            placeholder="Username"
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            value={password}
            placeholder="Password"
            secureTextEntry
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.button} onPress={onSignUpPress}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Link href="/sign-in">
              <Text style={styles.footerLink}>Sign in</Text>
            </Link>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#4F46E5",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    marginRight: 6,
    color: "#555",
  },
  footerLink: {
    color: "#4F46E5",
    fontWeight: "500",
  },
});
