const para = document.getElementById('text');
fetch('text-en_clean/4.txt')
    .then(response => response.text())
    .then(text => {para.textContent += text})