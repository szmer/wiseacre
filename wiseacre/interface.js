/* Whole global state goes here. */
langs = {'pl': {
		'corpusFile': 'nkjp-sel.txt',
		'waitText': 'Uruchamiam się!',
		'promptText': 'Napisz coś w tym polu i daj mi chwilę na namysł',
		'siteTitle': 'Porozmawiaj z Mundrusiem',
		'humanName': 'Człowiek',
		'machineName': 'Mundruś'},
		'en': {
		'corpusFile': 'eng-corpus.txt',
		'waitText': 'Getting ready!',
		'promptText': 'Type something here and let me think about the answer',
		'siteTitle': 'Chat with the Wiseacre',
		'humanName': 'Human',
		'machineName': 'Wiseacre'}}
lang = 'en'

// store the time of the last change in query input; reversed to NaN after each attempt to respond
changeTime = NaN
idle = true // idle state, when the robot has no meaningful response: show some animations

initAnimID = NaN // ID value of the interval function handling the init. animation
//initAnimStep = 0 // 0-3, tells which character from sequence | / - \ should be used

ngr = Object() // ngram object, made with NGrams(...)
/* End of global state. */

function adjustFont (target, resetTime) {
    var txt = target.value ? target.value : target.textContent
    var fsize = (10/Math.log(txt.length+1)) * 0.68
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

    if (isNaN(changeTime)) // NaN but not idle means that we're currently presenting a response
        return

    if (Date.now() - changeTime > 2000) { // more than 2 seconds of user waiting with some input

        // Block the animation.
        idle = false

        lock_screen = true

        changeTime = NaN
        var utterance = document.getElementById('query').value
        var resp = queryHandler(ngr, utterance, distrDifference)

        if (utterance && utterance.trim().length > 0)
            document.getElementById('log').innerHTML += '<strong>'+langs[lang].humanName+'</strong>: '+utterance+'<br>'

        if(resp && resp.length > 1)
            requestAnimationFrame( function() {
                document.getElementById('response').textContent = resp
                adjustFont(document.getElementById('response'), false)
                document.getElementById('log').innerHTML += '<strong>'+langs[lang].machineName+'</strong>: '+resp+'<br>'
            })
        else // can't find any words in ngram table
            requestAnimationFrame( function() {
                idle = true // unlock the animation

                // Start over the animation to have a text for resizing.
                document.getElementById('response').textContent = binaryAnim()
                adjustFont(document.getElementById('response'), false)
            })
    }
}

// It makes sense to call this function AFTER the corpus is downloaded by AJAX.
function initializeInterface (promptText) {
    initialized = true

    document.getElementById('query').disabled = false
    document.getElementById('query').textContent = promptText
    document.getElementById('query').oninput = function(e) { adjustFont(e.target, true) }
    adjustFont(document.getElementById('query'))

    document.getElementById('response').textContent = binaryAnim()
    adjustFont(document.getElementById('response'))

    // fires response generation and controls the idle antimation:
    window.setInterval(checkIdleInput, 400)
}

function doInitAnimation (waitText) {
    return window.setInterval(function () {
        requestAnimationFrame(function ()
                              {
//                                  var steps = [ '|', '/', '-', '\'' ]
//                                  var frame = steps[initAnimStep] + ' ' + waitText +
//                                      ' ' + steps[initAnimStep]
                                  document.getElementById('response').textContent = waitText
                                  adjustFont(document.getElementById('response'))
//                                  if (initAnimStep < 3)
//                                      initAnimStep ++
//                                  else
//                                      initAnimStep = 0
                              })
    }, 50)
}

// Prepare the query/response handling.
window.addEventListener('load', function() {
    document.title = langs[lang].siteTitle
    initAnimID = doInitAnimation(langs[lang].waitText)

    xhttp = new XMLHttpRequest()
    xhttp.open('GET', 'corpora/'+langs[lang].corpusFile, true)
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var text = this.responseText
            ngr = nGrams(text, 3)
            window.clearInterval(initAnimID)
            initializeInterface(langs[lang].promptText)
        }
    }
    xhttp.send()
})
