// Footer year
document.addEventListener("DOMContentLoaded", () => {
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // Highlight active nav link
  const path = (location.pathname || "/").toLowerCase();
  document.querySelectorAll(".nav-links a").forEach(a => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    if ((path === "/" && (href === "/" || href.includes("index"))) || (href && path.includes(href.replace(".html","")))) {
      a.style.color = "var(--text)";
      a.style.borderColor = "rgba(255,255,255,0.14)";
      a.style.background = "rgba(255,255,255,0.06)";
    }
  });
});
