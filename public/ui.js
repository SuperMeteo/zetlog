// Card tilt (เบา ๆ)
const card = document.querySelector(".card");
if (card) {
  document.addEventListener("mousemove", e => {
    const x = (window.innerWidth / 2 - e.clientX) / 40;
    const y = (window.innerHeight / 2 - e.clientY) / 40;
    card.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
  });
}
document.addEventListener("click", async (e) => {
  if (!e.target.classList.contains("delete-btn")) return;

  const userId = e.target.dataset.id;
  const username = e.target.dataset.name;

  const ok = confirm(`⚠ ต้องการลบผู้ใช้ "${username}" จริงหรือไม่?\nการกระทำนี้ไม่สามารถย้อนกลับได้`);

  if (!ok) return;

  try {
    const res = await fetch(`/users/${userId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      location.reload();
    } else {
      alert("❌ ลบผู้ใช้ไม่สำเร็จ");
    }
  } catch (err) {
    alert("❌ เกิดข้อผิดพลาด");
  }
});
