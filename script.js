const boxes = document.querySelectorAll('.box')

window.addEventListener('scroll', checkBoxes)

checkBoxes()

function checkBoxes() {
    const triggerBottom = window.innerHeight / 5 * 4

    boxes.forEach(box => {
        const boxTop = box.getBoundingClientRect().top

        if(boxTop < triggerBottom) {
            box.classList.add('show')
        } else {
            box.classList.remove('show')
        }
    })
}

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let uploadedImage = null;
let maskElement = document.getElementById('mask');
let container = document.getElementById('canvas-container');
let selectedMaskSrc = '';

// Set up canvas dimensions
canvas.width = 500;
canvas.height = 500;

// Move the mask using mouse drag
let offsetX = 0, offsetY = 0;
let isDragging = false;

maskElement.addEventListener('mousedown', function(e) {
    isDragging = true;
    const rect = maskElement.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
});

document.addEventListener('mousemove', function(e) {
    if (isDragging) {
        let mouseX = e.clientX - container.offsetLeft;
        let mouseY = e.clientY - container.offsetTop;
        maskElement.style.left = (mouseX - offsetX) + 'px';
        maskElement.style.top = (mouseY - offsetY) + 'px';
    }
});

document.addEventListener('mouseup', function() {
    isDragging = false;
});

// Upload image
document.getElementById('file-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const img = new Image();
        img.src = event.target.result;

        img.onload = function() {
            // Resize image to fit the canvas
            let scaleFactor = Math.min(canvas.width / img.width, canvas.height / img.height);
            let newWidth = img.width * scaleFactor;
            let newHeight = img.height * scaleFactor;

            // Draw the image on the canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, (canvas.width - newWidth) / 2, (canvas.height - newHeight) / 2, newWidth, newHeight);

            uploadedImage = {
                img: img,
                width: newWidth,
                height: newHeight
            };
        };
    };

    if (file) {
        reader.readAsDataURL(file);
    }
});

// Mask selection
const maskOptions = document.querySelectorAll('.mask-option');
maskOptions.forEach(mask => {
    mask.addEventListener('click', function() {
        // Remove the 'selected' class from all masks
        maskOptions.forEach(m => m.classList.remove('selected'));

        // Add 'selected' class to clicked mask
        this.classList.add('selected');

        // Set the mask source to the selected mask
        selectedMaskSrc = this.src;
        maskElement.src = selectedMaskSrc;
        maskElement.style.display = 'block';
    });
});

// Apply mask button
document.getElementById('apply-mask').addEventListener('click', function() {
    if (uploadedImage && selectedMaskSrc) {
        const rect = maskElement.getBoundingClientRect();
        const maskX = rect.left - container.offsetLeft;
        const maskY = rect.top - container.offsetTop;

        // Draw the mask on the canvas
        const maskImg = new Image();
        maskImg.src = selectedMaskSrc;

        maskImg.onload = function() {
            ctx.drawImage(maskImg, maskX, maskY, maskElement.width, maskElement.height);
        };

        // Hide the draggable mask after applying it to the canvas
        maskElement.style.display = 'none';
    }
});

// Reset button
document.getElementById('reset-btn').addEventListener('click', function() {
    if (uploadedImage) {
        // Clear the canvas and redraw the uploaded image
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(uploadedImage.img, (canvas.width - uploadedImage.width) / 2, (canvas.height - uploadedImage.height) / 2, uploadedImage.width, uploadedImage.height);
        
        // Reset the mask element
        maskElement.style.display = 'none';
        maskElement.style.top = '50px';
        maskElement.style.left = '50px';
    }
});

// Save the final image
document.getElementById('save-btn').addEventListener('click', function() {
    const link = document.createElement('a');
    link.download = 'masked-image.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});



