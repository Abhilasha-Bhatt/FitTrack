const signupPanel = document.getElementById("v-signup");
const loginPanel = document.getElementById("v-login");

window.showView = (view) => {
  signupPanel.classList.toggle("hidden", view !== "signup");
  loginPanel.classList.toggle("hidden", view !== "login");
};

const postJson = async (url, data) => {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
};

window.doSignup = async () => {
  const name = document.getElementById("su-name").value.trim();
  const email = document.getElementById("su-email").value.trim().toLowerCase();
  const pass = document.getElementById("su-pass").value;
  const goal = document.getElementById("su-goal").value.trim();

  if (!name || !email || pass.length < 6) {
    alert("Please enter name, email, and a password of at least 6 characters.");
    return;
  }

  try {
    const result = await postJson("signup.php", { name, email, password: pass, goal });
    if (result.success) {
      localStorage.setItem('fittrackEmail', email);
      if (result.user) {
        localStorage.setItem('user', JSON.stringify(result.user));
      }
      window.location.href = `../stats/onboarding.html?email=${encodeURIComponent(email)}`;
    } else {

      alert(result.error || "Signup failed. Please try again.");
    }
  } catch (error) {
    console.error(error);
    alert("Unable to connect to the server. Please check your PHP setup.");
  }
};

window.doLogin = async () => {
  const email = document.getElementById("li-email").value.trim().toLowerCase();
  const pass = document.getElementById("li-pass").value;

  if (!email || !pass) {
    alert("Please enter both email and password.");
    return;
  }

  try {
    const result = await postJson("login.php", { email, password: pass });
    if (result.success) {
      localStorage.setItem('fittrackEmail', email);
      if (result.user) {
        localStorage.setItem('user', JSON.stringify(result.user));
      }
      window.location.href = `../dashboard/dashboard.html?email=${encodeURIComponent(email)}`;

    } else {
      alert(result.error || "Email or password is incorrect.");
    }
  } catch (error) {
    console.error(error);
    alert("Unable to connect to the server. Please check your PHP setup.");
  }
};
