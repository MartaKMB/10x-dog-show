/* eslint-disable no-undef */
// Obsługa wylogowania z przekierowaniem
document.addEventListener("DOMContentLoaded", function () {
  const logoutForms = document.querySelectorAll(
    'form[action="/api/auth/logout"]',
  );

  logoutForms.forEach((form) => {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      try {
        const response = await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          // Przekieruj na stronę główną po wylogowaniu
          window.location.href = "/";
        } else {
          console.error("Błąd wylogowania:", response.statusText);
        }
      } catch (error) {
        console.error("Błąd wylogowania:", error);
      }
    });
  });
});
