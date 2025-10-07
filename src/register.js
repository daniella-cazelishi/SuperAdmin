function registerUser(email, password, role) {
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            return db.collection("users").doc(userCredential.user.uid).set({
                email: email,
                role: role // Set role as "admin" or "user"
            });
        })
        .then(() => {
            console.log("User registered successfully!");
        })
        .catch((error) => {
            console.error("Error registering:", error);
        });
}

// Example: Create an admin account
registerUser("admin@example.com", "password123", "admin");
