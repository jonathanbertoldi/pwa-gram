let deferredPrompt;

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(() => {
      console.log('service worker registered');
    })
    .catch((err) => {
      console.log(err);
    });
}

window.addEventListener('beforeinstallprompt', (event) => {
  console.log('Before Install Prompt');

  event.preventDefault();
  deferredPrompt = event;

  return false;
});
