document.getElementById('toOrange').addEventListener('click', function() {
    document.getElementById('screen1').classList.add('hidden');
    document.getElementById('screen2').classList.remove('hidden');
});

document.getElementById('toBlack').addEventListener('click', function() {
    document.getElementById('screen2').classList.add('hidden');
    document.getElementById('screen1').classList.remove('hidden');
});
