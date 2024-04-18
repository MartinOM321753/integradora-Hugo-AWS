document.addEventListener('DOMContentLoaded', () => {

    function listFiles() {
        fetch('http://localhost:3000/list')
            .then(response => response.json())
            .then(files => {
                const fileList = document.getElementById('card');
                fileList.innerHTML = '';
                files.forEach(file => {
                    const card = document.createElement('div');
                    card.className = 'card';

                    const contImgCard = document.createElement('div');

                    contImgCard.addEventListener('click', () => {
                        showPreview(file._id, file.name);
                    });
                    contImgCard.className = 'contimgcard';

                    const divImg = document.createElement('div');
                    divImg.className = 'divimg';

                    const image = document.createElement('img');
                    image.className = 'imgperfil';
                

                    divImg.appendChild(image);
                    contImgCard.appendChild(divImg);

                    const fileInfo = document.createElement('div');
                    fileInfo.className = 'file-info'; // Agrega la clase para estilos si es necesario

                    const fileName = document.createElement('p');
                    fileName.className='nombrearchivo'
                    fileName.textContent = file.name;

                    fileName.addEventListener('click', () => {
                        showPreview(file._id, file.name);
                    });

                    fileInfo.appendChild(fileName);

                    const fileType = document.createElement('p');
                    // Lógica para obtener el tipo de archivo y mostrar la información adecuada
                    switch(file.contentType) {
                        case 'image/jpeg':
                        case 'image/png':
                        case 'image/webp':  
                            image.src = '/images/imagen.png';
                            break;
                        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                            image.src = '/images/docx.png';
                            break;
                        case 'application/pdf':
                            image.src = '/images/pdf.png';
                            break;
                        case 'video/mp4':
                            image.src = '/images/video.png';
                            break;
                        case 'audio/mpeg':
                            image.src = '/images/audio.png';
                            break;
                        case 'application/x-zip-compressed':
                        case 'application/octet-stream':
                            image.src = '/images/compresed.png';
                            break; 
                        case 'text/plain':
                            image.src = '/images/text.png';
                            break; 
                        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
                          image.src = '/images/ppt.png';
                          break;  
                          case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
                              image.src= 'images/xlsx.png'
                          break;  

                        default:
                            image.src = '/images/archivo.png'; 
                            break;
                    }
                    fileInfo.appendChild(fileType);

                    contImgCard.appendChild(fileInfo);

                    card.appendChild(contImgCard);

                    const fotCard = document.createElement('div');
                    fotCard.className = 'fotcard';

                    const linkButton = document.createElement('button');
                    linkButton.innerHTML = '<img src="/images/link.svg" class="btnicons" alt="Link">';
                    linkButton.className='btnicons';
                    linkButton.onclick = function() {
                        copyLink(file._id);
                    };
                    fotCard.appendChild(linkButton);

                    const downloadButton = document.createElement('button');
                    downloadButton.innerHTML = '<img src="/images/download.svg"  class="btnicons" alt="Download">';
                    downloadButton.className='btnicons';

                    downloadButton.onclick = function() {
                        downloadFile(file._id);
                    };
                    fotCard.appendChild(downloadButton);

                    const deleteButton = document.createElement('button');
                    deleteButton.innerHTML = '<img src="/images/delete.svg"  class="btnicons" alt="Delete">';
                    deleteButton.className='btnicons';

                    deleteButton.onclick = function() {
                        deleteFile(file._id);
                    };
                    fotCard.appendChild(deleteButton);

                    card.appendChild(fotCard);

                    fileList.appendChild(card);
                });
            })
            .catch(error => {
                console.error('Error al obtener la lista de archivos:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Hubo un error al obtener la lista de archivos. Por favor, inténtalo de nuevo más tarde.',
                });
            });
    }



    function showPreview(fileId, filename) {
        const fileExtension = filename.split('.').pop().toLowerCase();
        const previewModal = document.getElementById('previewModal');
        const previewContent = document.getElementById('previewContent');
        previewContent.innerHTML = '';

        if (fileExtension === 'pdf') {
            Swal.fire({
                title: 'Previsualización de PDF',
                text: 'Estás a punto de ser redirigido para ver el PDF en tu navegador. ¿Deseas continuar?',
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'Sí, continuar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Redirige al navegador para previsualizar el PDF
                    window.open(`http://localhost:3000/preview/${fileId}`);
                }
            });
        } else {
            const filePath = `http://localhost:3000/download/${fileId}`;

            // Crear elementos para previsualización
            if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(fileExtension)) {
                const imagePreview = document.createElement('img');
                imagePreview.src = filePath;
                imagePreview.style.maxWidth = '100%'; 
                previewContent.appendChild(imagePreview);
                previewModal.style.display = "block";
            } else if (['mp4', 'webm', 'ogg'].includes(fileExtension)) {
                const videoPreview = document.createElement('video');
                videoPreview.src = filePath;
                videoPreview.controls = true;
                videoPreview.style.maxWidth = '100%';
                previewContent.appendChild(videoPreview);
                previewModal.style.display = "block";
            } else {
                Swal.fire({
                    title: 'Archivo no soportado',
                    text: 'Este tipos de archivo no tienen previaulización sera descargado en su lugar, ¿Desea continuar?',
                    icon: 'info',
                    showCancelButton: true,
                    confirmButtonText: 'Sí, continuar',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.open(`http://localhost:3000/download/${fileId}`);
                    }
                });
            }
        }
    }





    document.getElementById('closeModal').onclick = function() {
        document.getElementById('previewModal').style.display = "none";
    }

    const form = document.querySelector('form');

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Evitar que el formulario se envíe normalmente

        const formData = new FormData(form); // Obtener los datos del formulario

        try {
            const response = await fetch('http://localhost:3000/upload', {
                method: 'POST',
                body: formData,
            });
            console.log(response);
            if (!response.ok) {
                throw new Error('Error al subir el archivo');
            }

            // Agregar el nuevo archivo a la lista sin recargarla
            const newFile = await response.json();
            listFiles(); // Refrescar la lista de archivos
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Archivo subido exitosamente.',
            });

        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al subir el archivo. Por favor, inténtalo de nuevo más tarde.',
            });
        }
    });

    function copyLink(fileId) {
        const downloadURL = `http://localhost:3000/download/${fileId}`;
        const tempInput = document.createElement("input");
        tempInput.style = "position: absolute; left: -1000px; top: -1000px";
        tempInput.value = downloadURL;
        document.body.appendChild(tempInput);
        tempInput.select();
        tempInput.setSelectionRange(0, 99999); 
        document.execCommand("copy");
        document.body.removeChild(tempInput);
        Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'El enlace ha sido copiado en tu portapapeles.',
        });
    }

    function downloadFile(fileId) {
        window.location.href = `http://localhost:3000/download/${fileId}`;
        Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'El archivo se está descargando.',
        });
    }

    function deleteFile(fileId) {
        Swal.fire({
            title: 'Eliminar archivo',
            text: '¿Estás seguro de que quieres eliminar este archivo?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`http://localhost:3000/delete/${fileId}`, {
                    method: 'DELETE'
                })
                .then(response => response.json())
                .then(data => {
                    console.log(data.message); 
                    listFiles();
                    Swal.fire({
                        icon: 'success',
                        title: '¡Éxito!',
                        text: 'El archivo ha sido eliminado.',
                    });
                })
                .catch(error => {
                    console.error('Error al eliminar el archivo:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Hubo un error al eliminar el archivo. Por favor, inténtalo de nuevo más tarde.',
                    });
                });
            }
        });
    }

    listFiles();
});
