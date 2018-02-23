var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');

function openCreatePostModal() {
  createPostArea.style.display = 'block';

  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then((result) => {
      console.log(result.outcome);

      if (result.outcome === 'dismissed') {
        console.log('User cancelled the installation');
      } else {
        console.log('User added to home screen');
      }
    })
    
    deferredPrompt = null;
  }
}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);
