// Card tilt (เบา ๆ)
const card = document.querySelector(".card");
if (card) {
  document.addEventListener("mousemove", e => {
    const x = (window.innerWidth / 2 - e.clientX) / 40;
    const y = (window.innerHeight / 2 - e.clientY) / 40;
    card.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
  });
}
