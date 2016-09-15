changeTime = NaN // store the time of the last change in query input
idle = true // idle state, when the robot has no meaningful response: show some animations

function adjustFont (target, resetTime) {
    var txt = target.value ? target.value : target.textContent
    var fsize = (10/Math.log(txt.length+1)) * 0.7
    // TODO maybe scale down a little on smaller screens
    target.style.fontSize = fsize + 'em'

    if(resetTime && resetTime === true)
        changeTime = Date.now()
}

function binaryAnim () {
    var frame = ''
    for (var i = 0; i < 200; i++) {
        var rand = Math.random()
        if(rand < 0.000008 || rand > 0.999992)
            rand = '42'
        else
            rand = ' ' + Math.round(rand)
        frame += rand
    }
    globFrame = frame
    return frame
}

function checkIdleInput () {
    if (idle)
        requestAnimationFrame( function() {
            document.getElementById('response').textContent = binaryAnim()
        })

    if (isNaN(changeTime)) // NaN but no idle means that we're currently presenting a response
        return

    if (Date.now() - changeTime > 2000) { // more than 2 seconds of user waiting with some input
        changeTime = NaN
        var resp = generateResponse(ngr, document.getElementById('query').value)

        if(resp) {
            idle = false
            document.getElementById('response').textContent = resp
        }
        else // can't find any words in ngram table
            idle = true

        // adjust font-size of the response
        adjustFont(document.getElementById('response'), false)
    }
}


// Prepare the query/response handling.
window.addEventListener('load', function() {
    document.getElementById('query').oninput = function(e) { adjustFont(e.target, true) }
    adjustFont(document.getElementById('query'))

    document.getElementById('response').textContent = binaryAnim()
    adjustFont(document.getElementById('response'))

    // fires response generation and controls the idle antimation:
    window.setInterval(checkIdleInput, 400)
})
