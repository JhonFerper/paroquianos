// Selecionando os elementos necessários do DOM
const gallery = document.querySelector('.gallery');
const images = gallery.querySelectorAll('img');
const overlay = document.querySelector('.overlay');
const overlayImg = overlay.querySelector('.overlay-img');
const closeButton = overlay.querySelector('.close');

let currentImageIndex = 0;

// Adicionando um listener de clique em cada imagem
images.forEach((image, index) => {
  image.addEventListener('click', () => {
    currentImageIndex = index;
    overlayImg.src = image.src;
    overlay.classList.add('open');
  });
});

// Adicionando um listener de clique no botão de fechar
closeButton.addEventListener('click', () => {
  overlay.classList.remove('open');
});

// Criando um listener de teclado para o carrossel
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') {
    currentImageIndex--;
    if (currentImageIndex < 0) {
      currentImageIndex = images.length - 1;
    }
    overlayImg.src = images[currentImageIndex].src;
  } else if (event.key === 'ArrowRight') {
    currentImageIndex++;
    if (currentImageIndex >= images.length) {
      currentImageIndex = 0;
    }
    overlayImg.src = images[currentImageIndex].src;
  }
});