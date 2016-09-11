window.onload = function() {
    var ngr = nGrams(text, 5)
    var sent = generateSentence(ngr, 'Alice')
    document.getElementById('displ').innerHTML = sent
}
