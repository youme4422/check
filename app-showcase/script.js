const revealNodes = document.querySelectorAll(".reveal");
const navLinks = document.querySelectorAll(".nav a");
const sections = document.querySelectorAll("main section[id], footer[id]");
const orbs = document.querySelectorAll(".orb");
const tiltNodes = document.querySelectorAll(".tilt");
const yearNode = document.getElementById("year");
const signalTimer = document.querySelector(".signal-card strong");

if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}

revealNodes.forEach((node, index) => {
  node.style.transitionDelay = `${index * 80}ms`;
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

revealNodes.forEach((node) => revealObserver.observe(node));

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.getAttribute("id");
      if (!id) return;
      navLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${id}`;
        link.classList.toggle("active", isActive);
      });
    });
  },
  { threshold: 0.45 }
);

sections.forEach((section) => sectionObserver.observe(section));

window.addEventListener("mousemove", (event) => {
  const xRatio = event.clientX / window.innerWidth - 0.5;
  const yRatio = event.clientY / window.innerHeight - 0.5;

  orbs.forEach((orb, index) => {
    const factor = index === 0 ? 20 : -16;
    orb.style.transform = `translate(${xRatio * factor}px, ${yRatio * factor}px)`;
  });

  tiltNodes.forEach((node, index) => {
    const depth = index === 0 ? 5 : 7;
    const rotateY = xRatio * depth;
    const rotateX = -yRatio * depth;
    node.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });
});

if (signalTimer) {
  let seconds = 23 * 3600 + 58 * 60 + 11;
  setInterval(() => {
    seconds = seconds > 0 ? seconds - 1 : 23 * 3600 + 58 * 60 + 11;
    const hour = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const min = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const sec = String(seconds % 60).padStart(2, "0");
    signalTimer.textContent = `${hour}:${min}:${sec}`;
  }, 1000);
}
