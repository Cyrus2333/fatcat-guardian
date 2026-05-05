const yearNode = document.getElementById('year');
const contactModal = document.querySelector('[data-contact-modal]');
const openContactButton = document.querySelector('[data-contact-open]');
const closeContactButtons = document.querySelectorAll('[data-contact-close]');
const scrollTopTrigger = document.querySelector('[data-scroll-top]');

if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}

function setContactModalOpen(isOpen) {
  if (!contactModal) {
    return;
  }

  contactModal.hidden = !isOpen;
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

if (openContactButton) {
  openContactButton.addEventListener('click', () => {
    setContactModalOpen(true);
  });
}

if (scrollTopTrigger) {
  scrollTopTrigger.addEventListener('click', (event) => {
    event.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });
}

for (const button of closeContactButtons) {
  button.addEventListener('click', () => {
    setContactModalOpen(false);
  });
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    setContactModalOpen(false);
  }
});
