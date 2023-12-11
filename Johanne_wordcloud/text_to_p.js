const para = document.getElementById('text');
fetch('text-en_clean/5.txt')
    .then(response => response.text())
    .then(text => {para.textContent += text})