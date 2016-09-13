changeTime = NaN // store the time of the last change in query input

function adjustFont (target, resetTime) {
    var txt = target.value ? target.value : target.textContent
    var fsize = (10/Math.log(txt.length+1)) * 0.7
    // TODO maybe scale down a little on smaller screens
    target.style.fontSize = fsize + 'em'

    if(resetTime && resetTime === true)
        changeTime = Date.now()
}

function checkIdleInput () {
    if (isNaN(changeTime)) // NaN is assigned by default, signifies no input yet
        return
    if (Date.now() - changeTime > 2000) {// more than 2 seconds
        changeTime = NaN
        document.getElementById('response').textContent = generateResponse(ngr, document.getElementById('query').value)
        // adjust font-size of the response
        adjustFont(document.getElementById('response'), false)
    }
}

document.getElementById('query').oninput = function(e) { adjustFont(e.target, true) }
window.setInterval(checkIdleInput, 1000)
